import { Resend } from "resend";

const resend = new Resend(Bun.env.RESEND_API_KEY!);
const EMAIL_FROM = Bun.env.EMAIL_FROM ?? "Evalio <noreply@krishlabs.tech>";
const BRAND_ACCENT = "#b8a88a";
const BRAND_BG = "#080808";
const BRAND_CARD = "#111116";
const BRAND_BORDER = "#1e1e2a";
const BRAND_TEXT = "#eceae6";
const BRAND_TEXT_MUTED = "#8a8884";
const BRAND_TEXT_FAINT = "#5c5a56";

const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="9" width="18" height="2.5" rx="1.25" fill="${BRAND_ACCENT}" opacity="0.9"/>
  <rect x="6" y="13.5" width="14" height="2.5" rx="1.25" fill="${BRAND_ACCENT}" opacity="0.7"/>
  <rect x="6" y="18" width="10" height="2.5" rx="1.25" fill="${BRAND_ACCENT}" opacity="0.5"/>
  <rect x="6" y="22.5" width="6" height="2.5" rx="1.25" fill="${BRAND_ACCENT}"/>
</svg>`;

function template(children: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
</head>
<body style="margin:0;padding:0;background:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};padding:48px 16px">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:100%">
          <tr>
            <td align="center" style="padding-bottom:32px">
              <table cellpadding="0" cellspacing="0" style="display:inline-block">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px">
                    ${LOGO_SVG}
                  </td>
                  <td style="vertical-align:middle">
                    <span style="color:${BRAND_TEXT};font-size:18px;font-weight:600;letter-spacing:-0.3px">Evalio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND_CARD};border:1px solid ${BRAND_BORDER};border-radius:8px;overflow:hidden">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${children}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px">
              <p style="color:${BRAND_TEXT_FAINT};font-size:12px;line-height:1.6;margin:0">
                &copy; ${new Date().getFullYear()} Evalio &mdash; AI-powered interview practice
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

function buildOtpEmail(otp: string): string {
  return template(`
    <tr>
      <td style="padding:40px 36px 16px;text-align:center">
        <h1 style="color:${BRAND_TEXT};font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Verify your email</h1>
        <p style="color:${BRAND_TEXT_MUTED};font-size:14px;line-height:1.6;margin:0">
          Use the code below to complete your signup. This code expires in <strong style="color:${BRAND_TEXT}">10 minutes</strong>.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 36px 28px">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${BRAND_BG};border:1px solid ${BRAND_BORDER};border-radius:6px;padding:16px 28px;letter-spacing:10px;font-size:30px;font-weight:700;color:${BRAND_TEXT};font-family:'SF Mono','SFMono-Regular','Fira Code','Cascadia Code',monospace;text-align:center;font-variant-numeric:tabular-nums">
              ${otp}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px">
        <p style="color:${BRAND_TEXT_FAINT};font-size:12px;line-height:1.6;margin:0;text-align:center">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td>
    </tr>
  `);
}

function buildResetOtpEmail(otp: string): string {
  return template(`
    <tr>
      <td style="padding:40px 36px 16px;text-align:center">
        <h1 style="color:${BRAND_TEXT};font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Reset your password</h1>
        <p style="color:${BRAND_TEXT_MUTED};font-size:14px;line-height:1.6;margin:0">
          Use the code below to reset your password. This code expires in <strong style="color:${BRAND_TEXT}">10 minutes</strong>. If you didn't request this, ignore this email.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 36px 28px">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${BRAND_BG};border:1px solid ${BRAND_BORDER};border-radius:6px;padding:16px 28px;letter-spacing:10px;font-size:30px;font-weight:700;color:${BRAND_TEXT};font-family:'SF Mono','SFMono-Regular','Fira Code','Cascadia Code',monospace;text-align:center;font-variant-numeric:tabular-nums">
              ${otp}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px">
        <p style="color:${BRAND_TEXT_FAINT};font-size:12px;line-height:1.6;margin:0;text-align:center">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </td>
    </tr>
  `);
}

function buildWelcomeEmail(name: string): string {
  const dashboardUrl = Bun.env.CORS_ORIGIN ?? "http://localhost:5173";
  return template(`
    <tr>
      <td style="padding:40px 36px 16px;text-align:center">
        <h1 style="color:${BRAND_TEXT};font-size:22px;font-weight:600;margin:0 0 4px;letter-spacing:-0.3px">Welcome, ${name}</h1>
        <p style="color:${BRAND_TEXT_MUTED};font-size:14px;line-height:1.6;margin:0">
          Your email has been verified. You're all set to start practicing interviews with AI-powered feedback.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 36px 20px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="display:inline-block">
          <tr>
            <td style="background:${BRAND_ACCENT};border-radius:6px;padding:0">
              <a href="${dashboardUrl}/dashboard" style="display:inline-block;color:${BRAND_BG};text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;line-height:1">Go to Dashboard</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 36px 32px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border:1px solid ${BRAND_BORDER};border-radius:6px;padding:16px 20px">
          <tr>
            <td style="padding-bottom:8px">
              <p style="color:${BRAND_TEXT_MUTED};font-size:12px;font-weight:600;margin:0;letter-spacing:0.03em">QUICK LINKS</p>
            </td>
          </tr>
          <tr>
            <td style="padding:3px 0">
              <a href="${dashboardUrl}/dashboard" style="color:${BRAND_ACCENT};font-size:13px;text-decoration:none">Schedule your first interview &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="padding:3px 0">
              <a href="${dashboardUrl}/dashboard" style="color:${BRAND_ACCENT};font-size:13px;text-decoration:none">Browse practice sessions &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `);
}

function buildContactEmail(
  name: string,
  senderEmail: string,
  subject: string,
  message: string,
): string {
  return template(`
    <tr>
      <td style="padding:40px 36px 16px">
        <p style="color:${BRAND_TEXT_MUTED};font-size:13px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.06em">Contact Form</p>
        <h1 style="color:${BRAND_TEXT};font-size:20px;font-weight:600;margin:0;letter-spacing:-0.3px">${subject}</h1>
        <p style="color:${BRAND_TEXT_MUTED};font-size:13px;margin:6px 0 0">
          From: <strong style="color:${BRAND_TEXT}">${name}</strong> &lt;${senderEmail}&gt;
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border:1px solid ${BRAND_BORDER};border-radius:6px;padding:20px">
          <tr>
            <td>
              <p style="color:${BRAND_TEXT};font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap">${message}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px">
        <p style="color:${BRAND_TEXT_FAINT};font-size:12px;line-height:1.6;margin:0;text-align:center">
          Sent via the Evalio contact form.
        </p>
      </td>
    </tr>
  `);
}

export async function sendContactEmail(
  name: string,
  senderEmail: string,
  subject: string,
  message: string,
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: "krishanand@krishlabs.tech",
      replyTo: senderEmail,
      subject: `[Contact] ${subject}`,
      html: buildContactEmail(name, senderEmail, subject, message),
    });
    return true;
  } catch (err) {
    console.error("[email] contact send failed:", err);
    return false;
  }
}

export async function sendOtpEmail(
  email: string,
  _name: string,
  otp: string,
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email — Evalio",
      html: buildOtpEmail(otp),
    });
    console.log(`[email] OTP sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

