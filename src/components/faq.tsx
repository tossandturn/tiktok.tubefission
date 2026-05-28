"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate are the AI predictions?",
    answer: "Our AI models have a 94% accuracy rate for predicting viral trends within a 7-day window. The models are trained on over 10 million viral videos and are updated daily with new data.",
  },
  {
    question: "How far in advance can you predict trends?",
    answer: "We provide reliable predictions up to 7 days in advance. The 3-5 day window has the highest accuracy (96%), while 7-day predictions maintain 94% accuracy.",
  },
  {
    question: "Is there a free tier?",
    answer: "Yes! Our free tier includes 3 trend predictions per week, basic analytics, and access to the trending dashboard. Upgrade to Pro for unlimited predictions and advanced features.",
  },
  {
    question: "How is this different from other analytics tools?",
    answer: "Most tools show you what's already trending. TikTok Intelligence predicts what WILL trend using proprietary AI models that analyze early signals before they become obvious.",
  },
  {
    question: "Can I track my competitors?",
    answer: "Yes, Pro and Agency plans include competitor tracking. Monitor their trending content, posting patterns, and engagement metrics in real-time.",
  },
  {
    question: "What countries are supported?",
    answer: "We track trends in 47 countries across all major regions: North America, Europe, Asia-Pacific, Latin America, and more. New countries are added regularly.",
  },
  {
    question: "How often is the data updated?",
    answer: "Trend data updates every 4 hours. AI predictions refresh daily. Real-time monitoring is available for Pro and Agency plans.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel anytime with no questions asked. Your access continues until the end of your billing period.",
  },
];

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-white font-medium pr-4 group-hover:text-tiktok-cyan transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-white/60 text-sm pb-5 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60">
            Everything you need to know about TikTok Intelligence.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl px-6"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
