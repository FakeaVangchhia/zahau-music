import nodemailer from "nodemailer";

export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export interface DemoBookingEmailData {
  to: string;
  name: string;
  day: string;
  slot: string;
  courseInterest?: string;
}

export async function sendDemoConfirmationEmail(data: DemoBookingEmailData) {
  const transporter = createTransporter();
  const from = `"Zahau Music School" <${process.env.SMTP_USER}>`;
  const adminEmail = process.env.SMTP_USER!;

  const html = buildConfirmationHtml(data);
  const text = buildConfirmationText(data);
  const adminHtml = buildAdminNotificationHtml(data);

  // Send confirmation to the user
  await transporter.sendMail({
    from,
    to: data.to,
    subject: "Your Demo is Confirmed — Zahau Music School",
    html,
    text,
  });

  // Send notification to the school
  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New Demo Booking: ${data.name} — ${data.day} at ${data.slot}`,
    html: adminHtml,
    text: `New demo booking from ${data.name} (${data.to}).\nDay: ${data.day}\nTime: ${data.slot}\nCourse: ${data.courseInterest || "Not specified"}`,
  });
}

// ─── User confirmation email ───────────────────────────────────────────────
function buildConfirmationHtml({ name, day, slot, courseInterest }: DemoBookingEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Demo Confirmed — Zahau Music School</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#18181b;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1f 0%,#111113 100%);padding:36px 40px;border-bottom:1px solid rgba(212,175,55,0.15);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af37;font-weight:700;">Zahau Music School</span>
                    <h1 style="margin:10px 0 0;font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;text-transform:uppercase;">
                      Demo <em style="font-style:italic;font-weight:300;color:#d4af37;text-transform:lowercase;">Confirmed.</em>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <div style="width:44px;height:44px;background:rgba(212,175,55,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(212,175,55,0.25);">
                      <span style="font-size:20px;line-height:44px;text-align:center;display:block;">🎵</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:rgba(229,229,229,0.8);font-weight:300;">
                Hi <strong style="color:#ffffff;font-weight:600;">${name}</strong>,
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:rgba(229,229,229,0.7);font-weight:300;">
                We've received your demo booking request. Our team will review and confirm your slot within <strong style="color:#ffffff;">one business day</strong>. Here's a summary of your session:
              </p>

              <!-- Session details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.2);border-radius:14px;overflow:hidden;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(212,175,55,0.6);font-weight:700;display:block;margin-bottom:4px;">Day</span>
                          <span style="font-size:16px;font-weight:700;color:#ffffff;">${day}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(212,175,55,0.6);font-weight:700;display:block;margin-bottom:4px;">Time</span>
                          <span style="font-size:16px;font-weight:700;color:#d4af37;">${slot}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(212,175,55,0.6);font-weight:700;display:block;margin-bottom:4px;">Instructor</span>
                          <span style="font-size:16px;font-weight:700;color:#ffffff;">Dr. Henery</span>
                        </td>
                      </tr>
                      ${
                        courseInterest
                          ? `
                      <tr>
                        <td>
                          <span style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(212,175,55,0.6);font-weight:700;display:block;margin-bottom:4px;">Course Interest</span>
                          <span style="font-size:16px;font-weight:700;color:#ffffff;">${courseInterest}</span>
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:rgba(229,229,229,0.55);font-weight:300;">
                If you need to reschedule or have any questions, reply to this email or visit our <a href="https://zahaumusic.com/contact" style="color:#d4af37;text-decoration:none;">contact page</a>.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#d4af37;border-radius:10px;">
                    <a href="https://zahaumusic.com/schedule" style="display:inline-block;padding:14px 28px;font-family:'Courier New',monospace;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#0d0d0f;text-decoration:none;">
                      View Weekly Schedule →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);background:#111113;">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.2);">
                Zahau Music School · Delhi · zahaumusic.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildConfirmationText({ name, day, slot, courseInterest }: DemoBookingEmailData): string {
  return `Hi ${name},

Your demo session at Zahau Music School has been received!

SESSION DETAILS
---------------
Day:        ${day}
Time:       ${slot}
Instructor: Dr. Henery
${courseInterest ? `Course:     ${courseInterest}` : ""}

We'll confirm your slot within one business day.

If you have questions, reply to this email or visit zahaumusic.com/contact.

— Zahau Music School
`;
}

// ─── Admin notification email ──────────────────────────────────────────────
function buildAdminNotificationHtml({
  name,
  to,
  day,
  slot,
  courseInterest,
}: DemoBookingEmailData & { to: string }): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px;background:#0d0d0f;font-family:monospace;color:#e5e5e5;">
  <div style="max-width:520px;background:#18181b;border-radius:14px;padding:28px;border:1px solid rgba(212,175,55,0.2);">
    <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af37;">New Demo Booking</p>
    <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#fff;text-transform:uppercase;">Booking Alert</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;">
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;width:110px;">Name</td><td style="padding:6px 0;color:#fff;font-size:14px;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Email</td><td style="padding:6px 0;color:#d4af37;font-size:14px;">${to}</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Day</td><td style="padding:6px 0;color:#fff;font-size:14px;">${day}</td></tr>
      <tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Time</td><td style="padding:6px 0;color:#d4af37;font-size:14px;font-weight:700;">${slot}</td></tr>
      ${courseInterest ? `<tr><td style="padding:6px 0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Course</td><td style="padding:6px 0;color:#fff;font-size:14px;">${courseInterest}</td></tr>` : ""}
    </table>
  </div>
</body>
</html>`;
}
