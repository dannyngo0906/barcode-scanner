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
