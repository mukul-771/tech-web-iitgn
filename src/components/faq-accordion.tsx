"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const faqData: FAQItem[] = [
  {
    question: "How can I join a technical club?",
    answer: "Visit our clubs page to explore different options and contact the respective club coordinators for membership details and requirements. Most clubs have open recruitment periods at the beginning of each semester.",
    category: "Membership"
  },
  {
    question: "When is the next Inter-IIT Tech Meet?",
    answer: "Inter-IIT Tech Meet is typically held annually during December-January. Follow our announcements for dates, registration details, and preparation guidelines. We also conduct preparatory workshops throughout the year.",
    category: "Events"
  },
  {
    question: "How can I contribute to Torque magazine?",
    answer: "We welcome articles, project showcases, research papers, and creative content. Contact us with your submission ideas and we'll guide you through the editorial process. We accept submissions year-round.",
    category: "Publications"
  },
  {
    question: "Are there opportunities for non-technical students?",
    answer: "Absolutely! We have diverse roles in event management, design, content creation, marketing, and outreach that welcome students from all academic backgrounds. Technical skills can be learned along the way.",
    category: "Opportunities"
  }
];

interface AccordionItemProps {
  faq: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function AccordionItem({ faq, index, isExpanded, onToggle }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Membership": return "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800";
      case "Events": return "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800";
      case "Publications": return "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800";
      case "Opportunities": return "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300/50 dark:hover:border-blue-700/50",
        isExpanded && "shadow-lg shadow-blue-500/20 border-blue-300/70 dark:border-blue-700/70 bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/20"
      )}
    >
      {/* Gradient overlay for expanded state */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500",
        isExpanded && "opacity-100"
      )} />

      {/* Animated border */}
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500",
        isExpanded && "opacity-20"
      )} style={{ padding: "1px" }}>
        <div className="h-full w-full rounded-xl bg-white dark:bg-gray-900" />
      </div>

      <button
        onClick={onToggle}
        className="relative w-full px-6 py-5 text-left flex items-start justify-between group-hover:bg-white/30 dark:group-hover:bg-black/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-expanded={isExpanded}
        aria-controls={`faq-content-${index}`}
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
              isExpanded
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600"
            )}>
              {isExpanded ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <HelpCircle className="h-4 w-4" />
              )}
            </div>
            {faq.category && (
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full border transition-all duration-300",
                getCategoryColor(faq.category)
              )}>
                {faq.category}
              </span>
            )}
          </div>
          <h3 className={cn(
            "font-semibold text-lg transition-colors duration-300 font-space-grotesk",
            isExpanded
              ? "text-gray-900 dark:text-white"
              : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
          )}>
            {faq.question}
          </h3>
        </div>

        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 flex-shrink-0",
          isExpanded
            ? "bg-blue-500 text-white shadow-lg rotate-180"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 group-hover:scale-110"
        )}>
          <ChevronDown className="h-5 w-5 transition-transform duration-300" />
        </div>
      </button>

      <div
        id={`faq-content-${index}`}
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          height: isExpanded ? `${height}px` : "0px"
        }}
      >
        <div ref={contentRef} className="px-6 pb-6 pt-0">
          <div className="pl-11">
            <div className={cn(
              "p-4 rounded-lg border-l-4 transition-all duration-300",
              isExpanded
                ? "bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10 border-l-blue-500"
                : "bg-gray-50/50 dark:bg-gray-800/30 border-l-gray-300 dark:border-l-gray-700"
            )}>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/50 dark:border-blue-800/50 mb-4">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Interactive FAQ</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Click on any question to reveal the answer
        </p>
      </div>

      {faqData.map((faq, index) => (
        <AccordionItem
          key={index}
          faq={faq}
          index={index}
          isExpanded={expandedIndex === index}
          onToggle={() => toggleExpanded(index)}
        />
      ))}
    </div>
  );
}
