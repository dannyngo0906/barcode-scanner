import { useEffect, useRef } from 'react';
import { X, Zap, RotateCw, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { CameraOverlay } from './camera-overlay';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  onManualInput: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose, onManualInput }: BarcodeScannerProps) {
  const { startScanner, stopScanner } = useBarcodeScanner();
  const scannerElementId = 'qr-reader';

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
      
      {/* Camera overlay */}
      <CameraOverlay />

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

      {/* Bottom controls */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="bg-black/80 backdrop-blur rounded-lg p-4 text-center">
          <p className="text-white text-sm font-medium mb-4">
            Căn chỉnh mã vạch trong khung hình
          </p>
          
          {/* Camera controls */}
          <div className="flex justify-center space-x-6 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30"
              data-testid="flash-btn"
            >
              <Zap className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30"
              data-testid="rotate-btn"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30"
              data-testid="settings-btn"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
          
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
