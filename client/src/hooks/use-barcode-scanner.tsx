import { useRef, useCallback } from 'react';

// Declare global Html5Qrcode for the CDN version
declare global {
  interface Window {
    Html5Qrcode: any;
    Html5QrcodeSupportedFormats: any;
  }
}

export function useBarcodeScanner() {
  const scannerRef = useRef<any>(null);

  const startScanner = useCallback((
    elementId: string,
    onScanSuccess: (decodedText: string) => void,
    onScanError?: (error: string) => void
  ) => {
    if (!window.Html5Qrcode) {
      console.error('Html5Qrcode not loaded');
      return;
    }

    const config = {
      fps: 120, // Increased from 60 to 120 for faster scanning
      qrbox: { width: 200, height: 120 }, // Reduced from 250x150 to 200x120 for better performance
      aspectRatio: 1.0,
      // Optimized formats: focus on most common barcode types for faster processing
      formatsToSupport: [
        window.Html5QrcodeSupportedFormats?.EAN_13, // Most common product barcode
        window.Html5QrcodeSupportedFormats?.EAN_8,  // Short EAN barcode
        window.Html5QrcodeSupportedFormats?.CODE_128, // Common industrial barcode
        window.Html5QrcodeSupportedFormats?.UPC_A,  // US/Canada product barcode
      ].filter(Boolean),
    };

    try {
      scannerRef.current = new window.Html5Qrcode(elementId);
      
      scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          onScanSuccess(decodedText);
        },
        (errorMessage: string) => {
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch((error: any) => {
          console.error('Error stopping scanner:', error);
          scannerRef.current = null;
        });
      } catch (error) {
        console.error('Error stopping scanner:', error);
        scannerRef.current = null;
      }
    }
  }, []);

  return {
    startScanner,
    stopScanner,
    isScanning: !!scannerRef.current,
  };
}
