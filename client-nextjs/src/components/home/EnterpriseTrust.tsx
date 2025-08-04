// src/components/home/EnterpriseTrust.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Globe, BarChart, Cpu, Server 
} from 'lucide-react';

const EnterpriseTrust = () => {
  const stats = [
    { value: "99.99%", label: "Uptime", icon: <Server className="h-6 w-6 text-blue-500" /> },
    { value: "256-bit", label: "Encryption", icon: <Lock className="h-6 w-6 text-green-500" /> },
    { value: "ISO 27001", label: "Certified", icon: <ShieldCheck className="h-6 w-6 text-purple-500" /> },
    { value: "50+", label: "Global Clients", icon: <Globe className="h-6 w-6 text-cyan-500" /> },
    { value: "4.9/5", label: "Satisfaction", icon: <BarChart className="h-6 w-6 text-yellow-500" /> },
    { value: "AI-Powered", label: "Security", icon: <Cpu className="h-6 w-6 text-red-500" /> }
  ];

  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 py-24 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Trusted by <span className="text-blue-600">Enterprise Leaders</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto">
            Built with enterprise-grade security, reliability, and scalability at its core
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, idx) => (
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
                  filter: "drop-shadow(0 0 8px #64b5f6)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4"
              >
                {stat.icon}
              </motion.div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;