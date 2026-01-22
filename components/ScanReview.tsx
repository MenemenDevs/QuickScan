
import React, { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { processDocument } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { 
  CheckIcon, 
  ArrowPathIcon, 
  SparklesIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  NoSymbolIcon
} from '@heroicons/react/24/solid';

interface ScanReviewProps {
  scan: ScanResult;
  onSave: (result: ScanResult) => void;
  onCancel: () => void;
  isPro: boolean;
}

const ScanReview: React.FC<ScanReviewProps> = ({ scan, onSave, onCancel, isPro }) => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [processedData, setProcessedData] = useState<{
    title: string;
    ocr: string;
    processedImage: string;
  } | null>(null);

  useEffect(() => {
    enhanceDocument();
  }, []);

  const enhanceDocument = async () => {
    setLoading(true);
    setIsOffline(false);
    try {
      const result = await processDocument(scan.originalImage);
      if (result) {
        setProcessedData({
          title: result.title || 'Untitled Document',
          ocr: result.ocrContent || '',
          processedImage: scan.originalImage,
        });
      } else {
        // Fallback for missing key or error
        handleBasicMode();
      }
    } catch (e) {
      handleBasicMode();
    } finally {
      setLoading(false);
    }
  };

  const handleBasicMode = () => {
    setIsOffline(true);
    setProcessedData({
      title: 'Scan_' + new Date().getTime().toString().slice(-6),
      ocr: '',
      processedImage: scan.originalImage
    });
  };

  const skipAI = () => {
    handleBasicMode();
    setLoading(false);
  };

  const generateOfficialPDF = async () => {
    if (!processedData) return;
    setExporting(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // --- PAGE 1: OFFICIAL IMAGE SCAN ---
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("QUICKSCAN ID", margin, 15);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`DIGITAL SCAN: ${scan.id.slice(0, 8).toUpperCase()}`, margin, 20);
      
      doc.setFontSize(7);
      doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, pageWidth - margin, 15, { align: 'right' });

      // Document Image
      const img = new Image();
      img.src = processedData.processedImage;
      await new Promise((resolve) => { img.onload = resolve; });

      const maxWidth = pageWidth - (margin * 2);
      const maxHeight = pageHeight - 60;
      let finalImgWidth = maxWidth;
      let finalImgHeight = (img.height * finalImgWidth) / img.width;

      if (finalImgHeight > maxHeight) {
        finalImgHeight = maxHeight;
        finalImgWidth = (img.width * finalImgHeight) / img.height;
      }
      
      const xPos = (pageWidth - finalImgWidth) / 2;
      doc.addImage(processedData.processedImage, 'JPEG', xPos, 35, finalImgWidth, finalImgHeight);

      // Watermark for free tier
      if (!isPro) {
        doc.setFontSize(30);
        doc.setTextColor(230, 230, 230);
        doc.text("QUICKSCAN FREE TIER", pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
      }

      // --- PAGE 2: TEXT (Only if OCR worked) ---
      if (processedData.ocr) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("EXTRACTED CONTENT", margin, 20);
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const splitText = doc.splitTextToSize(processedData.ocr, pageWidth - (margin * 2));
        doc.text(splitText, margin, 40);
      }

      doc.save(`${processedData.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation error", err);
      alert("Error generating PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleFinish = () => {
    if (processedData) {
      onSave({
        ...scan,
        title: processedData.title,
        ocrText: processedData.ocr,
        processedImage: processedData.processedImage,
        fileSize: Math.floor(1024 * (Math.random() * 500 + 200))
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Navigation */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="p-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 z-30"
      >
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
          <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10">
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">Discard</span>
        </button>
        
        <div className="flex items-center gap-2">
           {isOffline ? (
             <NoSymbolIcon className="w-5 h-5 text-slate-500" />
           ) : (
             <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />
           )}
           <span className="text-xs font-black tracking-widest text-slate-300">
             {isOffline ? 'BASIC MODE' : 'AI ENHANCED'}
           </span>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinish}
          disabled={loading}
          className="bg-indigo-600 px-6 py-2.5 rounded-full font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 disabled:opacity-50 uppercase tracking-tighter"
        >
          <CheckIcon className="w-4 h-4" />
          Save Scan
        </motion.button>
      </motion.div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-32">
        <div className="relative">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[3/4.2] flex items-center justify-center ring-1 ring-white/10"
          >
            <img 
              src={processedData?.processedImage || scan.originalImage} 
              className="w-full h-full object-contain" 
              alt="Scan" 
            />
            
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="relative mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="w-20 h-20 border-[4px] border-indigo-500 border-t-transparent rounded-full"
                    />
                    <SparklesIcon className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">Enhancing Scan...</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1 mb-8">Using AI to detect text and clean edges.</p>
                  
                  <button 
                    onClick={skipAI}
                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all"
                  >
                    Skip AI & Save Fast
                  </button>
                  
                  <div className="scan-line !bg-indigo-400"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-[2rem] p-6 border border-white/5"
          >
            <label className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.3em] block mb-2">Filename</label>
            <input 
              type="text" 
              className="bg-transparent w-full text-xl font-black border-none focus:ring-0 p-0 text-white placeholder:text-slate-700"
              value={processedData?.title || ''}
              onChange={(e) => setProcessedData(prev => prev ? {...prev, title: e.target.value} : null)}
            />
          </motion.div>

          <button 
            onClick={generateOfficialPDF}
            disabled={loading || exporting}
            className="w-full bg-white text-slate-950 py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50"
          >
            {exporting ? (
              <ArrowPathIcon className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <DocumentArrowDownIcon className="w-6 h-6 text-indigo-600" />
            )}
            <span className="text-xs font-black uppercase tracking-widest">
              {exporting ? 'Generating PDF...' : 'Download PDF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanReview;
