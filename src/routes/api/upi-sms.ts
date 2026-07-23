import { createFileRoute } from "@tanstack/react-router";

// Webhook for KYC-free UPI auto-verification. An Android SMS-forwarding app POSTs
// each incoming bank SMS here; we parse the amount + UTR and auto-approve any
// pending payment submission whose UTR and amount match (see payments.server.ts).
//
// Auth: a shared secret in `UPI_WEBHOOK_SECRET` (env), sent as the
// `x-webhook-secret` header or a `?token=` query param. Without it, anyone could
// forge a "payment", so the secret must be long and random.
//
// Configure the forwarder to POST to:
//   https://<your-domain>/api/upi-sms?token=<UPI_WEBHOOK_SECRET>
// with the message body in a `message` field (JSON, form, or raw text all work).

export const Route = createFileRoute("/api/upi-sms")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.UPI_WEBHOOK_SECRET;
        if (!secret) {
          return Response.json(
            { ok: false, error: "Auto-verification is not configured (UPI_WEBHOOK_SECRET)." },
            { status: 503 },
          );
        }

        const url = new URL(request.url);
        const provided =
          request.headers.get("x-webhook-secret") ?? url.searchParams.get("token") ?? "";
        // Reject unless the secret matches exactly.
        if (provided.length !== secret.length || provided !== secret) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        // SMS-forwarder apps vary — accept JSON, form-encoded, or raw text.
        let text = "";
        let from = "";
        const contentType = request.headers.get("content-type") ?? "";
        try {
          if (contentType.includes("application/json")) {
            const body = (await request.json()) as Record<string, unknown>;
            text = String(body.message ?? body.text ?? body.sms ?? body.content ?? body.body ?? "");
            from = String(body.from ?? body.sender ?? body.address ?? "");
          } else if (
            contentType.includes("application/x-www-form-urlencoded") ||
            contentType.includes("multipart/form-data")
          ) {
            const form = await request.formData();
            text = String(
              form.get("message") ??
                form.get("text") ??
                form.get("sms") ??
                form.get("content") ??
                "",
            );
            from = String(form.get("from") ?? form.get("sender") ?? form.get("address") ?? "");
          } else {
            text = await request.text();
          }
        } catch {
          return Response.json({ ok: false, error: "Could not read body" }, { status: 400 });
        }

        if (!text.trim()) {
          return Response.json({ ok: false, error: "Empty message" }, { status: 400 });
        }

        try {
          const { ingestBankSms } = await import("@/lib/payments.server");
          const result = await ingestBankSms(text, from || undefined);
          return Response.json(result);
        } catch (err) {
          console.error("[upi-sms] ingest failed:", err);
          return Response.json({ ok: false, error: "Internal error" }, { status: 500 });
        }
      },
    },
  },
});
