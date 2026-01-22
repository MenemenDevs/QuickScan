
import React, { useRef, useEffect, useState } from 'react';
import { XMarkIcon, BoltIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

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
      // Simplified constraints to avoid "OverconstrainedError" or context issues
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      if (err.name === 'NotAllowedError') {
        setError("Camera access was denied. Please check your browser permissions and ensure you're on a secure connection (HTTPS).");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Attempt automatic setup on mount
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Use actual video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <VideoCameraIcon className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">{error}</p>
        <div className="flex flex-col w-full gap-3">
          <button 
            onClick={setupCamera}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={onCancel}
            className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between">
      {/* Top Controls */}
      <div className="w-full flex justify-between items-center p-6 text-white z-10">
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-4">
          <BoltIcon className="w-6 h-6 text-yellow-400" />
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
        {isInitializing && (
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        
        {/* Scanner Overlay - Only show if camera is active */}
        {stream && (
          <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
             <div className="w-full aspect-[3/4] rounded-lg border-2 border-white/30 anim-pulse-border relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
             </div>
          </div>
        )}

        {stream && (
          <p className="absolute bottom-4 left-0 w-full text-center text-white/80 text-xs font-medium tracking-wide drop-shadow">
            ALIGN DOCUMENT WITHIN FRAME
          </p>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full p-8 flex justify-around items-center bg-black">
        <div className="w-12 h-12 flex items-center justify-center">
           <PhotoIcon className="w-8 h-8 text-white/30" />
        </div>
        
        <button 
          onClick={takePhoto}
          disabled={!stream}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform disabled:opacity-30 disabled:scale-100"
        >
          <div className="w-full h-full bg-white rounded-full shadow-lg"></div>
        </button>

        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-white font-bold uppercase">
           Auto
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraView;
