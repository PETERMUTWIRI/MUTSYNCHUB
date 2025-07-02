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
import stracture from '/stracture.png';

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
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 py-24 px-8 text-white">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute bottom-20 left-20 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      {/* Hero Content Row */}
      <div className="relative z-10 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-left md:text-left gap-10 md:gap-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 px-2 md:px-8 lg:px-16 xl:px-24"
        >
          <motion.div variants={item} className="mb-6">
            <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-md">
              New: AI-powered analytics →
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:leading-[1.2] mb-8"
          >
            Accelerate Your <span className="text-blue-300">Digital</span>{" "}
            Transformation
          </motion.h1>

          <motion.ul
            variants={item}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl space-y-4 list-disc list-inside pl-4"
          >
            <li>Automate complex workflows to drive operational efficiency across your enterprise.</li>
            <li>Gain deep, actionable data insights for confident, strategic decision-making.</li>
            <li>Scale operations seamlessly with AI-powered analytics.</li>
            <li>Empower teams with secure, integrated, and future-ready SaaS infrastructure.</li>
          </motion.ul>
        </motion.div>
        {/* Structure Image on the right */}
        <div className="flex-1 flex items-stretch justify-center md:justify-end w-full max-w-none" style={{ minHeight: '500px' }}>
          <img
            src={stracture}
            alt="AI-Driven Analytics Pipeline"
            className="rounded-2xl shadow-2xl object-contain bg-white/10 h-full"
            style={{ height: '100%', width: 'auto', marginLeft: '1rem', alignSelf: 'stretch', maxHeight: '900px', minHeight: '500px' }}
          />
        </div>
      </div>

      {/* Logo Carousel */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl text-center mt-16"
      >
        <div className="overflow-hidden w-full">
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
        </div>
      </motion.div>

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
    </section>
  );
};

export default HeroSection;
