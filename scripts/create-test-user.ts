import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function createTestUser() {
  try {
    // Check if test user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      console.log("Test user already exists:");
      console.log(`  ID: ${existingUser.id}`);
      console.log(`  Username: ${existingUser.username}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Email Verified: ${existingUser.emailVerified}`);

      // Update password
      const newPassword = "test123";
      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email: "test@example.com" },
        data: { passwordHash, emailVerified: true },
      });

      console.log("\nPassword reset to: test123");
      console.log("Email verified: true");
      return;
    }

    // Create test user
    const passwordHash = await bcrypt.hash("test123", 10);

    const user = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        passwordHash,
        emailVerified: true,
      },
    });

    console.log("Test user created successfully:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: test123`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    console.log("\nYou can now log in with:");
    console.log("  Email: test@example.com");
    console.log("  Password: test123");
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

createTestUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
