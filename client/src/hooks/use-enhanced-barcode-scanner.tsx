import { useRef, useCallback, useState } from 'react';
// @ts-ignore
import Quagga from 'quagga';

// Declare global BarcodeDetector for native API
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

interface ScannerState {
  isInitialized: boolean;
  isScanning: boolean;
  isPreviewing: boolean;
  error: string | null;
  lastScanTime: number;
}

interface EnhancedScannerConfig {
  debounceMs: number;
  pauseAfterScanMs: number;
}

export function useEnhancedBarcodeScanner(config: EnhancedScannerConfig = {
  debounceMs: 1200,
  pauseAfterScanMs: 2000
}) {
  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeDetectorRef = useRef<any>(null);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<ScannerState>({
    isInitialized: false,
    isScanning: false,
    isPreviewing: false,
    error: null,
    lastScanTime: 0
  });

  // Initialize QuaggaJS
  const initQuagga = useCallback((
    elementId: string,
    onScanSuccess: (barcode: string) => void,
    previewOnly: boolean = false
  ) => {
    const quaggaConfig = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: `#${elementId}`,
        constraints: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 24, min: 15 },
          facingMode: { ideal: 'environment' }
        },
        area: {
          top: "20%",
          bottom: "20%", 
          left: "10%",
          right: "10%"
        },
        singleChannel: false
      },
      frequency: 15, // 600ms intervals (3x slower for better user control)
      numOfWorkers: 4,
      halfSample: false,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader", 
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ],
        multiple: false
      }
    };

    return new Promise((resolve, reject) => {
      Quagga.init(quaggaConfig, (err: any) => {
        if (err) {
          console.error('QuaggaJS init error:', err);
          reject(err);
          return;
        }
        
        if (!previewOnly) {
          Quagga.onDetected((result: any) => {
            const now = Date.now();
            if (now - state.lastScanTime < config.debounceMs) {
              return;
            }
            
            // Immediately stop QuaggaJS to prevent further detections
            Quagga.stop();
            
            setState(prev => ({ ...prev, lastScanTime: now }));
            onScanSuccess(result.codeResult.code);
          });
        }
        
        Quagga.start();
        scannerRef.current = 'quagga';
        resolve(true);
      });
    });
  }, [config.debounceMs, config.pauseAfterScanMs, state.lastScanTime]);

  // Initialize BarcodeDetector API fallback
  const initBarcodeDetector = useCallback(async (
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onScanSuccess: (barcode: string) => void
  ) => {
    if (!window.BarcodeDetector) {
      throw new Error('BarcodeDetector not supported');
    }

    barcodeDetectorRef.current = new window.BarcodeDetector({
      formats: [
        'code_128', 'code_39', 'ean_13', 
        'ean_8', 'upc_a', 'upc_e', 'qr_code'
      ]
    });

    const context = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }

    const detectFromVideo = async () => {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        return;
      }

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      try {
        const barcodes = await barcodeDetectorRef.current.detect(canvasElement);
        if (barcodes.length > 0) {
          const now = Date.now();
          if (now - state.lastScanTime < config.debounceMs) {
            return;
          }
          
          // Stop detection immediately
          if (detectionTimeoutRef.current) {
            clearInterval(detectionTimeoutRef.current);
            detectionTimeoutRef.current = null;
          }
          
          setState(prev => ({ ...prev, lastScanTime: now }));
          onScanSuccess(barcodes[0].rawValue);
        }
      } catch (error) {
        console.error('BarcodeDetector error:', error);
      }
    };

    // Start detection loop with 100ms intervals
    const detectionLoop = setInterval(detectFromVideo, 100);
    detectionTimeoutRef.current = detectionLoop;
    
    return detectionLoop;
  }, [config.debounceMs, config.pauseAfterScanMs, state.lastScanTime]);

  // Enhanced pattern detection fallback
  const initPatternDetection = useCallback((
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onScanSuccess: (barcode: string) => void
  ) => {
    const context = canvasElement.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }

    const analyzeFrame = () => {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        return;
      }

      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const isBarcodeLike = analyzeForBarcodePattern(imageData);
      
      if (isBarcodeLike) {
        const now = Date.now();
        if (now - state.lastScanTime < 1500) { // 1500ms for pattern detection
          return;
        }
        
        // Stop detection immediately
        if (detectionTimeoutRef.current) {
          clearInterval(detectionTimeoutRef.current);
          detectionTimeoutRef.current = null;
        }
        
        setState(prev => ({ ...prev, lastScanTime: now }));
        onScanSuccess(`PATTERN_DETECTED_${Date.now()}`);
      }
    };

    // Start pattern detection with 100ms intervals
    const detectionLoop = setInterval(analyzeFrame, 100);
    detectionTimeoutRef.current = detectionLoop;
    
    return detectionLoop;
  }, [config.pauseAfterScanMs, state.lastScanTime]);

  // Pattern analysis algorithm
  const analyzeForBarcodePattern = (imageData: ImageData) => {
    const { width, height, data } = imageData;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleRadius = Math.min(width, height) / 4;
    
    let darkPixels = 0;
    let lightPixels = 0;
    let totalSampled = 0;
    
    // Sample in a grid pattern around center
    for (let y = centerY - sampleRadius; y < centerY + sampleRadius; y += 5) {
      for (let x = centerX - sampleRadius; x < centerX + sampleRadius; x += 5) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const index = (y * width + x) * 4;
          const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
          
          if (brightness < 128) {
            darkPixels++;
          } else {
            lightPixels++;
          }
          totalSampled++;
        }
      }
    }
    
    const darkRatio = darkPixels / totalSampled;
    const lightRatio = lightPixels / totalSampled;
    
    // Basic pattern detection: need significant contrast
    return darkRatio > 0.2 && lightRatio > 0.2 && Math.abs(darkRatio - lightRatio) > 0.1;
  };

  // Start preview mode first (camera ready but not scanning)
  const startPreview = useCallback(async (
    elementId: string,
    onPreviewReady?: () => void
  ) => {
    try {
      setState(prev => ({ ...prev, isPreviewing: true, error: null }));
      
      // Try QuaggaJS first but don't start detection
      try {
        await initQuagga(elementId, () => {}, true); // Pass true to skip detection
        setState(prev => ({ ...prev, isInitialized: true }));
        if (onPreviewReady) onPreviewReady();
        console.log('Preview initialized with QuaggaJS');
        return;
      } catch (quaggaError) {
        console.warn('QuaggaJS preview failed, trying manual camera setup:', quaggaError);
      }
      
      // Manual camera setup for preview
      const videoElement = document.createElement('video');
      const canvasElement = document.createElement('canvas');
      videoRef.current = videoElement;
      canvasRef.current = canvasElement;
      
      // Get camera stream with optimized constraints for fast startup
      let retryCount = 0;
      const maxRetries = 2; // Reduced retries for faster startup
      
      while (retryCount < maxRetries) {
        try {
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 200 * retryCount)); // Reduced delay
          }
          
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              aspectRatio: { ideal: 16/9 },
              frameRate: { ideal: 24, min: 15 }
            },
            audio: false
          });
          break;
        } catch (cameraError: any) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error(`Camera access failed: ${cameraError.message}`);
          }
        }
      }
      
      videoElement.srcObject = streamRef.current;
      videoElement.play();
      
      const scannerElement = document.getElementById(elementId);
      if (scannerElement) {
        scannerElement.appendChild(videoElement);
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
      }
      
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => resolve(true);
      });
      
      setState(prev => ({ ...prev, isInitialized: true }));
      if (onPreviewReady) onPreviewReady();
      console.log('Preview initialized with manual camera setup');
      
    } catch (error) {
      console.error('Preview initialization failed:', error);
      setState(prev => ({ 
        ...prev, 
        isPreviewing: false, 
        error: 'Unable to initialize camera preview'
      }));
    }
  }, []);
  
  // Start scanning mode (activate detection on existing preview)
  const startScanningMode = useCallback((onScanSuccess: (barcode: string) => void) => {
    if (!state.isInitialized) {
      console.error('Scanner not initialized for scanning mode');
      return;
    }
    
    setState(prev => ({ ...prev, isScanning: true, isPreviewing: false }));
    
    if (scannerRef.current === 'quagga') {
      // Re-enable QuaggaJS detection
      Quagga.onDetected((result: any) => {
        const now = Date.now();
        if (now - state.lastScanTime < config.debounceMs) {
          return;
        }
        
        Quagga.stop();
        setState(prev => ({ ...prev, lastScanTime: now }));
        onScanSuccess(result.codeResult.code);
      });
    } else if (videoRef.current && canvasRef.current) {
      // Start detection for fallback methods
      try {
        if (window.BarcodeDetector) {
          initBarcodeDetector(videoRef.current, canvasRef.current, onScanSuccess);
          scannerRef.current = 'detector';
        } else {
          initPatternDetection(videoRef.current, canvasRef.current, onScanSuccess);
          scannerRef.current = 'pattern';
        }
        console.log('Scanning mode activated with', scannerRef.current);
      } catch (error) {
        console.error('Failed to start scanning mode:', error);
      }
    }
  }, [state.isInitialized, state.lastScanTime, config.debounceMs, initBarcodeDetector, initPatternDetection]);
  
  // Start enhanced scanner with fallback chain (legacy method)
  const startScanner = useCallback(async (
    elementId: string,
    onScanSuccess: (barcode: string) => void,
    onScanError?: (error: string) => void
  ) => {
    try {
      setState(prev => ({ ...prev, isScanning: true, error: null }));
      
      // Try QuaggaJS first (best performance)
      try {
        await initQuagga(elementId, onScanSuccess);
        setState(prev => ({ ...prev, isInitialized: true }));
        console.log('Scanner initialized with QuaggaJS');
        return;
      } catch (quaggaError) {
        console.warn('QuaggaJS failed, trying BarcodeDetector:', quaggaError);
      }
      
      // Fallback to BarcodeDetector API
      const videoElement = document.createElement('video');
      const canvasElement = document.createElement('canvas');
      videoRef.current = videoElement;
      canvasRef.current = canvasElement;
      
      // Get camera stream with enhanced constraints and retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Add delay between retries to allow camera cleanup
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
          
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              aspectRatio: { ideal: 16/9 },
              frameRate: { ideal: 24, min: 15 }
            },
            audio: false
          });
          break; // Success, exit retry loop
        } catch (cameraError: any) {
          retryCount++;
          console.warn(`Camera access attempt ${retryCount} failed:`, cameraError);
          
          if (retryCount === maxRetries) {
            // Final attempt with minimal constraints
            try {
              streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
              });
              console.log('Camera access successful with minimal constraints');
            } catch (finalError) {
              throw new Error(`Camera access failed after ${maxRetries} attempts: ${cameraError.message}`);
            }
          }
        }
      }
      
      videoElement.srcObject = streamRef.current;
      videoElement.play();
      
      // Append video to scanner element
      const scannerElement = document.getElementById(elementId);
      if (scannerElement) {
        scannerElement.appendChild(videoElement);
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
      }
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => resolve(true);
      });
      
      try {
        await initBarcodeDetector(videoElement, canvasElement, onScanSuccess);
        scannerRef.current = 'detector';
        setState(prev => ({ ...prev, isInitialized: true }));
        console.log('Scanner initialized with BarcodeDetector');
        return;
      } catch (detectorError) {
        console.warn('BarcodeDetector failed, using pattern detection:', detectorError);
      }
      
      // Final fallback to pattern detection
      initPatternDetection(videoElement, canvasElement, onScanSuccess);
      scannerRef.current = 'pattern';
      setState(prev => ({ ...prev, isInitialized: true }));
      console.log('Scanner initialized with pattern detection');
      
    } catch (error) {
      console.error('All scanner methods failed:', error);
      setState(prev => ({ 
        ...prev, 
        isScanning: false, 
        error: 'Unable to initialize camera scanner'
      }));
      if (onScanError) {
        onScanError('Scanner initialization failed');
      }
    }
  }, [initQuagga, initBarcodeDetector, initPatternDetection]);

  // Stop scanner and cleanup
  const stopScanner = useCallback(() => {
    try {
      console.log('Stopping scanner, type:', scannerRef.current);
      
      // Stop QuaggaJS
      if (scannerRef.current === 'quagga') {
        try {
          Quagga.stop();
          Quagga.offDetected(); // Remove all detection listeners
        } catch (quaggaError) {
          console.warn('Error stopping Quagga:', quaggaError);
        }
      }
      
      // Stop detection timeouts
      if (detectionTimeoutRef.current) {
        clearInterval(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }
      
      // Stop camera stream with additional safety
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind, track.readyState);
          });
          streamRef.current = null;
        } catch (streamError) {
          console.warn('Error stopping stream:', streamError);
        }
      }
      
      // Cleanup video element
      if (videoRef.current) {
        try {
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
          }
          videoRef.current.remove();
          videoRef.current = null;
        } catch (videoError) {
          console.warn('Error cleaning up video:', videoError);
        }
      }
      
      // Reset scanner element content
      const scannerElement = document.getElementById('enhanced-scanner');
      if (scannerElement) {
        scannerElement.innerHTML = '';
      }
      
      scannerRef.current = null;
      barcodeDetectorRef.current = null;
      
      setState({
        isInitialized: false,
        isScanning: false,
        isPreviewing: false,
        error: null,
        lastScanTime: 0
      });
      
      console.log('Scanner cleanup completed');
      
    } catch (error) {
      console.error('Error stopping scanner:', error);
      // Force reset state even if cleanup fails
      setState({
        isInitialized: false,
        isScanning: false,
        isPreviewing: false,
        error: null,
        lastScanTime: 0
      });
    }
  }, []);

  return {
    startScanner,
    startPreview,
    startScanningMode,
    stopScanner,
    isScanning: state.isScanning,
    isPreviewing: state.isPreviewing,
    isInitialized: state.isInitialized,
    error: state.error,
    scannerType: scannerRef.current
  };
}