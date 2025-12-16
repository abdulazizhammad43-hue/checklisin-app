import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    setCapturedImage(null);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col safe-area-inset">
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 bg-black">
        <h2 className="text-white font-semibold text-sm sm:text-base">Ambil Foto</h2>
        <button onClick={handleClose} className="text-white text-2xl font-bold px-2 py-1 active:opacity-70">×</button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black min-h-0">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Action Buttons - Always visible at bottom */}
      <div className="p-3 sm:p-4 bg-black flex gap-3 justify-center items-center safe-area-bottom" style={{ minHeight: '80px' }}>
        {!capturedImage ? (
          <Button
            onClick={capturePhoto}
            className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-5 sm:py-6 rounded-full font-semibold active:scale-95 transition-transform"
          >
            📷 Ambil Foto
          </Button>
        ) : (
          <>
            <Button
              onClick={handleRetake}
              className="flex-1 max-w-[160px] sm:max-w-[180px] bg-gray-700 text-white hover:bg-gray-600 py-3 sm:py-4 font-semibold active:scale-95 text-sm sm:text-base"
            >
              Ulangi
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 max-w-[160px] sm:max-w-[180px] bg-blue-600 text-white hover:bg-blue-700 py-3 sm:py-4 font-semibold active:scale-95 text-sm sm:text-base"
            >
              Gunakan Foto
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default CameraCapture;
