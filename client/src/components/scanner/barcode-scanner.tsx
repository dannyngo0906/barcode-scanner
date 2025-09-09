import { useEffect, useRef, useState } from 'react';
import { X, Plus, Loader2, Play, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedBarcodeScanner } from '@/hooks/use-enhanced-barcode-scanner';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  onManualInput: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose, onManualInput }: BarcodeScannerProps) {
  const {
    startPreview,
    startScanningMode,
    stopScanner,
    isScanning,
    isPreviewing,
    isInitialized,
    error,
    scannerType
  } = useEnhancedBarcodeScanner({
    debounceMs: 1200,
    pauseAfterScanMs: 2000
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const scannerElementId = 'enhanced-scanner';

  useEffect(() => {
    const initializePreview = async () => {
      try {
        setIsLoading(true);
        setIsPreviewReady(false);
        
        // Start preview mode immediately (no delay for fast startup)
        await startPreview(
          scannerElementId,
          () => {
            setIsLoading(false);
            setIsPreviewReady(true);
            console.log('Camera preview ready');
          }
        );
      } catch (initError) {
        console.error('Preview initialization failed:', initError);
        setIsLoading(false);
      }
    };

    initializePreview();

    return () => {
      console.log('BarcodeScanner component unmounting, cleaning up...');
      stopScanner();
    };
  }, [startPreview, stopScanner]);
  
  const handleStartScanning = () => {
    if (!isPreviewReady || isScanning) return;
    
    startScanningMode((decodedText) => {
      setShowSuccess(true);
      
      // Immediately stop scanner to prevent further scans
      stopScanner();
      
      // Show success feedback for 300ms then callback
      setTimeout(() => {
        onScanSuccess(decodedText);
      }, 300);
    });
  };

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
          </div>
        </div>
      )}
      
      {/* Preview mode with start scanning button */}
      {isPreviewing && isPreviewReady && !isScanning && (
        <div className="absolute inset-0 flex flex-col justify-between bg-black/20">
          {/* Top instruction */}
          <div className="p-4 text-center">
            <div className="bg-black/70 backdrop-blur rounded-lg p-3 inline-block">
              <Camera className="w-6 h-6 text-white mx-auto mb-2" />
              <p className="text-white text-sm font-medium">
                Đưa camera vào vị trí mã vạch
              </p>
              <p className="text-white/80 text-xs mt-1">
                Nhấn nút bên dưới để bắt đầu quét
              </p>
            </div>
          </div>
          
          {/* Center start scanning button */}
          <div className="flex-1 flex items-center justify-center">
            <Button
              onClick={handleStartScanning}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-lg transition-transform hover:scale-105"
              data-testid="start-scanning-btn"
            >
              <Play className="w-6 h-6 mr-2" />
              Bắt đầu quét
            </Button>
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
      
      {/* Scanning animation overlay - only when actively scanning */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line" />
            </div>
            {/* Scanning status */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600/90 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Đang quét mã vạch...
              </div>
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
      <div className="absolute bottom-6 left-0 right-0 px-4">
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
