"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jessica Park",
    role: "Content Creator",
    followers: "1.2M",
    content: "I've tried every TikTok analytics tool out there. TikTok Intelligence is the only one that actually predicts trends before they happen. My engagement is up 340%.",
    rating: 5,
    avatar: "JP",
  },
  {
    name: "David Kim",
    role: "Social Media Manager",
    company: "Viral Agency",
    content: "We manage 50+ creator accounts. This tool saves us 8 hours per week per account. The AI predictions are scary accurate.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Maria Garcia",
    role: "Dance Creator",
    followers: "3.8M",
    content: "The momentum scoring changed everything. I know exactly when to jump on a trend and when to wait. Game changer.",
    rating: 5,
    avatar: "MG",
  },
  {
    name: "Alex Thompson",
    role: "Brand Strategist",
    company: "Fortune 500",
    content: "We use TikTok Intelligence for our influencer campaigns. Finding rising creators before they blow up gives us massive ROI.",
    rating: 5,
    avatar: "AT",
  },
  {
    name: "Sophie Chen",
    role: "Food Creator",
    followers: "890K",
    content: "Predicted the deconstructed food trend a week early. My video got 8M views while others were still figuring it out.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "James Wilson",
    role: "Comedy Creator",
    followers: "2.1M",
    content: "The optimal timing feature alone is worth it. Posting at the right moment doubled my average views.",
    rating: 5,
    avatar: "JW",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by Creators
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join thousands of creators who trust TikTok Intelligence.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-tiktok-cyan/20" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-tiktok-cyan text-tiktok-cyan" />
                ))}
              </div>

              {/* Content */}
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{testimonial.name}</div>
                  <div className="text-white/50 text-xs">
                    {testimonial.role}
                    {testimonial.followers && ` · ${testimonial.followers} followers`}
                    {testimonial.company && ` · ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
