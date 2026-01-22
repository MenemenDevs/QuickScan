
import React, { useState } from 'react';
import { ScanResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

interface HistoryViewProps {
  scans: ScanResult[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ scans, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScans = scans.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ocrText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </motion.button>
        <h2 className="text-xl font-black tracking-tight">Your Library</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search filenames or OCR text..."
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredScans.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-slate-200" />
             </div>
             <p className="text-slate-400 text-sm font-medium">No documents found.</p>
          </motion.div>
        ) : (
          <div className="space-y-4 pb-12">
            <AnimatePresence mode="popLayout">
              {filteredScans.map(scan => (
                <motion.div 
                  key={scan.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative"
                >
                  <div className="w-20 h-28 bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100 flex-shrink-0 relative">
                    <img src={scan.processedImage} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <h4 className="font-bold text-slate-900 truncate text-base">{scan.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                        {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                        {scan.ocrText || 'Document content not indexed.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[9px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">PDF</span>
                       <span className="text-[10px] font-bold text-slate-400">{(scan.fileSize / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                     <button className="text-slate-300 hover:text-slate-600 p-1">
                       <EllipsisVerticalIcon className="w-5 h-5" />
                     </button>
                     <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => onDelete(scan.id)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                     >
                       <TrashIcon className="w-5 h-5" />
                     </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
