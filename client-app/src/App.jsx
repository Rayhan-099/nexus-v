import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, Car, CheckCircle, XCircle } from 'lucide-react';

const socket = io('http://localhost:5000');
const MOCK_PARTNER_ID = "000000000000000000000000";

function App() {
  const [queueLength, setQueueLength] = useState(2);
  const [inQueue, setInQueue] = useState(false);
  const [evStatus, setEvStatus] = useState('AVAILABLE');
  const [proofAlert, setProofAlert] = useState(null);
  
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

  const joinWashQueue = () => {
    setInQueue(true);
    const newLen = queueLength + 1;
    setQueueLength(newLen);
    socket.emit('join_queue', { partnerId: MOCK_PARTNER_ID, newLength: newLen });
  };

  const reserveEVSlot = () => {
    setEvStatus('BOOKED');
    socket.emit('ev_slot_reserved', { stationId: MOCK_PARTNER_ID, slotId: 'slot1' });
    // In real app, countdown TTL starts here
  };

  const resolveProof = async (status) => {
    // API call to PATCH /api/trust/resolve-proof/:id
    try {
      await fetch(`http://localhost:5000/api/trust/resolve-proof/${proofAlert._id || 'mock_id'}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setProofAlert(null);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-sm md:max-w-md mx-auto space-y-6 min-h-screen flex flex-col relative overflow-hidden">
      {/* Push Notification Modal */}
      {proofAlert && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-card p-6 w-full max-w-sm border-warning">
                  <h2 className="text-xl font-orbitron text-warning mb-2 flex items-center gap-2">
                     <Camera className="text-warning"/> Action Required
                  </h2>
                  <p className="text-sm text-slate-300 mb-4">Mechanic uploaded proof of damage for your review.</p>
                  
                  <div className="bg-black/50 p-4 rounded-xl mb-6">
                      <img src={proofAlert.imageUrl || "https://res.cloudinary.com/demo/image/upload/sample.jpg"} alt="Proof" className="w-full h-32 object-cover rounded-lg mb-2 opacity-80" />
                      <p className="text-sm font-semibold">{proofAlert.description}</p>
                      <p className="text-xl font-orbitron text-primary mt-2">₹{proofAlert.estimatedCost}</p>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => resolveProof('REJECTED')} className="glass-button-danger flex-1 flex items-center justify-center gap-2">
                        <XCircle size={18}/> REJECT
                      </button>
                      <button onClick={() => resolveProof('APPROVED')} className="glass-button-success flex-1 flex items-center justify-center gap-2">
                        <CheckCircle size={18}/> APPROVE
                      </button>
                  </div>
              </div>
          </div>
      )}

      <header className="mb-4 pt-4">
        <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest flex flex-col">
          NEXUS<span className="text-primary">-V</span>
        </h1>
        <p className="text-xs text-slate-400 font-inter mt-1">SMART MOBILITY HUB</p>
      </header>

      {/* Services List */}
      <div className="space-y-4 flex-1 pb-8">
        
        {/* Car Wash Card */}
        <div className="glass-card p-5 border-l-4 border-l-primary">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">QuickWash Downtown</h3>
                    <p className="text-xs text-slate-400">0.8 km away • 15 min avg wait</p>
                </div>
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                    {queueLength} AHEAD
                </div>
            </div>
            {inQueue ? (
                <div className="w-full text-center py-3 bg-success/20 text-success rounded-xl font-orbitron tracking-widest border border-success/30 font-bold shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                    IN QUEUE
                </div>
            ) : (
                <button onClick={joinWashQueue} className="glass-button w-full py-3">
                    JOIN LIVE QUEUE
                </button>
            )}
        </div>

        {/* EV Station Card */}
        <div className="glass-card p-5 border-l-4 border-l-success">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">EV Charge Hub East</h3>
                    <p className="text-xs text-slate-400">1.2 km away • 50kW DC</p>
                </div>
                <Zap className={evStatus === 'AVAILABLE' ? "text-success drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]" : "text-warning drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]"} size={20} />
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <p className={`font-orbitron font-bold text-sm ${evStatus==='AVAILABLE'?'text-success':evStatus==='BOOKED'?'text-warning':'text-danger'}`}>{evStatus}</p>
                </div>
                {evStatus === 'AVAILABLE' ? (
                    <button onClick={reserveEVSlot} className="glass-button px-6 text-sm py-3">
                        RESERVE (15m)
                    </button>
                ) : (
                    <button disabled className="glass-button opacity-50 cursor-not-allowed px-6 text-sm py-3 border-slate-500 text-slate-500 hover:bg-transparent shadow-none">
                        UNAVAILABLE
                    </button>
                )}
            </div>
        </div>

        {/* Mechanic Card */}
        <div className="glass-card p-5 border-l-4 border-l-warning">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">Honest Fix Auto</h3>
                    <p className="text-xs text-slate-400">2.5 km away • Trust Engine Active</p>
                </div>
                <Camera className="text-warning drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]" size={20} />
            </div>
            <p className="text-xs italic text-slate-500 mt-2">Your vehicle is currently being serviced. Wait for notifications.</p>
        </div>

      </div>
    </div>
  );
}

export default App;
