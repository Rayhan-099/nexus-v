import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm p-8"
      >
        <h2 className="text-2xl font-orbitron font-bold text-center text-primary mb-6">REGISTER</h2>
        {error && <div className="bg-red-500/20 text-red-500 p-2 text-sm text-center mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <input 
            type="text" name="name" placeholder="Full Name" required 
            onChange={handleChange}
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
          />
          <input 
            type="email" name="email" placeholder="Email Address" required 
            onChange={handleChange}
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
          />
          <input 
            type="text" name="phone" placeholder="Phone Number"
            onChange={handleChange}
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
          />
          <input 
            type="password" name="password" placeholder="Password" required 
            onChange={handleChange}
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
          />
          <select 
            name="vehicleType" onChange={handleChange}
            className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-slate-300 focus:border-primary outline-none"
          >
            <option value="ICE">ICE (Internal Combustion Engine)</option>
            <option value="EV">EV (Electric Vehicle)</option>
          </select>

          <button type="submit" className="glass-button w-full py-3 mt-4" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account? <Link to="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
