#!/usr/bin/env node
/**
 * Test script for TikTok analyze API with a new URL
 */

// Use a different test URL
const TEST_URL = "https://www.tiktok.com/@charlidamelio/video/7106580977484750126";

async function testAnalyze() {
  console.log("Testing TikTok Analyze API with NEW URL...");
  console.log("URL:", TEST_URL);
  console.log("");

  try {
    const response = await fetch("https://tiktok.tubefission.com/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: TEST_URL }),
    });

    const data = await response.json();

    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.success) {
      console.log("\n✅ Analysis successful!");
      console.log("Video ID:", data.video?.id);
      console.log("Cached:", data.cached);
      console.log("Source:", data.source || "unknown");
      if (data.video?.id) {
        console.log("Video Detail URL:", `https://tiktok.tubefission.com/video/${data.video.id}`);
      }
    } else {
      console.log("\n❌ Analysis failed:", data.error);
      if (data.details) {
        console.log("Details:", data.details);
      }
    }

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testAnalyze();
