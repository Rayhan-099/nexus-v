import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative overflow-hidden z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-3 mb-6">
             <Zap className="text-primary w-10 h-10" />
             <h1 className="text-6xl font-orbitron font-bold heading-gradient tracking-widest">NEXUS-V</h1>
          </div>
          <p className="text-2xl text-slate-300 font-inter font-light mb-8">
            Experience the future of <span className="text-primary font-bold">Smart Mobility</span>. Zero wait times, seamless integration.
          </p>
          <div className="flex gap-4">
             <div className="glass-card p-4 rounded-xl flex-1 backdrop-blur-0 bg-white/5 border-white/5">
                <p className="text-primary font-orbitron font-bold text-2xl">EV</p>
                <p className="text-slate-400 text-sm">Intelligent Charging</p>
             </div>
             <div className="glass-card p-4 rounded-xl flex-1 backdrop-blur-0 bg-white/5 border-white/5">
                <p className="text-primary font-orbitron font-bold text-2xl">AI</p>
                <p className="text-slate-400 text-sm">Trust Engine</p>
             </div>
         </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 relative z-20 bg-black/40 backdrop-blur-3xl border-l border-white/5 shadow-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden text-center">
            <h2 className="text-4xl font-orbitron font-bold heading-gradient mb-2">NEXUS-V</h2>
            <p className="text-primary/70 text-sm tracking-widest font-orbitron">CLIENT PORTAL</p>
          </div>
          
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to access the terminal.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger/10 border border-danger/30 text-danger p-4 text-sm mb-6 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" placeholder="Email Address" value={email} onChange={(e)=>setEmail(e.target.value)}
                className="glass-input pl-12 py-4 text-base" required 
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}
                className="glass-input pl-12 py-4 text-base" required 
              />
            </div>
            <button type="submit" className="glass-button w-full py-4 mt-8 text-lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> AUTHENTICATING...</span>
              ) : (
                <span className="flex items-center gap-2"><LogIn className="w-5 h-5" /> SIGN IN</span>
              )}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">First time here?</p>
            <Link to="/register" className="glass-button py-2 px-6 text-sm bg-transparent border-white/20 text-white hover:border-primary/50 hover:text-primary">
              Initialize Connection
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
