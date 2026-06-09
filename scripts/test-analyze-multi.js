#!/usr/bin/env node
/**
 * Test script for TikTok analyze API - Test multiple URLs
 */

const TEST_URLS = [
  "https://www.tiktok.com/@charlidamelio/video/7106580977484750126",
  "https://www.tiktok.com/@zachking/video/6864289042994478342",
  "https://www.tiktok.com/@khaby.lame/video/6923109628958936326",
];

async function testAnalyze(url) {
  console.log("Testing URL:", url);
  console.log("-".repeat(50));

  try {
    const response = await fetch("https://tiktok.tubefission.com/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    console.log("Status:", response.status);

    if (data.success) {
      console.log("✅ SUCCESS!");
      console.log("Video ID:", data.video?.id);
      console.log("Title:", data.title);
      console.log("Creator:", data.creator?.displayName);
      console.log("Thumbnail:", data.video?.thumbnail);
      return true;
    } else {
      console.log("❌ FAILED:", data.error);
      return false;
    }

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    return false;
  } finally {
    console.log("");
  }
}

async function runTests() {
  console.log("Testing TikTok Analyze API with multiple URLs\n");
  console.log("=".repeat(50));
  console.log("");

  for (const url of TEST_URLS) {
    await testAnalyze(url);
  }
}

runTests();
