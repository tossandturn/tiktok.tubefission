"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Copy, Check, Wand2, Calendar } from "lucide-react";

interface UploadSuggestion {
  id: string;
  title: string;
  hook: string;
  tags: string[];
  bestTime: string;
  estimatedReach: string;
}

interface UploadSuggestionsProps {
  suggestions: UploadSuggestion[];
}

export function UploadSuggestions({ suggestions }: UploadSuggestionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" />
          AI Upload Suggestions
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="w-3 h-3" />
          GPT-4o
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl border border-white/5 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-1">{suggestion.hook}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-purple-400 font-mono flex-shrink-0">
                  <span>{suggestion.estimatedReach}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {suggestion.bestTime}
                </span>
                <div className="flex gap-1">
                  {suggestion.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded text-[9px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedId === suggestion.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">
                        Hook Script
                      </span>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{suggestion.hook}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {suggestion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(
                            suggestion.id,
                            `${suggestion.title}\n\n${suggestion.hook}\n\n${suggestion.tags.map((t) => `#${t}`).join(" ")}`
                          );
                        }}
                        className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                      >
                        {copiedId === suggestion.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
