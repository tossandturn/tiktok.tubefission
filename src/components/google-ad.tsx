"use client";

import { useEffect } from "react";

interface GoogleAdProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
}

export function GoogleAd({
  slot = "",
  format = "auto",
  style = { display: "block" },
  className = "",
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // @ts-expect-error Google AdSense API
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocked or not loaded
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client="ca-pub-2329966945529740"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

// Ad banner for sidebar or inline placement
export function AdBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <GoogleAd format="auto" style={{ display: "block", minHeight: "90px" }} />
    </div>
  );
}

// Ad unit for content sections
export function AdUnit({ className = "" }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <GoogleAd
        format="fluid"
        style={{ display: "block", textAlign: "center", minHeight: "250px" }}
      />
    </div>
  );
}
