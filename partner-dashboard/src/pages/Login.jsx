import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-sm p-8"
      >
        <h2 className="text-2xl font-orbitron font-bold text-center text-primary mb-6">PARTNER LOGIN</h2>
        {error && <div className="bg-red-500/20 text-red-500 p-2 text-sm text-center mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Business Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
              required 
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-primary outline-none"
              required 
            />
          </div>
          <button type="submit" className="glass-button w-full py-3 mt-4" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          Not a partner? <Link to="/register" className="text-primary font-bold">Apply Here</Link>
        </p>
      </motion.div>
    </div>
  );
}
