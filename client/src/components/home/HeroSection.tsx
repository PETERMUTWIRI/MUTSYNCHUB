// src/components/home/HeroSection.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Link } from "react-router-dom";

// Import logos
import Aws from "../../assets/logos/aws.svg";
import Cisco from "../../assets/logos/cisco.svg";
import GoogleCloud from "../../assets/logos/googlecloud.svg";
import ISO from "../../assets/logos/iso.svg";
import Microsoft from "../../assets/logos/microsoft.svg";
import Fortinet from "../../assets/logos/fortinet.svg";
import Oracle from "../../assets/logos/oracle.svg";
import IBM from "../../assets/logos/ibm.svg";
import SAP from "../../assets/logos/sap.svg";
import GDPR from "../../assets/logos/gdpr.svg";
import NIST from "../../assets/logos/nist.svg";

const trustLogos = [
  Aws, Cisco, Fortinet, GDPR, GoogleCloud, 
  IBM, ISO, Microsoft, NIST, Oracle, SAP
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  // Dummy login handler (replace with your real logic or import from Navbar)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setLoginError("Invalid credentials");
    }, 1000);
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Generate revenue data points
    const generateData = (count: number) => {
      const data = [];
      let lastRevenue = 500;
      let lastVolume = 200;
      
      for (let i = 0; i < count; i++) {
        // Simulate realistic business trends
        const trend = Math.sin(i / 20) * 0.8 + Math.cos(i / 8) * 0.5;
        const volatility = Math.random() * 0.4 + 0.8;
        
        const revenue = lastRevenue * (1 + (trend * 0.02) * volatility);
        const volume = lastVolume * (1 + (trend * 0.03) * volatility);
        
        data.push({
          x: i,
          revenue: Math.max(100, revenue),
          volume: Math.max(50, volume)
        });
        
        lastRevenue = revenue;
        lastVolume = volume;
      }
      
      return data;
    };
    
    const data = generateData(150);
    let animationFrame: number;
    let progress = 0;
    
    // Animation function
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0c1445');
      gradient.addColorStop(1, '#1a237e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate visible points based on animation progress
      const visiblePoints = Math.min(data.length, Math.floor(progress * data.length));
      const visibleData = data.slice(0, visiblePoints);
      
      if (visibleData.length < 2) {
        progress += 0.01;
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Draw vertical grid lines
      const gridSize = 80;
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw horizontal grid lines
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Calculate scales
      const margin = 80;
      const graphWidth = canvas.width - margin * 2;
      const graphHeight = canvas.height - margin * 2;
      
      const minRevenue = Math.min(...visibleData.map(d => d.revenue));
      const maxRevenue = Math.max(...visibleData.map(d => d.revenue));
      const minVolume = Math.min(...visibleData.map(d => d.volume));
      const maxVolume = Math.max(...visibleData.map(d => d.volume));
      
      // Draw volume bars (candlestick style)
      const barWidth = graphWidth / visibleData.length;
      visibleData.forEach((point, i) => {
        const x = margin + i * barWidth;
        const barHeight = (point.volume / maxVolume) * graphHeight * 0.3;
        const y = canvas.height - margin - barHeight;
        
        // Color based on trend
        const isUp = i > 0 && point.volume > visibleData[i - 1].volume;
        ctx.fillStyle = isUp ? 'rgba(76, 175, 80, 0.7)' : 'rgba(244, 67, 54, 0.7)';
        
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      });
      
      // Draw revenue line
      ctx.beginPath();
      ctx.strokeStyle = '#64b5f6';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      
      visibleData.forEach((point, i) => {
        const x = margin + i * barWidth + barWidth / 2;
        const y = margin + graphHeight - ((point.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw gradient under revenue line
      if (visibleData.length > 1) {
        const lastPoint = visibleData[visibleData.length - 1];
        const lastX = margin + (visibleData.length - 1) * barWidth + barWidth / 2;
        const lastY = margin + graphHeight - ((lastPoint.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        
        ctx.beginPath();
        ctx.moveTo(margin, margin + graphHeight);
        visibleData.forEach((point, i) => {
          const x = margin + i * barWidth + barWidth / 2;
          const y = margin + graphHeight - ((point.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(lastX, margin + graphHeight);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(100, 181, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(100, 181, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Draw axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      
      // Y-axis labels
      ctx.fillText(`$${Math.round(maxRevenue / 1000)}K`, 10, margin + 15);
      ctx.fillText(`$${Math.round(minRevenue / 1000)}K`, 10, canvas.height - margin);
      
      // Draw moving indicator
      if (visibleData.length > 1) {
        const lastPoint = visibleData[visibleData.length - 1];
        const lastX = margin + (visibleData.length - 1) * barWidth + barWidth / 2;
        const lastY = margin + graphHeight - ((lastPoint.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        
        // Draw indicator circle
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#64b5f6';
        ctx.fill();
        
        // Draw pulse animation
        ctx.beginPath();
        ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 181, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw value indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`$${Math.round(lastPoint.revenue)}`, lastX + 15, lastY - 10);
      }
      
      // Continue animation
      progress += 0.005;
      if (progress < 1.1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Reset animation when complete
        progress = 0;
        setTimeout(() => {
          animationFrame = requestAnimationFrame(animate);
        }, 2000);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Canvas-based revenue visualization */}
      <div className="relative overflow-hidden w-full h-[700px] flex items-center justify-start shadow-xl">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/40 to-purple-500/30 z-10" />
        
        {/* Hero Content */}
        <div className="relative z-20 flex flex-col justify-center items-start h-full px-8 md:px-24 pt-24">
          {/* Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-[#22D3EE] text-4xl md:text-6xl font-bold mb-6 max-w-2xl"
          >
            The Intelligence Platform for <span className="text-[#22D3EE]">Modern Enterprises</span>
          </motion.h1>

          {/* Section Heading (if any) */}
          {/* Example: <h2 className="text-3xl font-bold text-[#22D3EE] mb-2">Section Heading</h2> */}

          {/* Subheading removed as per request to avoid duplication with the button below */}

          {/* Body Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-lg md:text-xl text-[#E5E7EB] font-normal max-w-2xl mb-8 leading-relaxed"
          >

            Accurate,Secure and Scalable.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-6 text-xl font-bold rounded-xl shadow-lg"
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/signup');
                }
              }}
            >
              Explore Analytics Engine
              <span className="ml-2 text-2xl font-bold text-white flex items-center"><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
            </Button>
            {/* TODO: Implement login modal if not already present */}
            <Button
              variant="outline"
              className="bg-transparent border-white text-[#22D3EE] hover:bg-white/10 px-8 py-6 text-xl font-bold rounded-xl"
              onClick={() => navigate('/solutions')}
            >
              View Enterprise Solutions
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Trust Carousel Section */}
      <section className="w-full py-8 px-0 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 border-t border-white/10">
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-8 animate-logo-marquee py-4 w-max"
            style={{ minWidth: "100vw" }}
            aria-label="Trusted Companies Carousel"
            whileHover="group"
            whileFocus="group"
          >
            {/* Duplicate logos for seamless loop */}
            {[...trustLogos, ...trustLogos].map((src, idx) => (
              <motion.div
                key={idx}
                className="rounded-full bg-white/10 p-3 flex items-center justify-center shadow-md"
                tabIndex={0}
                aria-label="Trusted Company Logo"
                whileHover={{
                  scale: 1.12,
                  rotate: 3,
                  boxShadow: "0 0 16px 0 rgba(100,181,246,0.25)",
                }}
                whileTap={{
                  scale: 1.08,
                  rotate: -3,
                  boxShadow: "0 0 12px 0 rgba(100,181,246,0.18)",
                }}
                variants={{
                  group: {
                    scale: 1.08,
                    rotate: [0, 3, -3, 0],
                    transition: { duration: 0.6, repeat: Infinity, repeatType: "loop", type: "tween" }
                  }
                }}
                transition={{ type: "tween", duration: 0.6, repeat: Infinity, repeatType: "loop" }}
              >
                <motion.img
                  src={src}
                  alt="Enterprise Logo"
                  className="h-10 w-10 object-contain grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition rounded-full"
                  draggable={false}
                  whileHover={{
                    scale: 1.18,
                    filter: "drop-shadow(0 0 8px #64b5f6)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <p className="text-center text-[#A5F3FC] text-xl font-semibold">
            Trusted by enterprises worldwide and compliant with industry-leading standards
          </p>
        </div>
      </section>
      
      {/* Carousel animation styles */}
      <style>{`
        @keyframes logo-marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100vw); }
        }
        .animate-logo-marquee {
          animation: logo-marquee 30s linear infinite;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default HeroSection;