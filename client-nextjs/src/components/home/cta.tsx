import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTASection: React.FC = () => {
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
    <section className="relative bg-gradient-to-br from-[#faf7f0] via-[#f8f4e9] to-[#f5f0e1] py-16 px-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-white/30 to-transparent" />
        <div className="absolute top-16 right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-16 left-24 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 mx-auto max-w-6xl text-center"
      >
        <motion.h2
          variants={item}
          className="text-3xl md:text-4xl font-bold mb-4 text-[#22D3EE] max-w-4xl mx-auto"
        >
          Ready to <span className="text-[#22D3EE]">Transform</span> Your Business?
        </motion.h2>

        <motion.p
          variants={item}
          className="text-lg md:text-xl text-[#4a5568] font-normal max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Join industry leaders who rely on MutSyncHub for intelligent automation, seamless integrations, and powerful insights.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="group rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 px-8 text-lg transition-all duration-300 hover:shadow-xl"
          >
            <a href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-blue-600 bg-white text-blue-600 font-semibold hover:bg-blue-50 text-lg hover:border-blue-700 hover:text-blue-700"
            onClick={() => {
              if (window && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('openConsultationModal', { detail: { preselect: 'analytics-demo' } }));
              }
            }}
          >
            Schedule Demo
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};