export async function sendResetOtpEmail(
  email: string,
  _name: string,
  otp: string,
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Reset your password — Evalio",
      html: buildResetOtpEmail(otp),
    });
    console.log(`[email] Reset OTP sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

function buildFeedbackThankYouEmail(name: string): string {
  const dashboardUrl = Bun.env.CORS_ORIGIN ?? "http://localhost:5173";
  return template(`
    <tr>
      <td style="padding:40px 36px 16px;text-align:center">
        <h1 style="color:${BRAND_TEXT};font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Thank you, ${name}</h1>
        <p style="color:${BRAND_TEXT_MUTED};font-size:14px;line-height:1.6;margin:0">
          Your feedback helps shape Evalio into a better interview practice platform. Every submission is read and taken seriously.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 36px 24px;text-align:center">
        <table cellpadding="0" cellspacing="0" style="display:inline-block">
          <tr>
            <td style="background:${BRAND_ACCENT};border-radius:6px;padding:0">
              <a href="${dashboardUrl}/dashboard" style="display:inline-block;color:${BRAND_BG};text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;line-height:1">Back to Dashboard</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 36px 32px;text-align:center">
        <p style="color:${BRAND_TEXT_FAINT};font-size:12px;line-height:1.6;margin:0">
          — The Evalio Team
        </p>
      </td>
    </tr>
  `);
}

export async function sendFeedbackThankYouEmail(
  email: string,
  name: string,
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Thank you for your feedback — Evalio",
      html: buildFeedbackThankYouEmail(name),
    });
    console.log(`[email] Feedback thank-you sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[email] feedback thank-you send failed:", err);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to Evalio — email verified",
      html: buildWelcomeEmail(name),
    });
    console.log(`[email] Welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}
