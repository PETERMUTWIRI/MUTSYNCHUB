// src/components/home/AnalyticsPreview.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart4, Database, Gauge, ScrollText, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const AnalyticsPreview = () => {
  const features = [
    {
      icon: <Database className="h-6 w-6 text-blue-400" />,
      title: "Unified Data Ecosystem",
      desc: "Connect all your data sources into a single source of truth"
    },
    {
      icon: <BarChart4 className="h-6 w-6 text-purple-400" />,
      title: "Predictive Analytics",
      desc: "AI-powered forecasting for accurate business planning"
    },
    {
      icon: <Gauge className="h-6 w-6 text-green-400" />,
      title: "Real-time Dashboards",
      desc: "Monitor KPIs with live, interactive visualizations"
    },
    {
      icon: <ScrollText className="h-6 w-6 text-cyan-400" />,
      title: "Automated Reporting",
      desc: "Schedule and distribute insights without manual effort"
    }
  ];

  const router = useRouter();
  // TODO: Get user info from Neon Auth context or props if needed

  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xl font-bold text-[#22D3EE] backdrop-blur-md mb-4">
              Analytics Engine
            </div>
            <h2 className="text-3xl font-bold mb-6 text-[#22D3EE]">
              AI-Powered <span className="text-[#22D3EE]">Business Intelligence</span>
            </h2>
            <p className="text-lg md:text-xl text-[#E5E7EB] font-normal mb-8 max-w-2xl">
              Transform raw data into strategic insights with our enterprise-grade analytics platform. 
              Designed for decision-makers who demand accuracy, speed, and depth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-br from-blue-900/60 via-blue-800/60 to-purple-500/60 border border-white/10 backdrop-blur-md p-5 rounded-xl"
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
                >
                  <motion.div
                    whileHover={{
                      scale: 1.18,
                      filter: "drop-shadow(0 0 8px #64b5f6)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mb-3"
                  >
                    <div className="bg-white/90 shadow-lg border border-blue-100/40 rounded-xl flex items-center justify-center w-14 h-14 mx-auto mb-1">
                      {feature.icon}
                    </div>
                  </motion.div>
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-2xl font-semibold text-[#A5F3FC]">{feature.title}</h4>
                  </div>
                  <p className="text-lg text-[#E5E7EB] font-normal">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-2xl font-bold rounded-xl shadow-lg text-white"
              onClick={() => router.push('/signup')}
            >
              Explore Analytics Engine
              <span className="ml-2 text-2xl font-bold text-white flex items-center"><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/60 via-blue-800/60 to-purple-500/40 border border-white/10 rounded-2xl p-2 backdrop-blur-md">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="h-8 bg-gray-800 flex items-center px-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Revenue Dashboard</h3>
                      <p className="text-blue-200 text-sm">Real-time performance</p>
                    </div>
                    <div className="text-green-400 font-semibold">+24.7%</div>
                  </div>
                  
                  <div className="h-48 relative">
                    {/* Chart placeholder */}
                    <div className="absolute bottom-0 left-0 right-0 h-[85%] grid grid-cols-7 gap-2 items-end">
                      {[40, 70, 55, 85, 65, 90, 75].map((height, idx) => (
                        <div 
                          key={idx}
                          className="bg-gradient-to-t from-cyan-500 to-blue-600 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-xl font-semibold text-[#A5F3FC] mb-1">Customer Acquisition</div>
                    <div className="text-2xl font-bold text-white">1,247</div>
                    <div className="text-green-400 text-base font-semibold">+12.4%</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-xl font-semibold text-[#A5F3FC] mb-1">Churn Rate</div>
                    <div className="text-2xl font-bold text-white">3.2%</div>
                    <div className="text-red-400 text-base font-semibold">-1.8%</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-xl font-semibold text-[#A5F3FC] mb-1">Avg. Order Value</div>
                    <div className="text-2xl font-bold text-white">$147.50</div>
                    <div className="text-green-400 text-base font-semibold">+8.3%</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-xl font-semibold text-[#A5F3FC] mb-1">LTV</div>
                    <div className="text-2xl font-bold text-white">$2,450</div>
                    <div className="text-green-400 text-base font-semibold">+15.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;