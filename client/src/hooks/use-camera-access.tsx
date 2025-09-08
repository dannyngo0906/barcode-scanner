import { useState, useCallback } from 'react';

export function useCameraAccess() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkCameraAccess = useCallback(async (): Promise<boolean> => {
    try {
      // Request camera access with enhanced constraints for barcode scanning
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { exact: 'environment' },
          // High resolution for better barcode detection (zoom-like effect)
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          // Enhanced frame rate for smoother scanning
          frameRate: { ideal: 120, min: 60 }
        } 
      });
      
      // Stop the stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permission in browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera is not supported on this device.');
        } else {
          setError('Unable to access camera. Please check your camera settings.');
        }
      } else {
        setError('Unknown camera error occurred.');
      }
      
      return false;
    }
  }, []);

  return {
    hasPermission,
    error,
    checkCameraAccess,
  };
}
