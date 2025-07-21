import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const SignUpPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // Split name into first and last
    const [firstName, ...rest] = name.trim().split(' ');
    const lastName = rest.join(' ');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName: firstName || '',
          lastName: lastName || '',
          organizationName: org,
          subdomain: subdomain,
        }
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created! Please check your email to verify.');
      setTimeout(() => navigate("/login"), 1200);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 relative">
      {/* Background image */}
      <img src="/sign-up.png" alt="Sign Up" className="absolute inset-0 w-full h-full object-cover z-0 opacity-30" />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-900/70 to-purple-900/80 z-0" />
      {/* Signup form only, centered */}
      <div className="relative z-10 w-full flex items-center justify-center min-h-[80vh]">
        <form className="w-full max-w-md flex flex-col gap-4 bg-white/10 rounded-2xl p-6 shadow-2xl" onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
          <input
            type="text"
            placeholder="Organization"
            value={org}
            onChange={e => setOrg(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
          <input
            type="text"
            placeholder="Subdomain"
            value={subdomain}
            onChange={e => setSubdomain(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          {success && <div className="text-green-400 text-sm text-center">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition text-base"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          {/* OR divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-blue-400" />
            <span className="mx-2 text-blue-300 text-xs font-semibold">or</span>
            <div className="flex-1 h-px bg-blue-400" />
          </div>
          {/* SSO Signup with Google - styled like navbar login */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex items-center justify-center gap-2 bg-white text-blue-900 font-bold py-2 rounded-lg shadow-lg hover:scale-105 transition border border-blue-400 text-base"
          >
            <FcGoogle className="text-xl" /> Sign up with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
