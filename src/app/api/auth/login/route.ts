import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log(`[Login] Attempt for email: ${email}`);

    if (!email || !password) {
      console.log("[Login] Failed: Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[Login] Failed: User not found for email ${email}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(`[Login] User found: ${user.username}`);

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.log(`[Login] Failed: Invalid password for user ${user.username}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log(`[Login] Password valid for user ${user.username}`);

    // Check email verification
    if (!user.emailVerified) {
      console.log(`[Login] Failed: Email not verified for user ${user.username}`);
      return NextResponse.json(
        { error: "Please verify your email first", needsVerification: true },
        { status: 403 }
      );
    }

    console.log(`[Login] Success: User ${user.username} logged in`);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create session token (simplified - in production use proper session management)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
