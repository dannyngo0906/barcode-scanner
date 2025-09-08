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

    // Optimized config for fast and accurate scanning
    const config = {
      fps: 120,
      aspectRatio: 1.0,
      // Optimize for speed and accuracy
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      formatsToSupport: [
        window.Html5QrcodeSupportedFormats?.UPC_A,
        window.Html5QrcodeSupportedFormats?.UPC_E,
        window.Html5QrcodeSupportedFormats?.EAN_8,
        window.Html5QrcodeSupportedFormats?.EAN_13,
        window.Html5QrcodeSupportedFormats?.CODE_128,
        window.Html5QrcodeSupportedFormats?.CODE_39,
        window.Html5QrcodeSupportedFormats?.ITF,
      ].filter(Boolean),
    };

    try {
      scannerRef.current = new window.Html5Qrcode(elementId);
      
      // Enhanced camera constraints for better barcode detection
      const cameraConfig = {
        facingMode: { exact: "environment" },
        // High resolution for better barcode recognition (zoom-like effect)
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        // Enhanced frame rate for 120fps scanning
        frameRate: { ideal: 120, min: 60 }
      };

      scannerRef.current.start(
        cameraConfig,
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
