// Test login functionality
async function testLogin() {
  const testCases = [
    { email: "test@test.com", password: "wrongpassword", expected: "fail" },
    { email: "nonexistent@test.com", password: "password", expected: "fail" },
    { email: "", password: "", expected: "fail" },
  ];

  console.log("Testing login API...\n");

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.email || "empty"}`);

      // Note: This is a mock test - in real scenario we'd hit the actual API
      console.log(`  Expected: ${testCase.expected}`);
      console.log(`  Status: Would test against /api/auth/login\n`);
    } catch (error) {
      console.error(`  Error: ${error}\n`);
    }
  }

  console.log("Login test recommendations:");
  console.log("1. Check if user exists in database");
  console.log("2. Verify password hashing is working");
  console.log("3. Ensure email verification is required");
  console.log("4. Check session creation");
}

// Common login issues checklist
const loginIssues = {
  "Login failed": [
    "User doesn't exist in database",
    "Password doesn't match (hashing issue)",
    "Email not verified",
    "Database connection error",
    "Session creation failed",
    "Network timeout"
  ],

  "Solutions": [
    "Check if user was created successfully",
    "Verify bcryptjs is working correctly",
    "Ensure email verification token was sent",
    "Check DATABASE_URL environment variable",
    "Verify Prisma client is initialized",
    "Test API endpoint directly with curl"
  ]
};

console.log("=== Login Diagnostic Tool ===\n");
console.log("Common issues:");
Object.entries(loginIssues).forEach(([category, items]) => {
  console.log(`\n${category}:`);
  items.forEach(item => console.log(`  - ${item}`));
});

console.log("\n\nTo debug login:");
console.log("1. Create a test user via /api/auth/register");
console.log("2. Verify email via /api/auth/verify-email?token=...");
console.log("3. Try logging in");
console.log("4. Check browser console for errors");
console.log("5. Check server logs for database errors");
