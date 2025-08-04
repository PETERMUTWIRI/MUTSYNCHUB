import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTASection: React.FC = () => {
  // Animation variant reused from HeroSection
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
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 py-16 px-6 text-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute top-16 right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-16 left-24 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
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
          className="text-3xl font-bold mb-4 text-[#22D3EE] max-w-4xl mx-auto"
        >
          Ready to <span className="text-[#22D3EE]">Transform</span> Your Business?
        </motion.h2>

        <motion.p
          variants={item}
          className="text-lg md:text-xl text-[#E5E7EB] font-normal max-w-2xl mx-auto mt-6 leading-relaxed"
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
            className="rounded-full border-2 border-white bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 text-lg"
            onClick={() => {
              if (window && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('openConsultationModal', { detail: { preselect: 'analytics-demo' } }));
              }
            }}
          >
            Schedule Demo
          </Button>
        </motion.div>

        <motion.div variants={item} className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[{
            label: "Avg. ROI",
            value: "+325%",
            valueClass: "text-green-400",
          }, {
            label: "Client Satisfaction",
            value: "98.6%",
            valueClass: "text-blue-300",
          }, {
            label: "Deployment Speed",
            value: "2x Faster",
            valueClass: "text-purple-500 drop-shadow",
          }].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                scale: 1.08,
                rotate: 2,
                boxShadow: "0 0 24px 0 rgba(100,181,246,0.25)",
              }}
              whileTap={{
                scale: 1.04,
                rotate: -2,
                boxShadow: "0 0 12px 0 rgba(100,181,246,0.18)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`rounded-xl bg-gradient-to-br from-blue-900/60 via-blue-800/60 to-purple-500/60 p-6 border border-white/10 text-center backdrop-blur-md`}
            >
              <p className="text-white/70 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.valueClass}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
