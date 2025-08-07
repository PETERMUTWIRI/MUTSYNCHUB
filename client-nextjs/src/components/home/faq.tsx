import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Clock,
  Headset,
  Star,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "item-1",
    question: "What services does MutSyncHub offer?",
    answer:
      "We provide end-to-end digital transformation solutions including cloud computing, data automation, AI integration, and custom software development tailored to your business needs.",
    icon: <ShieldCheck className="text-blue-600 w-5 h-5" />,
  },
  {
    id: "item-2",
    question: "How long does implementation typically take?",
    answer:
      "Project timelines vary based on complexity, but most implementations range from 4–12 weeks. We provide a detailed roadmap after our initial consultation.",
    icon: <Clock className="text-blue-600 w-5 h-5" />,
  },
  {
    id: "item-3",
    question: "Do you offer ongoing support?",
    answer:
      "Yes, we provide comprehensive maintenance and support packages with 24/7 monitoring, regular updates, and dedicated account managers.",
    icon: <Headset className="text-blue-600 w-5 h-5" />,
  },
  {
    id: "item-4",
    question: "What makes MutSyncHub different?",
    answer:
      "Our unique Synchronized Technology Framework ensures all your systems work in harmony, eliminating data silos and creating seamless workflows across your organization.",
    icon: <Star className="text-blue-600 w-5 h-5" />,
  },
];

export const FAQSection: React.FC = () => {
  const [isChatHovered, setIsChatHovered] = useState(false);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <section className="relative bg-gradient-to-br from-[#faf7f0] via-[#f8f4e9] to-[#f5f0e1] py-24 px-6">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-[10%] w-64 h-64 bg-[#e1dcc5] rounded-full opacity-10"></div>
        <div className="absolute bottom-20 right-[15%] w-80 h-80 bg-[#d8d0b5] rounded-full opacity-10"></div>
        <div className="absolute top-1/3 left-[70%] w-40 h-40 bg-[#e1dcc5] rounded-full opacity-15"></div>
        <div className="absolute top-1/2 right-[5%] w-32 h-32 bg-[#d8d0b5] rounded-full opacity-15"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 mx-auto max-w-7xl"
      >
        <motion.div variants={item} className="text-center mb-16">
          <span className="inline-block bg-[#2c3e50] px-4 py-1 rounded-full text-base font-bold text-white shadow-md mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2c3e50]">
            Frequently Asked <span className="text-blue-600">Questions</span>
          </h2>
          <p className="text-lg md:text-xl text-[#4a5568] font-normal max-w-3xl mx-auto">
            Everything you need to know about our services, timelines, and support.
          </p>
        </motion.div>

        <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQ_DATA.map((faq, idx) => (
            <motion.div
              key={faq.id}
              variants={item}
              initial="hidden"
              whileInView="show"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              viewport={{ once: true }}
            >
              <AccordionItem
                value={faq.id}
                className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm p-5 hover:shadow-md transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-xl font-semibold text-[#2c3e50] flex items-start gap-3 hover:no-underline">
                  <span className="mt-1">{faq.icon}</span>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-[#4a5568] font-normal mt-3">
                  <p className="mb-4">{faq.answer}</p>
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <span>Was this helpful?</span>
                    <button className="hover:text-blue-800 transition">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="hover:text-blue-800 transition">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Instant answers section */}
        <motion.div 
          className="mt-16 text-center p-8 bg-white rounded-xl shadow-sm max-w-3xl mx-auto border border-[#e2e8f0]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-[#2c3e50] mb-2">Get instant answers from our agent</h3>
          <p className="text-lg text-[#4a5568] mb-6">Still have questions? Start a conversation with our support agent for real-time help.</p>
          <motion.button
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsChatHovered(true)}
            onHoverEnd={() => setIsChatHovered(false)}
            onClick={() => {
              if (window && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('openChatWidget'));
              }
            }}
          >
            <motion.div
              animate={{ rotate: isChatHovered ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Headset className="w-5 h-5" />
            </motion.div>
            Chat with Agent
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};