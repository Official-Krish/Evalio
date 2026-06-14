import { Resend } from "resend"

const resend = new Resend(Bun.env.RESEND_API_KEY!)
const EMAIL_FROM = Bun.env.EMAIL_FROM ?? "Evalio <noreply@krishlabs.tech>"

function buildOtpEmail(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:40px 36px 20px" align="center">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,#a78bfa,#6366f1);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">EV</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Verify your email</h1>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px">Use the code below to complete your signup for <strong style="color:#e2e8f0">Evalio</strong>. This code expires in 10 minutes.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 36px 28px">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:20px 32px;display:inline-block;letter-spacing:12px;font-size:32px;font-weight:700;color:#f1f5f9;font-family:'SF Mono','SFMono-Regular','Fira Code',monospace">${otp}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px">
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;text-align:center">
                If you didn't request this code, you can safely ignore this email.<br>
                &copy; ${new Date().getFullYear()} Evalio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildResetOtpEmail(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:40px 36px 20px" align="center">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,#a78bfa,#6366f1);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">EV</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Reset your password</h1>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px">Use the code below to reset your password for <strong style="color:#e2e8f0">Evalio</strong>. This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 36px 28px">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:20px 32px;display:inline-block;letter-spacing:12px;font-size:32px;font-weight:700;color:#f1f5f9;font-family:'SF Mono','SFMono-Regular','Fira Code',monospace">${otp}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px">
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;text-align:center">
                If you didn't request a password reset, you can safely ignore this email.<br>
                &copy; ${new Date().getFullYear()} Evalio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildWelcomeEmail(name: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:40px 36px 20px" align="center">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,#a78bfa,#6366f1);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">EV</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:22px;font-weight:600;margin:0 0 8px;letter-spacing:-0.3px">Welcome, ${name}!</h1>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 8px">Your email has been verified successfully.</p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px">You're all set to start practicing interviews with AI-powered feedback.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 16px" align="center">
              <a href="${Bun.env.CORS_ORIGIN ?? "http://localhost:5173"}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#a78bfa,#6366f1);color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px">Go to Dashboard</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 32px">
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;text-align:center">
                &copy; ${new Date().getFullYear()} Evalio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildContactEmail(name: string, senderEmail: string, subject: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden">
          <tr>
            <td style="padding:40px 36px 20px">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,#a78bfa,#6366f1);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px">EV</span>
              </div>
              <h1 style="color:#f1f5f9;font-size:22px;font-weight:600;margin:0 0 4px;letter-spacing:-0.3px">${subject}</h1>
              <p style="color:#94a3b8;font-size:13px;margin:0 0 24px">From: <strong style="color:#e2e8f0">${name}</strong> &lt;${senderEmail}&gt;</p>
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px">
                <p style="color:#f1f5f9;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap">${message}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px">
              <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;text-align:center">
                Sent via the Evalio contact form.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendContactEmail(name: string, senderEmail: string, subject: string, message: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: "krishanand@krishlabs.tech",
      replyTo: senderEmail,
      subject: `[Contact] ${subject}`,
      html: buildContactEmail(name, senderEmail, subject, message),
    })
    return true
  } catch (err) {
    console.error("[email] contact send failed:", err)
    return false
  }
}

export async function sendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your email — Evalio",
      html: buildOtpEmail(otp),
    })
    console.log(`[email] OTP sent to ${email}`)
    return true
  } catch (err) {
    console.error("[email] send failed:", err)
    return false
  }
}

export async function sendResetOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Reset your password — Evalio",
      html: buildResetOtpEmail(otp),
    })
    console.log(`[email] Reset OTP sent to ${email}`)
    return true
  } catch (err) {
    console.error("[email] send failed:", err)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Welcome to Evalio — email verified",
      html: buildWelcomeEmail(name),
    })
    console.log(`[email] Welcome email sent to ${email}`)
    return true
  } catch (err) {
    console.error("[email] send failed:", err)
    return false
  }
}
