#!/usr/bin/env node
/**
 * Test script for TikTok analyze API
 * Usage: node test-analyze.js
 */

const TEST_URL = "https://www.tiktok.com/@ai_voicer/video/72832140261";

async function testAnalyze() {
  console.log("Testing TikTok Analyze API...");
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
      if (data.video?.id) {
        console.log("Video Detail URL:", `https://tiktok.tubefission.com/video/${data.video.id}`);
      }
    } else {
      console.log("\n❌ Analysis failed:", data.error);
    }

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testAnalyze();
