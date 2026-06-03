import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tiktok-intelligence.com";

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

async function sendVerificationEmail(email: string, username: string, token: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email send");
    console.log(`Verification link: ${APP_URL}/verify-email?token=${token}`);
    return true;
  }

  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
  const FROM_NAME = process.env.FROM_NAME || "TikTok Intelligence";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: "Verify your TikTok Intelligence account",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify your TikTok Intelligence account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #111111; border-radius: 8px; border: 1px solid #333;">
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to TikTok Intelligence, ${username}!</h1>
              <p style="margin: 0 0 24px 0; color: #a1a1a1; font-size: 16px; line-height: 1.6;">Please verify your email address to complete your registration.</p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #ff0050, #ff4080); border-radius: 6px; text-align: center;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 500; font-size: 16px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0 0; color: #666; font-size: 14px; line-height: 1.5;">This link will expire in 24 hours.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Delete old verification tokens
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id, verifiedAt: null },
    });

    // Generate new token
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email
    const sent = await sendVerificationEmail(email, user.username, token);

    if (!sent && RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      ...(process.env.NODE_ENV === "development" && !RESEND_API_KEY ? { devToken: token } : {}),
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
