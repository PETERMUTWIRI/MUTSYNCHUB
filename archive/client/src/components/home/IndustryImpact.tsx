// src/components/home/IndustryImpact.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Factory, Activity, Truck, Hospital, CreditCard 
} from 'lucide-react';

const IndustryImpact = () => {
  const industries = [
    {
      icon: <ShoppingCart className="h-8 w-8 text-blue-500" />,
      name: "Retail & E-commerce",
      impact: "Increased revenue by 35% through AI-driven demand forecasting"
    },
    {
      icon: <Factory className="h-8 w-8 text-green-500" />,
      name: "Manufacturing",
      impact: "Reduced downtime by 42% with predictive maintenance solutions"
    },
    {
      icon: <Activity className="h-8 w-8 text-purple-500" />,
      name: "Financial Services",
      impact: "Decreased fraud losses by 67% with real-time anomaly detection"
    },
    {
      icon: <Truck className="h-8 w-8 text-yellow-500" />,
      name: "Logistics",
      impact: "Optimized routes reducing fuel costs by 28%"
    },
    {
      icon: <Hospital className="h-8 w-8 text-red-500" />,
      name: "Healthcare",
      impact: "Improved patient outcomes with predictive analytics"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-cyan-500" />,
      name: "Fintech",
      impact: "Scaled transaction processing to handle 5M+ daily operations"
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 py-24 px-6 text-white overflow-hidden">
      {/* Top subtle color overlay */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 z-10" style={{background: 'linear-gradient(to bottom, rgba(255,253,246,0.12) 0%, transparent 100%)'}} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xl font-bold text-[#22D3EE] backdrop-blur-md mb-4">
            Industry Impact
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[#22D3EE]">
            Transforming Industries with <span className="text-[#22D3EE]">Data Intelligence</span>
          </h2>
          <p className="text-lg md:text-xl text-[#E5E7EB] font-normal max-w-3xl mx-auto">
            Proven results across diverse sectors through our tailored solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-900/60 via-blue-800/60 to-purple-500/60 border border-white/10 rounded-xl p-6 text-center shadow-sm hover:shadow-md backdrop-blur-md transition-all"
            >
              <motion.div
                whileHover={{
                  scale: 1.18,
                  filter: "drop-shadow(0 0 8px #64b5f6)",
                  y: -10
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mb-4 flex items-center justify-center"
              >
                {industry.icon}
              </motion.div>
              <div className="text-2xl font-semibold text-[#A5F3FC] mb-1">{industry.name}</div>
              <div className="text-lg text-[#E5E7EB] font-normal">{industry.impact}</div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Bottom subtle color overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 z-10" style={{background: 'linear-gradient(to top, rgba(255,253,246,0.10) 0%, transparent 100%)'}} />
    </section>
  );
};

export default IndustryImpact;