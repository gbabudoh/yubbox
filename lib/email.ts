import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yubbox.com';

interface DigestAd { id: string; title: string; description: string; imageUrl: string }
interface DigestCategory { name: string; ads: DigestAd[] }

export async function sendWeeklyDigestEmail(
  to: string,
  name: string,
  categories: DigestCategory[],
) {
  const adCards = categories.flatMap(({ name: cat, ads }) =>
    ads.map((ad) => {
      const img = ad.imageUrl.startsWith('http') ? ad.imageUrl : `${BASE_URL}${ad.imageUrl}`;
      return `
        <tr><td style="padding:0 0 20px">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
            <tr>
              <td width="100" style="padding:0;vertical-align:top">
                <img src="${img}" width="100" height="80" style="display:block;object-fit:cover" alt="${ad.title}"/>
              </td>
              <td style="padding:12px 14px;vertical-align:top">
                <p style="margin:0 0 2px;font-size:11px;color:#790e61;font-weight:700;text-transform:uppercase;letter-spacing:.05em">${cat}</p>
                <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#111">${ad.title}</p>
                <p style="margin:0 0 10px;font-size:13px;color:#666;line-height:1.5">${ad.description.slice(0, 100)}…</p>
                <a href="${BASE_URL}/ads/${ad.id}" style="display:inline-block;background:#790e61;color:#fff;text-decoration:none;font-weight:700;font-size:12px;padding:6px 14px;border-radius:8px">View Yubbox →</a>
              </td>
            </tr>
          </table>
        </td></tr>`;
    })
  ).join('');

  await transporter.sendMail({
    from:    `"Yubbox Weekly" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: `This week's top Yubboxes — curated for you`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8f8f8;padding:0">
        <div style="background:linear-gradient(135deg,#3d0730,#790e61,#c41e8a);padding:28px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900">Your Yubbox Weekly Digest</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px">Hi ${name} — here's what's trending this week</p>
        </div>
        <div style="padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">${adCards}</table>
          <div style="text-align:center;padding:12px 0 4px">
            <a href="${BASE_URL}" style="display:inline-block;background:linear-gradient(135deg,#790e61,#c41e8a);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px">Browse all Yubboxes →</a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #eee;text-align:center">
          <p style="margin:0;font-size:11px;color:#aaa">© 2026 Yubbox · <a href="${BASE_URL}/unsubscribe" style="color:#aaa">Unsubscribe</a></p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from:    `"Yubbox" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your Yubbox password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#790e61;margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">
          We received a request to reset the password for your Yubbox account.
          Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#790e61,#c41e8a);color:#fff;
                  text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px;font-size:15px">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;margin-top:28px">
          If you didn't request this, you can safely ignore this email — your password won't change.<br/>
          Link: <a href="${resetUrl}" style="color:#790e61">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
