import React from "react";

const accent = "#1de9b6";
const gradientBg = "bg-gradient-to-br from-[#321F61] to-[#1F224D] min-h-screen w-full";

const SupportPage: React.FC = () => {
  return (
    <div className={gradientBg}>
      <main className="w-full max-w-none px-8 py-12 mx-auto" style={{maxWidth: '100vw', minHeight: '100vh'}}>
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">Support</h1>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Help Center</h2>
          <p className="text-lg text-gray-200 mb-2">
            Welcome to the MutSyncHub Support Center. Here you’ll find everything you need to resolve issues, connect with our team, and get the most out of our platform. Our resources are designed for enterprise reliability, with 24/7 access to technical support, a comprehensive knowledge base, and a thriving user community.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>Browse our <b>Knowledge Base</b> for instant answers</li>
            <li>Submit a <b>Support Ticket</b> for personalized help</li>
            <li>Join the <b>Community Forum</b> to connect with peers</li>
            <li>Check <b>System Status</b> for real-time updates</li>
          </ul>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Contact Us</h2>
          <p className="text-lg text-gray-200 mb-2">
            Need direct assistance? Our global support team is here to help. Reach out via email, phone, or live chat for fast, expert guidance tailored to your needs.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>Email: <a href="mailto:support@mutsynchub.com" className="text-[var(--accent-teal,#1de9b6)] underline">support@mutsynchub.com</a></li>
            <li>Phone: <a href="tel:+1234567890" className="text-[var(--accent-teal,#1de9b6)] underline">+1 (234) 567-890</a></li>
            <li>Live Chat: Available 24/7 in your dashboard</li>
          </ul>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Community Forum</h2>
          <p className="text-lg text-gray-200 mb-2">
            Connect with other MutSyncHub users, share best practices, and get peer-to-peer support. Our moderated forums are a great place to ask questions, suggest features, and learn from real-world use cases.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">System Status</h2>
          <p className="text-lg text-gray-200 mb-2">
            View real-time status updates for all MutSyncHub services. We provide transparent incident reporting and proactive notifications to keep your operations running smoothly.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>Live status dashboard</li>
            <li>Incident history & root cause analysis</li>
            <li>Proactive maintenance notifications</li>
          </ul>
        </section>
        {/* Agentic AI Support Widget (now universal, see floating widget) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">AI-Powered Support Agent</h2>
          <p className="text-lg text-gray-200 mb-4">
            Instantly connect with our intelligent support agent. Ask any question about MutSyncHub, and our AI will provide real-time, context-aware answers using advanced intent recognition. Use the floating AI widget at the bottom right of your screen.
          </p>
        </section>
      </main>
    </div>
  );
};

export default SupportPage;
