import nodemailer from 'nodemailer';

function readInput() {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => resolve(input));
    process.stdin.on('error', reject);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

async function main() {
  const { type, email, name, url, code } = JSON.parse(await readInput());
  const isVerification = type === 'verification';
  if ((!isVerification && type !== 'password_reset') || !email || !url) {
    throw new Error('Invalid email message.');
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const from = process.env.SMTP_FROM;
  if (!host || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_HOST, SMTP_PORT, and SMTP_FROM must be configured.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD || '' }
      : undefined,
    tls: { minVersion: 'TLSv1.2' },
  });

  const action = isVerification ? 'Verify email address' : 'Reset password';
  const heading = isVerification ? 'Verify your email' : 'Reset your password';
  const explanation = isVerification
    ? 'Use the 6-digit verification code below to activate your TrendTide account and access your dashboard.'
    : 'We received a request to reset the password for your TrendTide account.';
  const safeName = escapeHtml(name || 'there');
  const safeUrl = escapeHtml(url);
  const otpText = isVerification && code ? `\nYour 6-digit verification code: ${code}\n` : '';
  const otpHtml = isVerification && code
    ? `<p style="margin:24px 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#64748b">Verification code</p><div style="display:inline-block;padding:12px 18px;border:1px solid #ddd6fe;border-radius:12px;background:#faf5ff;color:#5b21b6;font-size:28px;font-weight:bold;letter-spacing:0.3em">${escapeHtml(code)}</div>`
    : '';
  const actionText = isVerification ? '' : `<p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:14px 22px;background:#9d00ff;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold">${action}</a></p>`;
  const info = await transporter.sendMail({
    from,
    to: email,
    subject: isVerification ? 'Verify your TrendTide email' : 'Reset your TrendTide password',
    text: `${heading}\n\nHi ${name || 'there'},\n\n${explanation}${otpText}\nThis code expires in 15 minutes. If you did not request this, you can ignore this email.`,
    html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#eef2f7;font-family:Arial,sans-serif;color:#172033">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#eef2f7">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #dce3ed;border-radius:16px;overflow:hidden">
          <tr><td style="padding:28px 32px;background:#111827;color:#fff">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c084fc">TrendTide</div>
            <h1 style="margin:12px 0 0;font-size:24px">${heading}</h1>
          </td></tr>
          <tr><td style="padding:32px">
            <p style="font-size:16px">Hi ${safeName},</p>
            <p style="font-size:15px;line-height:1.6;color:#475569">${explanation}</p>
            ${otpHtml ? `<div style="margin:24px 0">${otpHtml}</div>` : ''}
            ${!isVerification ? actionText : ''}
            <p style="font-size:13px;line-height:1.6;color:#64748b">This code expires in 15 minutes and can only be used once. If you did not request this, you can safely ignore this email.</p>
            ${!isVerification ? `<p style="font-size:12px;line-height:1.6;color:#64748b;word-break:break-all">If the button does not work, copy this link into your browser:<br>${safeUrl}</p>` : ''}
          </td></tr>
          <tr><td style="padding:18px 32px;background:#f8fafc;color:#94a3b8;font-size:12px">TrendTide account security</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  });

  const acceptedRecipients = (info.accepted || []).map((recipient) =>
    String(typeof recipient === 'string' ? recipient : recipient.address).toLowerCase()
  );
  if (!acceptedRecipients.includes(email.toLowerCase())) {
    throw new Error('SMTP server did not accept the recipient.');
  }
  process.stdout.write(JSON.stringify({ sent: true }));
}

main().catch((error) => {
  process.stderr.write(`${error.message || 'SMTP delivery failed.'}\n`);
  process.exitCode = 1;
});
