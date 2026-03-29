import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, CheckCircle, XCircle, LogOut, Map, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');
const MOCK_PARTNER_ID = "000000000000000000000000";

export default function Dashboard() {
  const [queueLength, setQueueLength] = useState(2);
  const [inQueue, setInQueue] = useState(false);
  const [evStatus, setEvStatus] = useState('AVAILABLE');
  const [proofAlert, setProofAlert] = useState(null);
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('queue_updated', (data) => {
      setQueueLength(data.newLength);
    });
    socket.on('station_status_change', (data) => {
      setEvStatus(data.status);
    });
    socket.on('proof_received', (data) => {
      setProofAlert(data);
    });
    return () => {
      socket.off('queue_updated');
      socket.off('station_status_change');
      socket.off('proof_received');
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const joinWashQueue = () => {
    setInQueue(true);
    const newLen = queueLength + 1;
    setQueueLength(newLen);
    socket.emit('join_queue', { partnerId: MOCK_PARTNER_ID, newLength: newLen });
  };

  const reserveEVSlot = () => {
    setEvStatus('BOOKED');
    socket.emit('ev_slot_reserved', { stationId: MOCK_PARTNER_ID, slotId: 'slot1' });
  };

  const resolveProof = async (status) => {
    try {
      await fetch(`http://localhost:5000/api/trust/resolve-proof/${proofAlert?._id || 'mock_id'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setProofAlert(null);
    } catch(e) {
      console.error(e);
      setProofAlert(null);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Proof Alert Modal */}
      <AnimatePresence>
        {proofAlert && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div 
                  initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="glass-card p-6 w-full max-w-lg border-warning shadow-[0_0_30px_rgba(255,176,0,0.2)]"
                >
                    <h2 className="text-xl font-orbitron text-warning mb-2 flex items-center gap-2">
                       <Camera className="text-warning"/> AI Trust Alert
                    </h2>
                    <p className="text-sm text-slate-300 mb-4">Gemini AI has analyzed mechanic-uploaded repair evidence.</p>
                    
                    <div className="bg-black/50 p-4 rounded-xl mb-4 relative overflow-hidden">
                        {proofAlert.imageUrl && (
                          <img src={proofAlert.imageUrl} alt="Proof" className="w-full h-40 object-cover rounded-lg mb-3 opacity-80" />
                        )}
                        <motion.div 
                          className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_10px_#00F2FF]"
                          animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-base font-semibold">{proofAlert.description}</p>
                        <p className="text-2xl font-orbitron text-primary mt-2">₹{proofAlert.estimatedCost}</p>
                    </div>

                    {/* AI Analysis Details */}
                    {proofAlert.aiAnalysis && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                          <span className="text-xs uppercase tracking-widest text-slate-400">AI Verdict</span>
                          <span className={`font-orbitron font-bold text-sm px-3 py-1 rounded-full border ${
                            proofAlert.aiAnalysis.aiVerdict === 'APPROVED' ? 'text-success bg-success/10 border-success/30' :
                            proofAlert.aiAnalysis.aiVerdict === 'FLAGGED' ? 'text-warning bg-warning/10 border-warning/30' :
                            'text-danger bg-danger/10 border-danger/30'
                          }`}>
                            {proofAlert.aiAnalysis.aiVerdict}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-black/30 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                            <p className="font-orbitron text-sm text-primary font-bold">{proofAlert.aiAnalysis.confidence}%</p>
                          </div>
                          <div className="bg-black/30 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Severity</p>
                            <p className={`font-orbitron text-sm font-bold ${
                              proofAlert.aiAnalysis.severity === 'CRITICAL' ? 'text-danger' : proofAlert.aiAnalysis.severity === 'HIGH' ? 'text-warning' : 'text-primary'
                            }`}>{proofAlert.aiAnalysis.severity}</p>
                          </div>
                          <div className="bg-black/30 p-2 rounded-lg text-center">
                            <p className="text-[10px] text-slate-500 uppercase">Type</p>
                            <p className="text-[11px] text-white truncate">{proofAlert.aiAnalysis.damageType}</p>
                          </div>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg">
                          <p className="text-[10px] text-slate-500 uppercase mb-1">AI Reasoning</p>
                          <p className="text-xs text-slate-300 italic">{proofAlert.aiAnalysis.reasoning}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                        <button onClick={() => resolveProof('REJECTED')} className="glass-button-danger flex-1 flex items-center justify-center gap-2 py-4">
                          <XCircle size={20}/> REJECT
                        </button>
                        <button onClick={() => resolveProof('APPROVED')} className="glass-button-success flex-1 flex items-center justify-center gap-2 py-4">
                          <CheckCircle size={20}/> APPROVE
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Side Navigation */}
      <motion.aside 
        initial={{ x: -100 }} animate={{ x: 0 }}
        className="w-20 lg:w-64 h-full glass-card border-none rounded-none border-r border-white/5 flex flex-col justify-between py-8 px-4 z-10 hidden md:flex"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest flex items-center justify-center lg:justify-start gap-2 mb-12">
            <Zap className="text-primary hidden lg:block" /> N<span className="text-primary">-V</span>
          </h1>
          <nav className="space-y-4">
            <a href="#" className="flex items-center gap-4 text-primary bg-primary/10 p-4 rounded-xl border border-primary/20">
              <LayoutDashboard size={24} />
              <span className="hidden lg:block font-bold">Terminal</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-slate-400 hover:text-white p-4 rounded-xl hover:bg-white/5 transition-all">
              <Map size={24} />
              <span className="hidden lg:block font-bold">Map View</span>
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

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative z-0">
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4 md:hidden">
          <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest flex items-center">
            NEXUS<span className="text-primary">-V</span>
          </h1>
          <button onClick={handleLogout} className="text-slate-400 p-2 glass-card rounded-full"><LogOut size={20}/></button>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl font-bold font-inter mb-2 text-white">Welcome, {user?.name || 'Commander'}</h2>
          <p className="text-slate-400">System architecture online. All nearby nodes are operational.</p>
        </div>

        {/* Bento Grid layout */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          
          {/* QuickWash Card - Big Span */}
          <motion.div variants={itemVariants} className="glass-card p-6 border-t-4 border-t-primary lg:col-span-2 row-span-2 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h3 className="font-orbitron font-bold text-3xl text-white mb-2">QuickWash Hub</h3>
                      <p className="text-sm text-slate-400">0.8 km away • Automated Zero-Wait Line</p>
                  </div>
                  <motion.div 
                    key={queueLength} initial={{ scale: 1.5, color: '#fff' }} animate={{ scale: 1, color: '#00F2FF' }}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-xl text-lg font-bold border border-primary/30 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                  >
                      {queueLength} AHEAD
                  </motion.div>
              </div>
              <p className="text-slate-300 text-sm max-w-md leading-relaxed mb-8">
                Tired of waiting? Join our AI-regulated live queue. We use dynamic slotting to guarantee you arrive exactly when a wash bay opens up.
              </p>
            </div>
            {inQueue ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center py-4 bg-success/20 text-success rounded-xl font-orbitron tracking-widest border border-success/30 font-bold shadow-[0_0_15px_rgba(57,255,20,0.2)] text-xl">
                    QUEUE POSITION LOCKED
                </motion.div>
            ) : (
                <button onClick={joinWashQueue} className="glass-button w-full py-4 text-lg">ENTER LIVE QUEUE</button>
            )}
          </motion.div>

          {/* EV Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 border-t-4 border-t-success flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <h3 className="font-orbitron font-bold text-xl text-white">EV Charge Sector</h3>
                  <Zap className={evStatus === 'AVAILABLE' ? "text-success drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]" : "text-warning drop-shadow-[0_0_12px_rgba(255,176,0,0.8)]"} size={28} />
              </div>
              <p className="text-sm text-slate-400 mb-6">1.2 km away • 50kW DC Fast Charge</p>
              <div className="mb-8">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Node Status</p>
                  <motion.p key={evStatus} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`font-orbitron font-bold text-2xl ${evStatus==='AVAILABLE'?'text-success':evStatus==='BOOKED'?'text-warning':'text-danger'}`}>
                    {evStatus}
                  </motion.p>
              </div>
            </div>
            {evStatus === 'AVAILABLE' ? (
                <button onClick={reserveEVSlot} className="glass-button w-full py-3">RESERVE (15m)</button>
            ) : (
                <button disabled className="glass-button w-full py-3 opacity-50 cursor-not-allowed border-slate-500 text-slate-500 bg-transparent shadow-none hover:bg-transparent">UNAVAILABLE</button>
            )}
          </motion.div>

          {/* Trust Engine Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 border-t-4 border-t-warning flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <h3 className="font-orbitron font-bold text-xl text-white">Trust Engine</h3>
                  <Camera className="text-warning drop-shadow-[0_0_12px_rgba(255,176,0,0.8)]" size={28} />
              </div>
              <p className="text-sm text-slate-400 mb-4">Partner: Honest Fix Auto</p>
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl">
                <p className="text-sm text-warning font-semibold italic">Vehicle currently in bay. AI monitors active.</p>
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      </main>
    </div>
  );
}
