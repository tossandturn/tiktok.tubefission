import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";
import { StructuredData } from "@/components/structured-data";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#010101",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tiktok-intelligence.com"),
  title: {
    default: "TikTok Intelligence Terminal — Discover Trends Before They Explode",
    template: "%s | TikTok Intelligence",
  },
  description:
    "Daily intelligence terminal for TikTok creators. Real-time trend signals, viral pattern detection, and creator insights — all in one place.",
  keywords: [
    "TikTok trends",
    "viral trends",
    "TikTok analytics",
    "creator intelligence",
    "trend discovery",
    "social media trends",
    "TikTok growth",
    "content strategy",
  ],
  authors: [{ name: "TikTok Intelligence" }],
  creator: "TikTok Intelligence",
  publisher: "TikTok Intelligence",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tiktok-intelligence.com",
    siteName: "TikTok Intelligence Terminal",
    title: "TikTok Intelligence Terminal — Discover Trends Before They Explode",
    description:
      "Daily intelligence terminal for TikTok creators. Real-time trend signals, viral pattern detection, and creator insights.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TikTok Intelligence Terminal Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Intelligence Terminal",
    description: "Discover trends before they explode. Daily intelligence for TikTok creators.",
    images: ["/og-image.jpg"],
    creator: "@tiktokintel",
  },
  alternates: {
    canonical: "https://tiktok-intelligence.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable)}>
      <head>
        <StructuredData type="website" />
        <StructuredData type="organization" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-tiktok-black text-white min-h-screen`}
      >
        <NavBar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
