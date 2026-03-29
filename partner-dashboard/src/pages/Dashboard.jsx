import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, Car, LogOut, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';
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
      setUploadStatus('Mock: Requires python engine. Sending fake alert... ');
      socket.emit('proof_received', { status: 'PENDING', estimatedCost: 4500, description: 'Brake pad replacement' });
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      
      {/* Side Navigation */}
      <motion.aside 
        initial={{ x: -100 }} animate={{ x: 0 }}
        className="w-20 lg:w-64 h-full glass-card border-none rounded-none border-r border-white/5 flex flex-col justify-between py-8 px-4 z-10 hidden md:flex"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest flex items-center justify-center lg:justify-start gap-2 mb-12">
            PARTNER<span className="text-primary hidden lg:block uppercase text-xs mt-2 ml-1">Node</span>
          </h1>
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-4 text-primary bg-primary/10 p-4 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
              <LayoutDashboard size={24} />
              <span className="hidden lg:block font-bold">Control Panel</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-slate-400 hover:text-white p-4 rounded-xl hover:bg-white/5 transition-all">
              <Settings size={24} />
              <span className="hidden lg:block font-bold">Preferences</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-slate-400 hover:text-white p-4 rounded-xl hover:bg-white/5 transition-all">
              <UserIcon size={24} />
              <span className="hidden lg:block font-bold">Profile</span>
            </a>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center lg:justify-start gap-4 text-danger hover:text-danger/80 p-4 rounded-xl hover:bg-danger/10 transition-all w-full">
          <LogOut size={24} />
          <span className="hidden lg:block font-bold">Disconnect</span>
        </button>
      </motion.aside>

      {/* Main Content Dashboard */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative z-0">
        
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="md:hidden">
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest flex items-center">
              PARTNER<span className="text-primary">-NODE</span>
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex gap-4 items-center">
              {user && (
                <div className="hidden md:block text-slate-300 text-sm mr-4">
                  Node Operator: <span className="font-bold text-white">{user.businessName}</span>
                </div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-orbitron text-sm shadow-[0_0_15px_rgba(57,255,20,0.2)] border border-success/30">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                SYSTEM ONLINE
              </motion.div>
              <button onClick={handleLogout} className="md:hidden text-slate-400 p-2 glass-card rounded-full"><LogOut size={20}/></button>
            </div>
          </div>
        </header>

        <div className="mb-8 hidden md:block">
          <h2 className="text-4xl font-bold font-inter mb-4 text-white">Command Center</h2>
          <p className="text-slate-400">Manage live queues, upload trust proofs, and monitor your EV station array from here.</p>
        </div>

        {/* Bento Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min pb-24">
          
          {/* Live Queue Box (Big Span) */}
          <motion.div variants={cardVariants} className="glass-card p-6 border-t-4 border-t-primary lg:col-span-2 row-span-2 flex flex-col group relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
                <Car className="w-64 h-64 text-primary" />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                      <h2 className="text-3xl font-orbitron font-bold mb-2">Live Queue</h2>
                      <p className="text-slate-400 text-sm">Automated line management active.</p>
                  </div>
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                    <Car className="w-10 h-10 text-primary drop-shadow-[0_0_10px_#00F2FF]" />
                  </motion.div>
                </div>
                
                <div className="flex flex-col items-center justify-center flex-1 my-8">
                  <AnimatePresence mode="popLayout">
                    <motion.div 
                      key={queueLength} initial={{ scale: 0.5, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 1.5, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-8xl font-orbitron font-bold text-white mb-2 tracking-tighter"
                    >
                      {queueLength}
                    </motion.div>
                  </AnimatePresence>
                  <p className="text-xl text-slate-500 font-orbitron tracking-widest font-bold">VEHICLES AHEAD</p>
                </div>
                
                <div className="flex gap-4 w-full mt-auto">
                  <motion.button whileTap={{ scale: 0.98 }} onClick={advanceQueue} className="glass-button-success flex-1 py-4 text-lg font-bold" disabled={queueLength === 0}>FINISH -1</motion.button>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={increaseQueue} className="glass-button flex-1 py-4 text-lg font-bold">ADD +1</motion.button>
                </div>
            </div>
          </motion.div>

          {/* Trust Engine Card */}
          <motion.div variants={cardVariants} className="glass-card p-6 border-t-4 border-t-warning flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-orbitron font-bold text-white">Trust Engine</h2>
                  <Camera className="w-8 h-8 text-warning drop-shadow-[0_0_10px_rgba(255,176,0,0.8)]" />
              </div>
              <p className="text-slate-400 text-sm mb-6">Upload photographic proof of damages to auto-generate verified customer estimates.</p>
              
              <div className="bg-black/30 p-4 border border-white/5 rounded-xl mb-6 flex flex-col items-center justify-center border-dashed group-hover:bg-warning/5 transition-colors">
                <input 
                  type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
                    file:bg-warning/20 file:text-warning hover:file:bg-warning/30 cursor-pointer"
                />
              </div>

              <motion.button whileTap={{ scale: 0.98 }} onClick={handleUpload} className="glass-button w-full border-warning text-warning hover:bg-warning/20 shadow-[0_0_15px_rgba(255,176,0,0.2)]">
                UPLOAD & VALIDATE
              </motion.button>
              
              <AnimatePresence>
                {uploadStatus && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-sm font-bold text-center text-warning bg-warning/10 p-2 rounded-lg border border-warning/20">
                    {uploadStatus}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* EV Station Card */}
          <motion.div variants={cardVariants} className="glass-card p-6 border-t-4 border-t-danger flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-orbitron font-bold text-white">EV Station Array</h2>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Zap className="w-8 h-8 text-success drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
                  </motion.div>
              </div>
              <p className="text-slate-400 text-sm mb-6">Live status of your 50kW DC chargers.</p>
              
              <motion.div 
                key={evStatus}
                initial={{ rotateX: 90 }} animate={{ rotateX: 0 }}
                className={`w-full text-center px-6 py-8 rounded-xl border flex flex-col items-center justify-center
                  ${evStatus === 'AVAILABLE' ? 'border-success/30 bg-success/10 shadow-[0_0_15px_rgba(57,255,20,0.2)]' : ''}
                  ${evStatus === 'BOOKED' ? 'border-warning/30 bg-warning/10 shadow-[0_0_15px_rgba(255,176,0,0.2)]' : ''}
                  ${evStatus === 'CHARGING' ? 'border-primary/30 bg-primary/10' : ''}
                  ${evStatus === 'OFFLINE' ? 'border-danger/30 bg-danger/10 shadow-[0_0_15px_rgba(255,42,42,0.2)]' : ''}
                `}
              >
                <span className="text-sm uppercase tracking-widest text-slate-300 mb-2">Slot 1 Status</span>
                <span className={`font-orbitron font-bold text-3xl
                  ${evStatus === 'AVAILABLE' ? 'text-success' : evStatus === 'BOOKED' ? 'text-warning' : evStatus === 'OFFLINE' ? 'text-danger' : 'text-primary' }
                `}>{evStatus}</span>
              </motion.div>
            </div>

            <button className="glass-button-danger w-full opacity-50 cursor-not-allowed shadow-none mt-6" disabled>MANAGED BY CLIENTS</button>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
