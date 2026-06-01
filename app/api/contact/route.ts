import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    await transporter.sendMail({
      from:    `"Yubbox Contact" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
      to:      process.env.SMTP_USER,
      replyTo: email,
      subject: `[Yubbox Contact] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#790e61;margin-bottom:4px">New contact form submission</h2>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f9f9f9;border-left:3px solid #790e61;padding:12px 16px;border-radius:4px;white-space:pre-wrap">${message}</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('contact form error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
  }
}
