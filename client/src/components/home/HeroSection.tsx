import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Aws from "@/assets/logos/aws.svg";
import Cisco from "@/assets/logos/cisco.svg";
import GoogleCloud from "@/assets/logos/googlecloud.svg";
import ISO from "@/assets/logos/iso.svg";
import Microsoft from "@/assets/logos/microsoft.svg";
import Fortinet from "@/assets/logos/fortinet.svg";
import Oracle from "@/assets/logos/oracle.svg";
import IBM from "@/assets/logos/ibm.svg";
import SAP from "@/assets/logos/sap.svg";
import GDPR from "@/assets/logos/gdpr.svg";
import NIST from "@/assets/logos/nist.svg";

const logos = [
  Aws, Cisco, GoogleCloud, ISO, Microsoft, Fortinet, Oracle, IBM, SAP, GDPR, NIST,
  Aws, Cisco, GoogleCloud, ISO, Microsoft, Fortinet, Oracle, IBM, SAP, GDPR, NIST, // repeat for smooth loop
];

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

const HeroSection: React.FC = () => {
  return (
    <>
      {/* Video Section - full width, increased height, square edges */}
      <section className="relative overflow-hidden w-full h-[600px] flex items-center justify-start shadow-xl">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/hero-vedio.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent z-10" />
        {/* Hero Content */}
        <div className="relative z-20 flex flex-col justify-center items-start h-full px-8 md:px-24 pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-white text-4xl md:text-6xl font-bold mb-6 max-w-2xl"
          >
            Accelerate Your <span className="text-blue-300">Digital</span> Transformation
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md mb-4"
          >
            New: AI-powered analytics →
          </motion.div>
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="mt-2 max-w-xl text-lg leading-relaxed text-blue-100 sm:text-xl space-y-4 list-disc list-inside pl-4"
          >
            <li>Automate complex workflows to drive operational efficiency across your enterprise.</li>
            <li>Gain deep, actionable data insights for confident, strategic decision-making.</li>
            <li>Scale operations seamlessly with AI-powered analytics.</li>
            <li>Empower teams with secure, integrated, and future-ready SaaS infrastructure.</li>
          </motion.ul>
        </div>
      </section>
      {/* Logo Carousel Below Video - full width, themed background */}
      <section className="w-full py-6 px-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="overflow-hidden"
        >
          <div
            className="flex gap-12 animate-logo-marquee py-4"
            style={{ minWidth: "100%" }}
          >
            {logos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Enterprise Logo"
                className="h-10 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition"
                draggable={false}
              />
            ))}
          </div>
        </motion.div>
      </section>
      {/* Carousel animation styles */}
      <style>{`
        @keyframes logo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-logo-marquee {
          animation: logo-marquee 30s linear infinite;
          width: 200%;
        }
      `}</style>
    </>
  );
};

export default HeroSection;
