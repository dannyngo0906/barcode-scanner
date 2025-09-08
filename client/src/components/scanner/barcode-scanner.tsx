import { useEffect, useRef, useState, useCallback } from 'react';

// Extend MediaTrackCapabilities to include zoom
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  zoom?: {
    max: number;
    min: number;
    step: number;
  };
}
import { X, Plus, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  onManualInput: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose, onManualInput }: BarcodeScannerProps) {
  const { startScanner, stopScanner } = useBarcodeScanner();
  const scannerElementId = 'qr-reader';
  const [zoomLevel, setZoomLevel] = useState([1]);
  const [maxZoom, setMaxZoom] = useState(3);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Function to apply zoom to camera
  const applyZoom = useCallback(async (zoom: number) => {
    try {
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        if (track) {
          const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
          if (capabilities.zoom) {
            const settings = track.getSettings();
            const constraintZoom = Math.min(zoom, capabilities.zoom.max || 3);
            
            await track.applyConstraints({
              advanced: [{ zoom: constraintZoom } as MediaTrackConstraintSet]
            });
            
            console.log(`Applied zoom: ${constraintZoom}x`);
          } else {
            console.log('Camera does not support zoom');
          }
        }
      }
    } catch (error) {
      console.error('Error applying zoom:', error);
    }
  }, []);

  // Function to detect camera capabilities
  const detectCameraCapabilities = useCallback(async () => {
    try {
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        if (track) {
          const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
          if (capabilities.zoom) {
            setMaxZoom(capabilities.zoom.max || 3);
            console.log(`Max zoom detected: ${capabilities.zoom.max}x`);
          }
        }
      }
    } catch (error) {
      console.error('Error detecting camera capabilities:', error);
    }
  }, []);

  // Monitor for video element and detect capabilities
  useEffect(() => {
    const checkVideo = () => {
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement) {
        detectCameraCapabilities();
        return true;
      }
      return false;
    };

    // Check immediately and then poll
    if (!checkVideo()) {
      const interval = setInterval(() => {
        if (checkVideo()) {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [detectCameraCapabilities]);

  useEffect(() => {
    // Load Html5Qrcode script if not already loaded
    if (!window.Html5Qrcode) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = () => {
        startScanner(
          scannerElementId,
          (decodedText) => {
            stopScanner();
            onScanSuccess(decodedText);
          },
          (error) => {
            console.log('Scanner error:', error);
          }
        );
      };
      document.head.appendChild(script);
    } else {
      startScanner(
        scannerElementId,
        (decodedText) => {
          stopScanner();
          onScanSuccess(decodedText);
        },
        (error) => {
          console.log('Scanner error:', error);
        }
      );
    }

    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner, onScanSuccess]);

  return (
    <div className="relative w-full h-screen">
      {/* Scanner container */}
      <div id={scannerElementId} className="w-full h-full" />
      

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70"
        data-testid="close-scanner-btn"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col items-center space-y-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const newZoom = Math.min(zoomLevel[0] + 0.5, maxZoom);
            setZoomLevel([newZoom]);
            applyZoom(newZoom);
          }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70"
          data-testid="zoom-in-btn"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
          {zoomLevel[0].toFixed(1)}x
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const newZoom = Math.max(zoomLevel[0] - 0.5, 1);
            setZoomLevel([newZoom]);
            applyZoom(newZoom);
          }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70"
          data-testid="zoom-out-btn"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="bg-black/80 backdrop-blur rounded-lg p-4 text-center">
          <Button
            variant="ghost"
            onClick={onManualInput}
            className="w-full bg-white/20 backdrop-blur text-white hover:bg-white/30"
            data-testid="manual-input-from-scanner-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nhập mã vạch thủ công
          </Button>
        </div>
      </div>
    </div>
  );
}
