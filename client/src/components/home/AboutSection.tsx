import React from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const AboutSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-24 px-8 text-white">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-4xl"
      >
        {/* Text Content Only */}
        <motion.div variants={item} className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight" style={{ color: '#1de9b6' }}>
            Empowering Businesses with Intelligent Technology.
          </h2>
          <div className="prose prose-invert max-w-none text-blue-100 text-lg md:text-xl leading-relaxed space-y-6">
            <p>
              At <span className="font-semibold" style={{ color: '#1de9b6' }}>MutSyncHub</span>, we're not just building software; we're crafting intelligent ecosystems that help businesses grow with confidence. From real-time data automation to smart cloud solutions, our approach is always tailored and future-forward.
            </p>
            <p>
              For too long, businesses have wrestled with data scattered across systems, struggling to extract timely, actionable insights. Manual reporting delays crucial decisions, and the true potential of your operations remains locked away. This is where <span className="font-semibold" style={{ color: '#1de9b6' }}>MutSyncHub</span> steps in, transforming your raw data into your most strategic asset.
            </p>
            <h3 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#1de9b6' }}>The AI-Powered Intelligence Platform: Your Data, Amplified.</h3>
            <p>
              We've engineered an enterprise-grade AI Data Analytics Platform designed for the core of your business. Whether you're a major wholesaler, a dynamic retail chain, a bustling supermarket, or a manufacturing powerhouse, if you possess data – from intricate databases to daily POS transactions – <span className="font-semibold" style={{ color: '#1de9b6' }}>MutSyncHub</span> is built for you. We understand that data integration can be a hurdle, which is why our platform offers seamless connectivity to existing databases. And we're not stopping there; we're actively developing a game-changing plugin to directly pull and unify data from POS systems that traditionally lack API access, ensuring all your valuable insights are captured.
            </p>
            <p>
              This isn't just about data collection; it's about real-time synchronization and automated analytics that run on your schedule, or even autonomously. At its heart lies our dedicated, <span className="font-bold" style={{ color: '#1de9b6' }}>Automated AI Engine</span> – the brain that turns complexity into clarity:
            </p>
            <ul className="list-disc pl-6 space-y-3">
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Unrivaled Data Exploration:</span> <span className="text-white">Our engine dives deep, generating advanced statistics (mean, std, skewness, kurtosis), mapping crucial correlations, and highlighting feature importance. We pinpoint outliers and anomalies with precision using advanced statistical and machine learning methods, ensuring your data's integrity. We even perform distribution tests and dimensionality reduction (PCA) to give you a crystal-clear understanding of your data's underlying structure.</span></li>
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Strategic Forecasting & Time Series Mastery:</span> <span className="text-white">Look to the future with confidence. MutSyncHub expertly analyzes temporal patterns, decomposes time series for trends and seasonality, and integrates with cutting-edge tools like Prophet for advanced forecasting. Never be caught off guard by market shifts again.</span></li>
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Precision Clustering & Segmentation:</span> <span className="text-white">Understand your customers and products like never before. Our platform employs powerful clustering algorithms (KMeans, DBSCAN) to segment your market with unparalleled accuracy, providing the insights needed for hyper-targeted strategies.</span></li>
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Actionable Industry & Cross-Industry Insights:</span> <span className="text-white">We speak your language. MutSyncHub delivers tailored metrics for specific industries including retail, wholesale, supermarket, manufacturing, and healthcare. But our vision extends further, providing vital cross-industry analytics on market dynamics, supply chain efficiency, customer behavior, operational excellence, risk assessment, and even sustainability – giving you a holistic competitive edge.</span></li>
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Unlocking Textual Goldmines:</span> <span className="text-white">Don't let unstructured data go to waste. Our text analytics capabilities (using TF-IDF) extract valuable insights from reviews, feedback, and other textual sources, giving voice to your qualitative data.</span></li>
              <li><span className="font-semibold" style={{ color: '#1de9b6' }}>Built for Performance & Future-Proof Scalability:</span> <span className="text-white">We cache results for lightning-fast access, ensuring your most critical reports are always at your fingertips. And with our modular, extensible design, MutSyncHub effortlessly grows with your business, allowing for seamless addition of new industry metrics or custom analytics modules.</span></li>
            </ul>
            <h3 className="text-2xl font-bold mt-8 mb-4" style={{ color: '#1de9b6' }}>Your Trusted AI Partner: The Contextual Agent.</h3>
            <p>
              Imagine having a data analyst on demand, available 24/7. Our groundbreaking contextual-aware agent makes this a reality. Simply query it using natural language, and it delves into the analyzed data, delivering comprehensive reports and answers to your questions instantly. This isn't just convenience; it's a paradigm shift in data accessibility.
            </p>
            <p>
              Crucially, in an era where AI adoption can raise concerns about data privacy, we’ve prioritized your peace of mind. Our agent operates <span className="font-bold" style={{ color: '#1de9b6' }}>locally</span>, meaning your sensitive enterprise data remains within your secure environment. This commitment to local processing ensures unparalleled data safety and privacy, building trust even among those new to AI’s transformative power.
            </p>
            <p style={{ color: '#1de9b6', fontWeight: 600 }}>
              With MutSyncHub, the need for an in-house team of data analysts is alleviated. Our platform does the heavy lifting, providing insights previously accessible only to the largest corporations. This isn't just a SaaS; it's a comprehensive suite of solutions, and our dedicated <span className="font-semibold">Solutions</span> section outlines the full spectrum of ways MutSyncHub can empower your unique enterprise journey. We are the next generation of business intelligence, ready to revolutionize how you understand, operate, and innovate.
            </p>
          </div>
        </motion.div>
        {/* CTA Section */}
        <motion.div
          variants={item}
          className="mt-12 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-2xl md:text-3xl font-bold text-center" style={{ color: '#1de9b6' }}>
            Ready to unlock the full power of your data?
          </div>
          <a
            href="/analytics"
            className="inline-block rounded-full px-10 py-5 text-xl font-bold shadow-xl transition-colors duration-300"
            style={{ background: 'linear-gradient(90deg, #1de9b6 0%, #00bcd4 100%)', color: '#0a2540', letterSpacing: '0.03em' }}
          >
            Launch Analytics Engine
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
