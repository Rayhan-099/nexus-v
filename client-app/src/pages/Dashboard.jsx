import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, CheckCircle, XCircle, LogOut, Map, LayoutDashboard, Settings, User as UserIcon, Wallet, ArrowUpCircle, ArrowDownCircle, IndianRupee, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');
const MOCK_PARTNER_ID = "000000000000000000000000";

const WASH_PRICE = 499;
const EV_PRICE = 250;

export default function Dashboard() {
  const [queueLength, setQueueLength] = useState(2);
  const [inQueue, setInQueue] = useState(false);
  const [evStatus, setEvStatus] = useState('AVAILABLE');
  const [proofAlert, setProofAlert] = useState(null);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [transactions, setTransactions] = useState([]);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [paymentMsg, setPaymentMsg] = useState('');
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch wallet balance on mount
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/wallet/balance', {
        headers: { 'x-auth-token': token }
      })
        .then(r => r.json())
        .then(data => {
          if (data.balance !== undefined) setWalletBalance(data.balance);
          if (data.transactions) setTransactions(data.transactions);
        })
        .catch(() => {});
    }
  }, [token]);

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

  const makePayment = async (amount, serviceType, description) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/wallet/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ amount, serviceType, description })
      });
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.newBalance);
        setTransactions(prev => [data.transaction, ...prev].slice(0, 10));
        setPaymentMsg(`✅ ₹${amount} paid!`);
        setTimeout(() => setPaymentMsg(''), 3000);
        return true;
      } else {
        setPaymentMsg(`❌ ${data.error}`);
        setTimeout(() => setPaymentMsg(''), 3000);
        return false;
      }
    } catch { return false; }
  };

  const handleTopUp = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/wallet/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ amount: topUpAmount })
      });
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.newBalance);
        setTransactions(prev => [data.transaction, ...prev].slice(0, 10));
        setShowTopUp(false);
        setPaymentMsg(`✅ ₹${topUpAmount} added!`);
        setTimeout(() => setPaymentMsg(''), 3000);
      }
    } catch {}
  };

  const joinWashQueue = async () => {
    const paid = await makePayment(WASH_PRICE, 'WASH_PAYMENT', 'QuickWash Queue Entry');
    if (paid) {
      setInQueue(true);
      const newLen = queueLength + 1;
      setQueueLength(newLen);
      socket.emit('join_queue', { partnerId: MOCK_PARTNER_ID, newLength: newLen });
    }
  };

  const reserveEVSlot = async () => {
    const paid = await makePayment(EV_PRICE, 'EV_PAYMENT', 'EV Charge Sector - 15min Reserve');
    if (paid) {
      setEvStatus('BOOKED');
      socket.emit('ev_slot_reserved', { stationId: MOCK_PARTNER_ID, slotId: 'slot1' });
    }
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
            <Zap className="text-primary" size={20} /> <span className="hidden lg:inline">N</span><span className="text-primary">V</span>
          </h1>
          <nav className="space-y-3">
            <a href="#" className="flex items-center gap-4 text-primary bg-primary/10 p-3 rounded-xl border border-primary/20">
              <LayoutDashboard size={22} />
              <span className="hidden lg:block font-bold text-sm">Terminal</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-[#A855F7] bg-[#A855F7]/10 p-3 rounded-xl border border-[#A855F7]/20">
              <Wallet size={22} />
              <span className="hidden lg:block font-bold text-sm">Wallet</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-slate-400 hover:text-white p-3 rounded-xl hover:bg-white/5 transition-all">
              <Map size={22} />
              <span className="hidden lg:block font-bold text-sm">Map View</span>
            </a>
            <a href="#" className="flex items-center gap-4 text-slate-400 hover:text-white p-3 rounded-xl hover:bg-white/5 transition-all">
              <UserIcon size={22} />
              <span className="hidden lg:block font-bold text-sm">Profile</span>
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
                      <h3 className="font-orbitron font-bold text-2xl text-white mb-2">QuickWash Hub</h3>
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
                <button onClick={joinWashQueue} className="glass-button w-full py-4 text-lg">ENTER LIVE QUEUE • ₹{WASH_PRICE}</button>
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
                <button onClick={reserveEVSlot} className="glass-button w-full py-3">RESERVE (15m) • ₹{EV_PRICE}</button>
            ) : (
                <button disabled className="glass-button w-full py-3 opacity-50 cursor-not-allowed border-slate-500 text-slate-500 bg-transparent shadow-none hover:bg-transparent">UNAVAILABLE</button>
            )}
          </motion.div>

          {/* Wallet Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 border-t-4 border-t-[#A855F7] flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="flex justify-between items-start mb-4">
                  <h3 className="font-orbitron font-bold text-xl text-white flex items-center gap-2"><Wallet className="text-[#A855F7]" size={22}/> Nexus Wallet</h3>
                  <button onClick={() => setShowTopUp(!showTopUp)} className="flex items-center gap-1 text-sm bg-[#A855F7]/20 text-[#A855F7] px-3 py-1.5 rounded-full border border-[#A855F7]/30 hover:bg-[#A855F7]/30 transition-all font-bold">
                    <Plus size={14}/> TOP UP
                  </button>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <motion.span key={walletBalance} initial={{ scale: 1.2, color: '#A855F7' }} animate={{ scale: 1, color: '#fff' }} className="text-4xl font-orbitron font-bold text-white">₹{walletBalance?.toLocaleString()}</motion.span>
                <span className="text-xs text-slate-500 uppercase tracking-widest">Available</span>
              </div>

              {/* Top-up Panel */}
              <AnimatePresence>
                {showTopUp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-black/30 p-4 rounded-xl border border-[#A855F7]/20">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Select Amount</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[500, 1000, 2000, 5000].map(amt => (
                        <button key={amt} onClick={() => setTopUpAmount(amt)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                          topUpAmount === amt ? 'bg-[#A855F7]/20 border-[#A855F7]/50 text-[#A855F7]' : 'bg-black/30 border-white/5 text-slate-400 hover:border-[#A855F7]/30'
                        }`}>₹{amt}</button>
                      ))}
                    </div>
                    <button onClick={handleTopUp} className="glass-button w-full border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7]/20">ADD ₹{topUpAmount} VIA UPI</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Toast */}
              <AnimatePresence>
                {paymentMsg && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 text-sm font-bold text-center text-[#A855F7] bg-[#A855F7]/10 p-2 rounded-lg border border-[#A855F7]/20">
                    {paymentMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transaction History */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Recent Activity</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {transactions.length === 0 && <p className="text-xs text-slate-600 italic">No transactions yet. Use a service to get started!</p>}
                  {transactions.map((tx, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between bg-black/20 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        {tx.amount > 0 ? <ArrowUpCircle size={16} className="text-success"/> : <ArrowDownCircle size={16} className="text-danger"/>}
                        <span className="text-xs text-slate-300 truncate max-w-[180px]">{tx.description}</span>
                      </div>
                      <span className={`font-orbitron text-sm font-bold ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust Engine Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 border-t-4 border-t-warning flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                  <h3 className="font-orbitron font-bold text-xl text-white">Trust Engine</h3>
                  <Camera className="text-warning drop-shadow-[0_0_12px_rgba(255,176,0,0.8)]" size={28} />
              </div>
              <p className="text-sm text-slate-400 mb-4">Node: {MOCK_PARTNER_ID.slice(-6).toUpperCase()} Nexus</p>
              
              <AnimatePresence mode="wait">
                {proofAlert ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-success/10 border border-success/30 p-3 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="text-success" size={16}/>
                      <span className="text-xs font-bold text-success uppercase tracking-widest">Last Verdict</span>
                    </div>
                    <p className="text-sm text-white font-bold">{proofAlert.analysis.verdict}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleTimeString()}</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-warning/10 border border-warning/20 p-4 rounded-xl mb-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                       <span className="text-[10px] text-warning font-bold uppercase tracking-tighter">Active Monitoring</span>
                    </div>
                    <p className="text-xs text-slate-300 italic">No recent claims. System is monitoring your vehicle in real-time.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest border-t border-white/5 pt-4">
                <span>AI Accuracy</span>
                <span className="text-success font-bold">99.8%</span>
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      </main>
    </div>
  );
}
