import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, Car, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');
const MOCK_PARTNER_ID = "000000000000000000000000";

export default function Dashboard() {
  const [queueLength, setQueueLength] = useState(2);
  const [evStatus, setEvStatus] = useState('AVAILABLE');
  const [proofFile, setProofFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('queue_updated', (data) => {
      setQueueLength(data.newLength);
    });
    socket.on('station_status_change', (data) => {
      setEvStatus(data.status);
    });
    socket.on('proof_resolved', (data) => {
      setUploadStatus(`Proof was ${data.status}`);
      setTimeout(() => setUploadStatus(''), 5000);
    });
    return () => {
      socket.off('queue_updated');
      socket.off('station_status_change');
      socket.off('proof_resolved');
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const advanceQueue = () => {
    const newLen = Math.max(0, queueLength - 1);
    setQueueLength(newLen);
    socket.emit('join_queue', { partnerId: MOCK_PARTNER_ID, newLength: newLen });
  };

  const increaseQueue = () => {
    const newLen = queueLength + 1;
    setQueueLength(newLen);
    socket.emit('join_queue', { partnerId: MOCK_PARTNER_ID, newLength: newLen });
  };

  const handleUpload = async () => {
    if (!proofFile) return alert('Select a file first');
    setUploadStatus('Validating via AI...');
    const formData = new FormData();
    formData.append('image', proofFile);
    formData.append('partnerId', MOCK_PARTNER_ID);
    formData.append('description', 'Brake pad replacement');
    formData.append('estimatedCost', 4500);

    try {
      const res = await fetch('http://localhost:5000/api/trust/upload-proof', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
         setUploadStatus('Sent to customer! Waiting for approval...');
      } else {
         setUploadStatus(`Rejected: ${data.error} - ${data.reason||''}`);
      }
    } catch(e) {
      setUploadStatus('Mock: Requires python engine. Sending fake alert to client...');
      socket.emit('proof_received', { status: 'PENDING', estimatedCost: 4500, description: 'Brake pad replacement' });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const cardVariants = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } } };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <h1 className="text-4xl font-orbitron font-bold text-primary tracking-widest flex items-center gap-4 drop-shadow-[0_0_8px_#00F2FF]">
          NEXUS-V <span className="text-sm font-inter text-slate-400 drop-shadow-none">PARTNER PORTAL</span>
        </h1>
        <div className="flex gap-4 items-center">
          {user && (
            <div className="flex items-center text-sm text-slate-300">
              <span className="font-bold text-primary mr-4">{user.businessName}</span>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-full border border-white/10 mr-2">
                <LogOut size={16} />
              </button>
            </div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-orbitron text-sm shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            SYSTEM ONLINE
          </motion.div>
        </div>
      </motion.header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <motion.section variants={cardVariants} className="glass-card p-6 flex flex-col items-center hover:bg-white/10 transition-colors">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
            <Car className="w-12 h-12 text-primary mb-4 drop-shadow-[0_0_10px_#00F2FF]" />
          </motion.div>
          <h2 className="text-xl font-orbitron font-bold mb-2">Live Queue</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Manage zero-wait wash lines.</p>
          
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={queueLength} initial={{ scale: 0.5, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-6xl font-orbitron font-bold text-white mb-8"
            >
              {queueLength} <span className="text-xl text-slate-500">AHEAD</span>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex gap-4 w-full">
            <motion.button whileTap={{ scale: 0.95 }} onClick={advanceQueue} className="glass-button-success flex-1" disabled={queueLength === 0}>FINISH -1</motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={increaseQueue} className="glass-button flex-1">ADD +1</motion.button>
          </div>
        </motion.section>

        <motion.section variants={cardVariants} className="glass-card p-6 flex flex-col items-center border-warning/30 hover:bg-white/10 transition-colors">
          <Camera className="w-12 h-12 text-warning mb-4 drop-shadow-[0_0_10px_rgba(255,176,0,0.8)]" />
          <h2 className="text-xl font-orbitron font-bold mb-2 text-warning">Trust Engine</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Upload proof of damage.</p>
          
          <input 
            type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files[0])}
            className="mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-warning/20 file:text-warning hover:file:bg-warning/30 cursor-pointer w-full text-slate-400"
          />
          
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleUpload} className="glass-button w-full border-warning text-warning hover:bg-warning/20 shadow-[0_0_15px_rgba(255,176,0,0.2)] hover:shadow-[0_0_25px_rgba(255,176,0,0.6)]">
            UPLOAD & VALIDATE
          </motion.button>
          
          <AnimatePresence>
            {uploadStatus && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-sm font-bold text-center text-warning">
                {uploadStatus}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section variants={cardVariants} className="glass-card p-6 flex flex-col items-center border-danger/30 hover:bg-white/10 transition-colors">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
             <Zap className="w-12 h-12 text-success mb-4 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
          </motion.div>
          <h2 className="text-xl font-orbitron font-bold mb-2">EV Station</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Live charger status.</p>
          
          <motion.div 
            key={evStatus}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            className={`mt-4 w-full text-center px-6 py-4 rounded-xl border-2 uppercase font-orbitron font-bold tracking-wider text-xl mb-8
              ${evStatus === 'AVAILABLE' ? 'border-success text-success bg-success/10 shadow-[0_0_15px_rgba(57,255,20,0.2)]' : ''}
              ${evStatus === 'BOOKED' ? 'border-warning text-warning bg-warning/10 shadow-[0_0_15px_rgba(255,176,0,0.2)]' : ''}
              ${evStatus === 'CHARGING' ? 'border-primary text-primary bg-primary/10' : ''}
              ${evStatus === 'OFFLINE' ? 'border-danger text-danger bg-danger/10 shadow-[0_0_15px_rgba(255,42,42,0.2)]' : ''}
            `}
          >
            {evStatus}
          </motion.div>

          <button className="glass-button-danger w-full opacity-50 cursor-not-allowed shadow-none" disabled>REMOTELY MANAGED</button>
        </motion.section>

      </motion.div>
    </div>
  );
}
