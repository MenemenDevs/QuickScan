
import React, { useState, useEffect } from 'react';
import { ScanResult, AppState } from './types';
import CameraView from './components/CameraView';
import ScanReview from './components/ScanReview';
import HistoryView from './components/HistoryView';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  ClockIcon, 
  SparklesIcon, 
  Cog6ToothIcon,
  Squares2X2Icon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.HOME);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [activeScan, setActiveScan] = useState<Partial<ScanResult> | null>(null);
  const [isPro, setIsPro] = useState(false);
  
  // Check if AI is available via environment key
  const aiAvailable = !!process.env.API_KEY && process.env.API_KEY !== 'undefined';

  useEffect(() => {
    const saved = localStorage.getItem('quickscan_history');
    if (saved) {
      try {
        setScans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quickscan_history', JSON.stringify(scans));
  }, [scans]);

  const handleCapture = (imageData: string) => {
    setActiveScan({
      id: crypto.randomUUID(),
      originalImage: imageData,
      createdAt: Date.now(),
    });
    setCurrentStep(AppState.REVIEW);
  };

  const handleSaveScan = (result: ScanResult) => {
    setScans(prev => [result, ...prev]);
    setCurrentStep(AppState.HOME);
    setActiveScan(null);
  };

  const deleteScan = (id: string) => {
    setScans(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.1)]">
      {/* Dynamic Header */}
      <motion.header 
        layout
        className="px-6 py-5 flex justify-between items-center bg-white/90 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-50"
      >
        <motion.div layout className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            {aiAvailable ? <SparklesIcon className="w-6 h-6 text-white" /> : <PlusIcon className="w-6 h-6 text-white" />}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">QuickScan</h1>
            <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${aiAvailable ? 'text-indigo-600' : 'text-slate-400'}`}>
              {aiAvailable ? 'AI ENHANCED' : 'BASIC MODE'}
            </span>
          </div>
        </motion.div>
        
        <div className="flex items-center gap-2">
           {aiAvailable && (
             <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
               <ShieldCheckIcon className="w-3 h-3 text-indigo-600" />
               <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter">Verified</span>
             </div>
           )}
           <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPro(!isPro)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all ${isPro ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 uppercase'}`}
          >
            {isPro ? 'PRO ACTIVE' : 'UPGRADE'}
          </motion.button>
        </div>
      </motion.header>

      <main className="flex-1 relative flex flex-col bg-slate-50/30">
        <AnimatePresence mode="wait">
          {currentStep === AppState.HOME && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="p-6 space-y-8 flex-1 pb-32"
            >
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2 tracking-tighter">Fast & Clean.</h2>
                  <p className="text-slate-400 text-sm mb-8 font-medium">
                    {aiAvailable ? 'AI Brain is active. Ready to scan.' : 'Offline mode. Standard PDF scans.'}
                  </p>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(AppState.SCANNING)}
                    className="bg-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-sm flex items-center gap-3 shadow-xl shadow-indigo-500/30 uppercase tracking-widest"
                  >
                    <BoltIcon className="w-6 h-6" />
                    Scan Now
                  </motion.button>
                </div>
                
                <div className="absolute -right-4 -top-4 opacity-10">
                   <SparklesIcon className="w-32 h-32" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-[11px]">
                    <Squares2X2Icon className="w-4 h-4 text-indigo-500" />
                    Library
                  </h3>
                </div>

                {scans.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <ClockIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scans yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {scans.slice(0, 4).map((scan) => (
                      <motion.div 
                        key={scan.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img src={scan.processedImage} alt={scan.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <p className="text-[10px] font-black truncate text-slate-800 uppercase">{scan.title}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === AppState.SCANNING && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50">
              <CameraView onCapture={handleCapture} onCancel={() => setCurrentStep(AppState.HOME)} />
            </motion.div>
          )}

          {currentStep === AppState.REVIEW && activeScan && (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-slate-950">
              <ScanReview 
                scan={activeScan as ScanResult} 
                onSave={handleSaveScan} 
                onCancel={() => setCurrentStep(AppState.HOME)}
                isPro={isPro}
              />
            </motion.div>
          )}

          {currentStep === AppState.HISTORY && (
            <motion.div key="history" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="absolute inset-0 z-40 bg-white">
              <HistoryView scans={scans} onDelete={deleteScan} onBack={() => setCurrentStep(AppState.HOME)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      {currentStep === AppState.HOME && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-3xl border-t border-slate-100 px-10 py-5 flex justify-between items-center z-50 pb-10">
          <button onClick={() => setCurrentStep(AppState.HOME)} className="flex flex-col items-center gap-1.5 text-indigo-600">
            <ClockIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
          </button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentStep(AppState.SCANNING)}
            className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-400 -mt-16 border-[8px] border-white"
          >
            <PlusIcon className="w-10 h-10" />
          </motion.button>

          <button onClick={() => setCurrentStep(AppState.HISTORY)} className="flex flex-col items-center gap-1.5 text-slate-400">
            <Cog6ToothIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Browse</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
