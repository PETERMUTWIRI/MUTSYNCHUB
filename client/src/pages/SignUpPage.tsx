import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { X, ChevronRight, Check } from "lucide-react";
import { stackClientApp } from "@/lib/stack-auth";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Marketing messages to display with typing effect
  const messages = [
    "Your enterprise-grade automation platform for seamless integration and growth.",
    "Transform your business with powerful automation tools and analytics.",
    "Connect, automate, and grow with our all-in-one business solution.",
    "Secure, scalable, and designed for modern enterprise needs."
  ];
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageRef = useRef(currentMessageIndex);

  // Redirect to Neon Auth handler route for signup
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/handler/sign-up?redirectTo=/dashboard';
  };

  // Redirect to Neon Auth handler route for Google signup
  const handleGoogleSignup = () => {
    window.location.href = '/handler/sign-up?provider=google&redirectTo=/dashboard';
  };

  // Typing effect for marketing message
  useEffect(() => {
    messageRef.current = currentMessageIndex;
    setCurrentIndex(0);
    setTypedMessage("");
  }, [currentMessageIndex]);

  useEffect(() => {
    if (currentIndex < messages[messageRef.current].length) {
      const timeout = setTimeout(() => {
        setTypedMessage(prev => prev + messages[messageRef.current][currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 40);
      
      return () => clearTimeout(timeout);
    } else {
      // Move to next message after a delay
      const nextTimeout = setTimeout(() => {
        setCurrentMessageIndex(prev => (prev + 1) % messages.length);
      }, 3000);
      
      return () => clearTimeout(nextTimeout);
    }
  }, [currentIndex, currentMessageIndex]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
            }}
            animate={{
              y: [0, Math.random() * 30 - 15],
              x: [0, Math.random() * 30 - 15],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Left side - Signup Form */}
      <motion.div 
        className="relative z-10 w-full md:w-1/2 flex items-center justify-center min-h-screen p-4 md:p-8"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <motion.div 
            className="w-full flex flex-col gap-6 bg-slate-900/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-indigo-500/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <button 
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
            
            <p className="text-blue-300 mb-4">Join our platform to unlock powerful automation tools</p>
            
            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Organization"
                  value={org}
                  onChange={e => setOrg(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Subdomain"
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
              
              {error && (
                <motion.div 
                  className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  className="text-green-400 text-sm text-center p-2 bg-green-900/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-300 text-base group"
              >
                <span className="relative z-10">
                  {loading ? "Signing Up..." : "Create Account"}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
              
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-blue-500/30" />
                <span className="mx-2 text-blue-300 text-xs font-semibold">or</span>
                <div className="flex-1 h-px bg-blue-500/30" />
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-300 border border-blue-500/50 text-base"
              >
                <FcGoogle className="text-xl" /> Sign up with Google
              </button>
              
              <div className="mt-4 text-center text-blue-300">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white font-semibold underline hover:text-teal-300 transition-colors"
                >
                  Login here
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Right side - Marketing Panel */}
      <motion.div 
        className="relative z-10 w-full md:w-1/2 min-h-screen hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-800/30 to-purple-900/30"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="w-full max-w-lg text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">MutsynChub</span>
          </motion.h1>
          
          <motion.div 
            className="text-xl md:text-2xl text-blue-200 min-h-[120px] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="flex justify-center">
              {typedMessage}
              <motion.span 
                className="ml-1 inline-block w-1 h-6 bg-blue-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 gap-6 max-w-md mx-auto mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              "Enterprise-grade security & compliance",
              "Powerful automation workflows",
              "Real-time analytics dashboard",
              "Seamless third-party integrations",
              "Scalable infrastructure for growth",
              "24/7 dedicated support"
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3 text-left text-blue-100"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Check className="text-blue-300" size={18} />
                </div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <button 
              onClick={() => navigate("/features")}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-full transition-colors group"
            >
              Explore our platform
              <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-10 right-10 w-24 h-24 rounded-full bg-teal-500/10 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        
        <motion.div 
          className="absolute bottom-20 left-16 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignUpPage;