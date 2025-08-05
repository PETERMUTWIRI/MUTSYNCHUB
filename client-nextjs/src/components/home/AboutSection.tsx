// src/components/home/AboutSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { 
  Database, BarChart, Clock, Users, Lock, 
  Cpu, LineChart, PieChart, Globe, MessageSquare, 
  ArrowRight, ChevronRight 
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from 'next/navigation';


const AboutSection: React.FC = () => {
  const sections = [
    {
      title: "Empowering Businesses with Intelligent Technology",
      content: "At MutSyncHub, we're not just building software; we're crafting intelligent ecosystems that help businesses grow with confidence. From real-time data automation to smart cloud solutions, our approach is always tailored and future-forward.",
      visual: (
        <div className="relative w-full h-80">
          <video
            src="/Scene-2.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
            style={{ display: 'block', background: '#fff' }}
          />
         
        </div>
      )
    },
    {
      title: "The Data Challenge Enterprises Face",
      content: "For too long, businesses have wrestled with data scattered across systems, struggling to extract timely, actionable insights. Manual reporting delays crucial decisions, and the true potential of your operations remains locked away. This is where MutSyncHub steps in, transforming your raw data into your most strategic asset.",
      visual: (
        <video
          src="/scattered.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
          style={{ display: 'block', background: '#fff' }}
        />
      )
    },
    {
      title: "The AI-Powered Intelligence Platform",
      content: "We've engineered an enterprise-grade AI Data Analytics Platform designed for the core of your business. Whether you're a major wholesaler, a dynamic retail chain, a bustling supermarket, or a manufacturing powerhouse, if you possess data – from intricate databases to daily POS transactions – MutSyncHub is built for you.",
      visual: (
        <video
          src="/powered-2.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
          style={{ display: 'block', background: '#fff' }}
        />
      )
    },
    {
      title: "Unrivaled Data Exploration",
      content: "Our engine dives deep, generating advanced statistics (mean, std, skewness, kurtosis), mapping crucial correlations, and highlighting feature importance. We pinpoint outliers and anomalies with precision using advanced statistical and machine learning methods, ensuring your data's integrity. We even perform distribution tests and dimensionality reduction (PCA) to give you a crystal-clear understanding of your data's underlying structure.",
      visual: (
        <div className="relative w-full h-80">
          <video
            src="/visual.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
            style={{ display: 'block', background: '#fff' }}
          />
          
        </div>
      )
    },
    {
      title: "Strategic Forecasting & Market Insights",
      content: "Look to the future with confidence. MutSyncHub expertly analyzes temporal patterns, decomposes time series for trends and seasonality, and integrates with cutting-edge tools like Prophet for advanced forecasting. Understand your customers and products like never before. Our platform employs powerful clustering algorithms to segment your market with unparalleled accuracy, providing the insights needed for hyper-targeted strategies.",
      visual: (
        <video
          src="/market2.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
          style={{ display: 'block', background: '#fff' }}
        />
      )
    },
    {
      title: "Your Trusted AI Partner: The Contextual Agent",
      content: "Imagine having a data analyst on demand, available 24/7. Our groundbreaking contextual-aware agent makes this a reality. Simply query it using natural language, and it delves into the analyzed data, delivering comprehensive reports and answers to your questions instantly. Crucially, in an era where AI adoption can raise concerns about data privacy, we've prioritized your peace of mind. Our agent operates locally, meaning your sensitive enterprise data remains within your secure environment.",
      visual: (
        <video
          src="/agent.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-80 rounded-3xl object-cover shadow-xl border-4 border-blue-500/10"
          style={{ display: 'block', background: '#fff' }}
        />
      )
    }
  ];

  const router = useRouter();
 

  return (
    <section className="relative bg-[#FFFDF6] py-24 px-0 text-gray-900 overflow-hidden">
      {/* Top gradient fade for smooth transition from HeroSection */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 z-10" style={{background: 'linear-gradient(to bottom, rgba(34,211,238,0.12) 0%, #FFFDF6 100%)'}} />
      {/* Blue shadow at top and bottom for visual transition */}
      <div className="absolute top-0 left-0 w-full h-6 z-10 shadow-[0_-8px_24px_0_rgba(34,211,238,0.18)]" style={{boxShadow: '0 -8px 24px 0 #22D3EE88'}} />
      <div className="absolute bottom-0 left-0 w-full h-6 z-10 shadow-[0_8px_24px_0_rgba(34,211,238,0.18)]" style={{boxShadow: '0 8px 24px 0 #22D3EE88'}} />
      <div className="w-full">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}
          >
            {/* Text content - alternates sides */}
            <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
              <motion.h2 
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl font-bold mb-6 text-[#22D3EE]"
              >
                {section.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl text-gray-700 font-normal leading-relaxed"
              >
                {section.content}
              </motion.p>
            </div>
            {/* Visual content - alternates sides */}
            <motion.div 
              className={`h-80 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {section.visual}
            </motion.div>
          </div>
        ))}
        {/* Final CTA */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-white/10 px-6 py-2 rounded-full text-xl font-bold text-[#22D3EE] backdrop-blur-md mb-6"
          >
            Ready to unlock the full power of your data?
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-2xl font-bold rounded-xl shadow-lg text-white"
              onClick={() => router.push('/signup')}
            >
              Launch Analytics Engine
              <span className="ml-2 text-2xl font-bold text-white flex items-center"><ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" /></span>
            </Button>
          </motion.div>
        </div>
      </div>
      {/* Bottom gradient fade for smooth transition to next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 z-10" style={{background: 'linear-gradient(to top, rgba(34,211,238,0.10) 0%, #FFFDF6 100%)'}} />
    </section>
    
  );
};

export default AboutSection;