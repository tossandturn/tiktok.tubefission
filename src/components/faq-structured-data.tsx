"use client";

import Script from "next/script";
import { FAQItem } from "@/lib/seo";

interface FAQStructuredDataProps {
  faqs: FAQItem[];
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}

// Predefined FAQs for the platform
export const platformFAQs: FAQItem[] = [
  {
    question: "What is TikTok Intelligence?",
    answer:
      "TikTok Intelligence is a comprehensive analytics platform that helps creators discover viral trends, analyze competitor performance, and optimize content strategy with AI-powered insights and real-time data.",
  },
  {
    question: "How do you predict viral trends?",
    answer:
      "Our AI analyzes multiple signals including growth velocity, engagement rates, saturation levels, and creator participation to identify trends before they peak. We combine TikTok data with machine learning models trained on thousands of viral videos.",
  },
  {
    question: "Is TikTok Intelligence free to use?",
    answer:
      "Yes! TikTok Intelligence offers a free tier with access to trending content, basic analytics, and trend discovery. Premium features like advanced analytics, competitor tracking, and API access are available with a subscription.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "Trend data is updated multiple times daily. Video and creator metrics are refreshed every few hours to ensure you have the most current insights for making content decisions.",
  },
  {
    question: "Can I track my competitors?",
    answer:
      "Yes, our competitor tracking feature allows you to monitor other creators in your niche, analyze their content performance, and identify opportunities they might be missing.",
  },
  {
    question: "What countries are supported?",
    answer:
      "We support trend tracking in the United States, Japan, South Korea, United Kingdom, Hong Kong, Taiwan, and expanding to more regions based on user demand.",
  },
];

// FAQ Section Component for display
export function FAQSection() {
  return (
    <section className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {platformFAQs.map((faq, index) => (
          <div
            key={index}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {faq.question}
            </h3>
            <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
