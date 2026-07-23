// Server-only engine for KYC-free UPI auto-verification.
//
// A plain UPI QR has no payment callback, so we reconcile against the bank's own
// credit SMS (forwarded to /api/upi-sms). We parse the amount + UPI reference
// (UTR), record it as a bank_transactions row, and auto-approve any pending
// payment_submission whose student-entered UTR AND amount both match. Because a
// bank credit can only be recorded via the secret webhook, and approval requires
// the UTR to match a real credit, nobody can self-approve a payment.
//
// This module is server-only (imports the service-role client) — never import it
// from client code; only from server functions / server routes via dynamic import.

import type { Database } from "@/integrations/supabase/types";
import { normalizeUtr } from "@/lib/payments";

type Submission = Database["public"]["Tables"]["payment_submissions"]["Row"];

function extractAmount(text: string): number | null {
  const amtRe = /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi;
  const matches: { value: number; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = amtRe.exec(text)) !== null) {
    const val = Math.round(parseFloat(m[1].replace(/,/g, "")));
    if (!Number.isNaN(val)) matches.push({ value: val, index: m.index });
  }
  if (matches.length === 0) return null;
  // Prefer the amount nearest the credit keyword (avoids grabbing "Avl bal Rs …").
  const kw = text.toLowerCase().search(/credited|received|deposited/);
  if (kw < 0) return matches[0].value;
  matches.sort((a, b) => Math.abs(a.index - kw) - Math.abs(b.index - kw));
  return matches[0].value;
}

function extractUtr(text: string): string | null {
  const labelled = text.match(
    /(?:upi(?:\s*ref(?:erence)?(?:\s*no)?)?|ref(?:erence)?(?:\s*no)?|rrn|txn\s*id|transaction\s*id|utr)[^0-9]{0,8}(\d{12})/i,
  );
  if (labelled) return labelled[1];
  const any12 = text.match(/\b(\d{12})\b/);
  return any12 ? any12[1] : null;
}

function extractSender(text: string): string | null {
  const vpa = text.match(/([a-z0-9._-]{2,}@[a-z]{2,})/i);
  if (vpa) return vpa[1];
  const from = text.match(/from\s+([A-Za-z][A-Za-z .]{1,40})/);
  return from ? from[1].trim() : null;
}

// Parse a bank/UPI SMS. Only treated as a usable credit when it looks like an
// incoming credit AND carries both an amount and a UTR.
export function parseBankSms(text: string): {
  isCredit: boolean;
  amount: number | null;
  utr: string | null;
  sender: string | null;
} {
  const lower = text.toLowerCase();
  const looksCredit = /(credited|received|deposited)/.test(lower);
  const looksDebit = /(debited|withdrawn|spent|debit for|paid to)/.test(lower);
  return {
    isCredit: looksCredit && !looksDebit,
    amount: extractAmount(text),
    utr: extractUtr(text),
    sender: extractSender(text),
  };
}

