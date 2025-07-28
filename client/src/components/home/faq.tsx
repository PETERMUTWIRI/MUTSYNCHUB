import React from "react";
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
      icon: <ShieldCheck className="text-blue-300 w-5 h-5" />,
    },
    {
      id: "item-2",
      question: "How long does implementation typically take?",
      answer:
        "Project timelines vary based on complexity, but most implementations range from 4–12 weeks. We provide a detailed roadmap after our initial consultation.",
      icon: <Clock className="text-blue-300 w-5 h-5" />,
    },
    {
      id: "item-3",
      question: "Do you offer ongoing support?",
      answer:
        "Yes, we provide comprehensive maintenance and support packages with 24/7 monitoring, regular updates, and dedicated account managers.",
      icon: <Headset className="text-blue-300 w-5 h-5" />,
    },
    {
      id: "item-4",
      question: "What makes MutSyncHub different?",
      answer:
        "Our unique Synchronized Technology Framework ensures all your systems work in harmony, eliminating data silos and creating seamless workflows across your organization.",
      icon: <Star className="text-blue-300 w-5 h-5" />,
    },
  ];
  
  export const FAQSection: React.FC = () => {
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 py-24 px-6 text-white">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 mx-auto max-w-7xl"
        >
          <motion.div variants={item} className="text-center mb-16">
            <span className="inline-block bg-white/10 px-4 py-1 rounded-full text-xl font-bold text-[#22D3EE] backdrop-blur-md shadow-lg mb-4">
              FAQ
            </span>
            <h2 className="text-3xl font-bold mb-4 text-[#22D3EE]">
              Frequently Asked <span className="text-[#22D3EE]">Questions</span>
            </h2>
            <p className="text-lg md:text-xl text-[#E5E7EB] font-normal max-w-3xl mx-auto">
              Everything you need to know about our services, timelines, and support.
            </p>
          </motion.div>

          <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FAQ_DATA.map((faq, idx) => (
              <motion.div
                key={faq.id}
                variants={item}
                initial="hidden"
                whileInView="show"
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={faq.id}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition duration-300"
                >
                  <AccordionTrigger className="text-left text-2xl font-semibold text-[#A5F3FC] flex items-start gap-3">
                    <span className="mt-1">{faq.icon}</span>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-lg text-[#E5E7EB] font-normal mt-2">
                    <p className="mb-4">{faq.answer}</p>
                    <div className="flex items-center gap-2 text-[#22D3EE] text-base">
                      <span>Was this helpful?</span>
                      <button className="hover:text-white transition">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="hover:text-white transition">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* Instant answers section */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-[#A5F3FC] mb-2">Get instant answers from our agent</h3>
            <p className="text-lg text-[#E5E7EB] mb-6">Still have questions? Start a conversation with our support agent for real-time help.</p>
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
              onClick={() => {
                // Replace this with your actual chat open logic if needed
                if (window && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('openChatWidget'));
                }
              }}
            >
              <Headset className="w-5 h-5" />
              Chat with Agent
            </button>
          </div>
        </motion.div>
      </section>
    );
  };
  