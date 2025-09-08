import { useEffect, useRef, useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedBarcodeScanner } from '@/hooks/use-enhanced-barcode-scanner';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  onManualInput: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose, onManualInput }: BarcodeScannerProps) {
  const {
    startScanner,
    stopScanner,
    isScanning,
    isInitialized,
    error,
    scannerType
  } = useEnhancedBarcodeScanner({
    debounceMs: 1200,
    pauseAfterScanMs: 2000
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const scannerElementId = 'enhanced-scanner';

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        setIsLoading(true);
        
        // Add 500ms delay for camera stabilization
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await startScanner(
          scannerElementId,
          (decodedText) => {
            setShowSuccess(true);
            
            // Immediately stop scanner to prevent further scans
            stopScanner();
            
            // Show success feedback for 300ms then callback
            setTimeout(() => {
              onScanSuccess(decodedText);
            }, 300);
          },
          (scanError) => {
            console.error('Enhanced scanner error:', scanError);
          }
        );
        
        setIsLoading(false);
      } catch (initError) {
        console.error('Scanner initialization failed:', initError);
        setIsLoading(false);
      }
    };

    initializeScanner();

    return () => {
      // Cleanup on component unmount
      console.log('BarcodeScanner component unmounting, cleaning up...');
      stopScanner();
    };
  }, [startScanner, stopScanner, onScanSuccess]);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Scanner container */}
      <div id={scannerElementId} className="w-full h-full" />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Đang khởi động camera...</p>
            {scannerType && (
              <p className="text-xs text-gray-300 mt-1">
                Sử dụng: {scannerType === 'quagga' ? 'QuaggaJS' : scannerType === 'detector' ? 'BarcodeDetector' : 'Pattern Detection'}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Ready indicator */}
      {isInitialized && !isLoading && !error && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
      
      {/* Success flash */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-500/30 pointer-events-none" />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute top-16 left-4 right-4">
          <div className="bg-red-500/90 text-white p-3 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}
      
      {/* Scanning animation overlay */}
      {isInitialized && !isLoading && !error && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line" />
            </div>
          </div>
        </div>
      )}
      

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