// Grant the paid state for an approved submission. Shared by manual admin
// approval and automatic verification so both behave identically.
export async function applyApproval(
  submission: Submission,
  opts: {
    via: "auto" | "manual";
    bankTxnId?: string | null;
    reviewedBy?: string | null;
    adminNote?: string | null;
  },
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (submission.kind === "enrollment" && submission.course_id && submission.user_id) {
    const purchaseDetails = {
      status: "active",
      package_title: submission.package_title,
      instrument: submission.instrument,
      amount_paid: submission.amount,
      payment_id: submission.upi_reference ? `UPI:${submission.upi_reference}` : "UPI",
    };

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", submission.user_id)
      .eq("course_id", submission.course_id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    const { error: enrollError } = existing
      ? await supabaseAdmin
          .from("enrollments")
          .update({ ...purchaseDetails, enrolled_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await supabaseAdmin.from("enrollments").insert({
          user_id: submission.user_id,
          course_id: submission.course_id,
          level: "Beginner",
          progress: 0,
          ...purchaseDetails,
        });
    if (enrollError) throw new Error(enrollError.message);

    await supabaseAdmin.from("leads").insert({
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      course_interest: submission.package_title,
      message: `Course Enrollment Purchase (UPI ${opts.via}, approved) — Package: ${submission.package_title}, Amount: Rs. ${submission.amount}. UTR: ${submission.upi_reference}`,
      source: "course_purchase",
    });
  } else if (submission.kind === "demo" && submission.day && submission.slot) {
    try {
      const { sendDemoConfirmationEmail } = await import("@/lib/email.server");
      await sendDemoConfirmationEmail({
        to: submission.email,
        name: submission.name,
        day: submission.day,
        slot: submission.slot,
        courseInterest: submission.package_title || undefined,
      });
    } catch (emailErr) {
      console.error("[Payments] Demo confirmation email failed:", emailErr);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("payment_submissions")
    .update({
      status: "approved",
      verified_via: opts.via,
      bank_txn_id: opts.bankTxnId ?? null,
      admin_note: opts.adminNote ?? null,
      reviewed_by: opts.reviewedBy ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submission.id);
  if (updateError) throw new Error(updateError.message);
}

// Match a freshly recorded bank credit to the oldest pending submission whose
// UTR and amount both agree, and approve it.
async function matchTxnToSubmission(txnId: string, utr: string, amount: number): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: subs, error } = await supabaseAdmin
    .from("payment_submissions")
    .select("*")
    .eq("status", "pending")
    .eq("amount", amount)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const match = (subs ?? []).find((s) => normalizeUtr(s.upi_reference) === utr);
  if (!match) return false;

  await applyApproval(match, { via: "auto", bankTxnId: txnId });
  await supabaseAdmin
    .from("bank_transactions")
    .update({ matched_submission_id: match.id })
    .eq("id", txnId);
  return true;
}

// Webhook entry point: record a forwarded bank SMS and try to auto-approve.
// Idempotent on the UTR — a replayed SMS won't double-approve.
export async function ingestBankSms(
  rawText: string,
  senderHint?: string,
): Promise<{ ok: true; ignored?: boolean; recorded?: boolean; matched?: boolean }> {
  const parsed = parseBankSms(rawText);
  if (!parsed.isCredit || !parsed.utr || !parsed.amount) {
    return { ok: true, ignored: true };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing, error: exErr } = await supabaseAdmin
    .from("bank_transactions")
    .select("id, matched_submission_id")
    .eq("utr", parsed.utr)
    .maybeSingle();
  if (exErr) throw new Error(exErr.message);

  let txnId: string;
  if (existing) {
    if (existing.matched_submission_id) return { ok: true, recorded: true, matched: true };
    txnId = existing.id;
  } else {
    const { data: ins, error: insErr } = await supabaseAdmin
      .from("bank_transactions")
      .insert({
        utr: parsed.utr,
        amount: parsed.amount,
        sender: parsed.sender ?? senderHint ?? null,
        raw_message: rawText,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    txnId = ins.id;
  }

  const matched = await matchTxnToSubmission(txnId, parsed.utr, parsed.amount);
  return { ok: true, recorded: true, matched };
}

// Submit-time entry point: when a student submits a UTR, the matching bank credit
// may already have arrived — if so, approve immediately.
export async function tryAutoVerifySubmission(submission: Submission): Promise<boolean> {
  const utr = normalizeUtr(submission.upi_reference);
  if (!utr) return false;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: txn, error } = await supabaseAdmin
    .from("bank_transactions")
    .select("id, amount")
    .eq("utr", utr)
    .is("matched_submission_id", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!txn || txn.amount !== submission.amount) return false;

  await applyApproval(submission, { via: "auto", bankTxnId: txn.id });
  await supabaseAdmin
    .from("bank_transactions")
    .update({ matched_submission_id: submission.id })
    .eq("id", txn.id);
  return true;
}
