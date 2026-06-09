import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavBar } from "@/components/nav-bar";
import { StructuredData } from "@/components/structured-data";
import { CountryProvider } from "@/components/country-context";
import { SessionProvider } from "@/components/session-provider";
import TikTokAnalyzerBar from "@/components/tiktok-analyzer-bar";

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
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tiktok.tubefission.com"),
  title: {
    default: "TikTok Intelligence — Viral Trend Analytics & Creator Intelligence",
    template: "%s | TikTok Intelligence",
  },
  description:
    "Discover TikTok trends before they explode. Real-time viral analytics, AI-powered opportunity scores, country-specific trend data, and creator intelligence for content strategy.",
  keywords: [
    "TikTok trends",
    "viral trends",
    "TikTok analytics",
    "creator intelligence",
    "trend discovery",
    "social media trends",
    "TikTok growth",
    "content strategy",
    "TikTok data analysis",
    "viral prediction",
    "creator tools",
    "TikTok market intelligence",
    "trend forecasting",
  ],
  authors: [{ name: "TikTok Intelligence" }],
  creator: "TikTok Intelligence",
  publisher: "TikTok Intelligence",
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    url: "https://tiktok.tubefission.com",
    siteName: "TikTok Intelligence",
    title: "TikTok Intelligence — Discover Trends Before They Explode",
    description:
      "Real-time viral analytics, AI-powered opportunity scores, and country-specific trend intelligence for TikTok creators.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TikTok Intelligence Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Intelligence — Viral Trend Analytics",
    description: "Discover trends before they explode. AI-powered intelligence for TikTok creators.",
    images: ["/og-image.jpg"],
    creator: "@tiktokintel",
  },
  alternates: {
    canonical: "https://tiktok.tubefission.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
  classification: "Social Media Analytics",
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
        <StructuredData type="softwareApplication" />
        <StructuredData type="product" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6772936350717773"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-6772936350717773" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <SessionProvider>
          <CountryProvider>
            <NavBar />
            <TikTokAnalyzerBar />
            <main className="pt-14">{children}</main>
          </CountryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
