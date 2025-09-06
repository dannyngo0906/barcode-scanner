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
      fps: 120,
      aspectRatio: 1.0,
      useBarCodeDetectorIfSupported: true,
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

    // Enhanced camera constraints with zoom and focus optimization
    const cameraConstraints = {
      facingMode: "environment",
      zoom: { ideal: 2.0 }, // Start with 2x zoom for better barcode detection
      focusMode: { ideal: "continuous" }, // Auto-focus for better scanning
      width: { ideal: 1920 }, // Higher resolution for better scanning
      height: { ideal: 1080 }
    };

    try {
      scannerRef.current = new window.Html5Qrcode(elementId);
      
      scannerRef.current.start(
        cameraConstraints,
        config,
        (decodedText: string) => {
          onScanSuccess(decodedText);
        },
        (errorMessage: string) => {
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      ).then(() => {
        // Apply additional zoom after scanner starts if supported
        setTimeout(() => {
          try {
            if (scannerRef.current) {
              const capabilities = scannerRef.current.getRunningTrackCapabilities();
              if (capabilities && capabilities.zoom) {
                console.log('Camera zoom support detected, range:', capabilities.zoom.min, '-', capabilities.zoom.max);
                // Apply optimal zoom level for barcode scanning
                const optimalZoom = Math.min(2.5, capabilities.zoom.max || 2.0);
                scannerRef.current.applyVideoConstraints({
                  advanced: [{ zoom: optimalZoom }]
                }).catch((error: any) => {
                  console.log('Auto-zoom setup failed:', error);
                });
              }
            }
          } catch (error) {
            console.log('Camera capabilities check failed:', error);
          }
        }, 1000);
      });
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
