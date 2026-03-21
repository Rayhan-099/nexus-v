import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Camera, Zap, Car } from 'lucide-react';

const socket = io('http://localhost:5000');
// Mock partner ID to simplify MVP demo (from generic seed)
const MOCK_PARTNER_ID = "000000000000000000000000";

function App() {
  const [queueLength, setQueueLength] = useState(2);
  const [evStatus, setEvStatus] = useState('AVAILABLE');
  const [proofFile, setProofFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

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
      setUploadStatus('Error uploading. Note: Requires python trust engine to run. Bypassing demo.');
      // Fake event emission for demo when python server offline
      socket.emit('proof_received', { status: 'PENDING', estimatedCost: 4500, description: 'Brake pad replacement' });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-orbitron font-bold text-primary tracking-widest flex items-center gap-4">
          NEXUS-V <span className="text-sm font-inter text-slate-400">PARTNER PORTAL</span>
        </h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-orbitron text-sm">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Module 1: Live Queue (Wash) */}
        <section className="glass-card p-6 flex flex-col items-center">
          <Car className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-xl font-orbitron font-bold mb-2">Live Queue</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Manage zero-wait wash lines.</p>
          
          <div className="text-6xl font-orbitron font-bold text-white mb-8">
            {queueLength} <span className="text-xl text-slate-500">AHEAD</span>
          </div>
          
          <div className="flex gap-4 w-full">
            <button onClick={advanceQueue} className="glass-button-success flex-1" disabled={queueLength === 0}>
              FINISH -1
            </button>
            <button onClick={increaseQueue} className="glass-button flex-1">
              ADD +1
            </button>
          </div>
        </section>

        {/* Module 2: Trust Engine (Repair) */}
        <section className="glass-card p-6 flex flex-col items-center border-warning/30">
          <Camera className="w-12 h-12 text-warning mb-4" />
          <h2 className="text-xl font-orbitron font-bold mb-2 text-warning">Trust Engine</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Upload proof of damage.</p>
          
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files[0])}
            className="mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-warning/20 file:text-warning hover:file:bg-warning/30 cursor-pointer w-full text-slate-400"
          />
          
          <button onClick={handleUpload} className="glass-button w-full border-warning text-warning hover:bg-warning/20 hover:shadow-[0_0_20px_rgba(255,176,0,0.4)]">
            UPLOAD & VALIDATE
          </button>
          {uploadStatus && (
            <div className="mt-4 text-sm font-bold text-center animate-pulse text-warning">
              {uploadStatus}
            </div>
          )}
        </section>

        {/* Module 3: EV Charging */}
        <section className="glass-card p-6 flex flex-col items-center border-danger/30">
          <Zap className="w-12 h-12 text-success mb-4" />
          <h2 className="text-xl font-orbitron font-bold mb-2">EV Station</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Live charger status.</p>
          
          <div className={`mt-4 px-6 py-4 rounded-xl border-2 uppercase font-orbitron font-bold tracking-wider text-xl mb-8 w-full text-center
            ${evStatus === 'AVAILABLE' ? 'border-success text-success bg-success/10 shadow-[0_0_15px_rgba(57,255,20,0.2)]' : ''}
            ${evStatus === 'BOOKED' ? 'border-warning text-warning bg-warning/10 shadow-[0_0_15px_rgba(255,176,0,0.2)]' : ''}
            ${evStatus === 'CHARGING' ? 'border-primary text-primary bg-primary/10' : ''}
            ${evStatus === 'OFFLINE' ? 'border-danger text-danger bg-danger/10 shadow-[0_0_15px_rgba(255,42,42,0.2)]' : ''}
          `}>
            {evStatus}
          </div>

          <button 
             className="glass-button-danger w-full opacity-50 cursor-not-allowed" 
             disabled>
             REMOTELY MANAGED
          </button>
        </section>

      </div>
    </div>
  );
}

export default App;
