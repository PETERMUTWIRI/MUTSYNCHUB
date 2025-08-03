// src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { X, ChevronRight, Check } from "lucide-react";
import { useStackAuth } from '@stackframe/react';

const SignUpPage: React.FC = () => {
  const { signUp } = useStackAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Typing animation state
  const messages = [
    "Welcome back to MutsynChub – unlock your analytics.",
    "Seamless login. Powerful dashboards.",
    "Enterprise‑grade security for your data.",
  ];
  const [typedMessage, setTypedMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageRef = useRef(currentMessageIndex);

  // Typing effect
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
      const nextTimeout = setTimeout(() => {
        setCurrentMessageIndex(prev => (prev + 1) % messages.length);
      }, 3000);
      return () => clearTimeout(nextTimeout);
    }
  }, [currentIndex, currentMessageIndex]);

  // Handle email/password signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signUp('email', { email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard"); // adjust route to your app
    }
    setLoading(false);
  };

  // Handle Google OAuth signup
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");

    const { error } = await signUp('google');

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Left side - Login Form */}
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
              <h2 className="text-2xl font-bold text-white">Sign Up</h2>
              <button 
                onClick={() => navigate("/")}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
            <p className="text-blue-300 mb-4">Access your dashboard and analytics</p>

            <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white border border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />

              {error && (
                <motion.div 
                  className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-300 text-base group"
              >
                <span className="relative z-10">
                  {loading ? "Logging in..." : "Login"}
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
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-2 bg-white text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-300 border border-blue-500/50 text-base"
              >
                <FcGoogle className="text-xl" /> Sign up with Google
              </button>

              <div className="mt-4 text-center text-blue-300">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-white font-semibold underline hover:text-teal-300 transition-colors"
                >
                  Sign up here
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
            Welcome back to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
              MutsynChub
            </span>
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
              "Secure access to your data",
              "Real‑time analytics dashboard",
              "Enterprise‑grade compliance",
              "Powerful automation workflows",
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
      </motion.div>
    </div>
  );
};

export default SignUpPage;
