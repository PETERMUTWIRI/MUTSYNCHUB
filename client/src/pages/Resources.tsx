import React from "react";

const gradientBg = "bg-gradient-to-br from-[#321F61] to-[#1F224D] min-h-screen w-full";

const Resources: React.FC = () => {
  return (
    <div className={gradientBg}>
      <main className="w-full max-w-none px-8 py-12 mx-auto" style={{maxWidth: '100vw', minHeight: '100vh'}}>
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">Resources</h1>
        <section id="docs" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Documentation</h2>
          <p className="text-lg text-gray-200 mb-2">
            Access comprehensive, up-to-date documentation for every aspect of the MutSyncHub platform. Our documentation covers everything from onboarding and platform architecture to advanced configuration, security, and best practices. Whether you’re a developer, admin, or business user, you’ll find clear guides, code samples, and real-world scenarios to help you maximize value and accelerate adoption.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>Getting Started & Quickstart Guides</li>
            <li>Platform Architecture & Concepts</li>
            <li>Authentication, Security, and Compliance</li>
            <li>Integration Patterns & Data Flows</li>
            <li>Release Notes & Change Logs</li>
          </ul>
        </section>
        <section id="api" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">API Reference</h2>
          <p className="text-lg text-gray-200 mb-2">
            Explore our robust, well-documented API suite designed for seamless integration and automation. The API Reference provides detailed endpoint documentation, request/response schemas, authentication flows, error handling, and usage examples. Empower your team to build, extend, and automate with confidence.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>RESTful Endpoints & Methods</li>
            <li>Authentication & Authorization</li>
            <li>Webhooks & Event Subscriptions</li>
            <li>Error Codes & Troubleshooting</li>
            <li>SDKs & Client Libraries</li>
          </ul>
        </section>
        <section id="guides" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Guides & Tutorials</h2>
          <p className="text-lg text-gray-200 mb-2">
            Accelerate your learning with step-by-step guides, hands-on tutorials, and real-world use cases. Our curated content is designed for all skill levels, from new users to advanced architects. Learn how to deploy, customize, and optimize MutSyncHub for your unique business needs.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>End-to-End Integration Walkthroughs</li>
            <li>Customizing Workflows & Automation</li>
            <li>Best Practices for Scalability & Security</li>
            <li>Industry-Specific Solution Guides</li>
            <li>Video Tutorials & Webinars</li>
          </ul>
        </section>
        <section id="support" className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--accent-teal,#1de9b6)] mb-3">Support Center</h2>
          <p className="text-lg text-gray-200 mb-2">
            Get the help you need, when you need it. The Support Center connects you with our global team of experts, a vibrant user community, and a rich knowledge base. Submit support tickets, browse FAQs, or join the conversation in our forums. We’re committed to your success at every stage of your journey.
          </p>
          <ul className="list-disc pl-6 text-gray-200">
            <li>24/7 Technical Support & Ticketing</li>
            <li>Knowledge Base & FAQs</li>
            <li>Community Forums & Peer Networking</li>
            <li>Live Chat & Dedicated Account Managers</li>
            <li>Service Status & Incident Updates</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Resources;
