
import React, { useRef, useEffect, useState } from 'react';
import { XMarkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const setupCamera = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Kamera izni reddedildi. Lütfen uygulama ayarlarından kamera iznini açın.");
      } else if (err.name === 'NotFoundError') {
        setError("Cihazda kamera bulunamadı.");
      } else {
        setError(`Kamera başlatılamadı: ${err.message || 'Bilinmeyen Hata'}. Lütfen tarayıcı/uygulama izinlerini kontrol edin.`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    setupCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-500/20 p-6 rounded-full mb-6">
          <VideoCameraIcon className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Erişim Gerekli</h2>
        <p className="text-slate-400 text-sm mb-10 max-w-xs leading-relaxed">
          {error} <br /><br />
          <b>Ayarlar &gt; Uygulamalar &gt; QuickScan ID &gt; İzinler</b> yolunu izleyerek kamerayı aktif edin.
        </p>
        <div className="flex flex-col w-full gap-4 max-w-xs">
          <button 
            onClick={setupCamera}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            Tekrar Dene
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-white/10 text-white font-black py-4 rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest text-xs"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between">
      <div className="w-full flex justify-between items-center p-6 text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onCancel} className="p-3 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest uppercase">
          Document Mode
        </div>
      </div>

      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
        {isInitializing && (
          <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-400 text-[10px] font-black tracking-widest uppercase">Lens Hazırlanıyor...</p>
          </div>
        )}
        
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        
        {stream && (
          <>
            <div className="absolute inset-0 flex items-center justify-center p-10 pointer-events-none">
               <div className="w-full aspect-[3/4.5] rounded-3xl border-2 border-white/20 relative shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl"></div>
                  <div className="scan-line !bg-indigo-500/50"></div>
               </div>
            </div>
            <p className="absolute bottom-10 left-0 w-full text-center text-white font-black text-[10px] tracking-[0.3em] uppercase drop-shadow-lg">
              Belgeyi Çerçeveye Hizalayın
            </p>
          </>
        )}
      </div>

      <div className="w-full p-10 flex justify-center items-center bg-black">
        <button 
          onClick={takePhoto}
          disabled={!stream}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-90 transition-all disabled:opacity-20"
        >
          <div className="w-full h-full bg-white rounded-full shadow-2xl"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
