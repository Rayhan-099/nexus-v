import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Phone, Lock, Car, MapPin } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', vehicleType: 'ICE'
  });
  const { register, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData);
    const token = localStorage.getItem('token');
    if (token) navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row-reverse relative">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative overflow-hidden z-10">
        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <div className="flex items-center gap-3 mb-6">
             <MapPin className="text-primary w-10 h-10" />
             <h1 className="text-6xl font-orbitron font-bold heading-gradient tracking-widest">JOIN NEXUS</h1>
          </div>
          <p className="text-2xl text-slate-300 font-inter font-light mb-8">
            Register your vehicle to access <span className="text-primary font-bold">real-time routing</span> and trusted service network.
          </p>
          <div className="glass-card p-6 rounded-xl backdrop-blur-0 bg-white/5 border-white/5">
             <h3 className="text-white font-orbitron font-bold mb-2">Why Register?</h3>
             <ul className="text-slate-400 text-sm space-y-2">
                <li>• Bypass wait lines at top car washes</li>
                <li>• Reserve EV charging spots in advance</li>
                <li>• AI-powered mechanic transparency</li>
             </ul>
          </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 relative z-20 bg-black/40 backdrop-blur-3xl border-r border-white/5 shadow-2xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden text-center">
            <h2 className="text-4xl font-orbitron font-bold heading-gradient mb-2">NEXUS-V</h2>
            <p className="text-primary/70 text-sm tracking-widest font-orbitron">CLIENT INTAKE</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400 text-sm">Fill in your details to establish a connection.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger/10 border border-danger/30 text-danger p-4 text-sm mb-6 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} className="glass-input pl-12 py-4" />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} className="glass-input pl-12 py-4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input type="text" name="phone" placeholder="Phone" onChange={handleChange} className="glass-input pl-12 py-4" />
              </div>
              <div className="relative group">
                <Car className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors pointer-events-none" />
                <select name="vehicleType" onChange={handleChange} className="glass-input pl-12 py-4 appearance-none">
                  <option value="ICE">ICE Vehicle</option>
                  <option value="EV">EV Vehicle</option>
                </select>
              </div>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="glass-input pl-12 py-4" />
            </div>

            <button type="submit" className="glass-button w-full py-4 mt-8 text-lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> ESTABLISHING LINK...</span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> CREATE ACCOUNT</span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">Already verified?</p>
            <Link to="/login" className="glass-button py-2 px-6 text-sm bg-transparent border-white/20 text-white hover:border-primary/50 hover:text-primary">
              Access Terminal
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
