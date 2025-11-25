/**
 * Type definitions for QuaggaJS barcode scanner
 * QuaggaJS is an advanced barcode-scanner written in JavaScript
 */

declare module 'quagga' {
  export interface QuaggaJSConfigObject {
    inputStream?: {
      name?: string;
      type?: string;
      target?: string | HTMLElement;
      constraints?: MediaTrackConstraints & {
        width?: { ideal?: number; min?: number };
        height?: { ideal?: number; min?: number };
        aspectRatio?: { ideal?: number };
        frameRate?: { ideal?: number; min?: number };
        facingMode?: { ideal?: string } | string;
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
      singleChannel?: boolean;
    };
    frequency?: number;
    numOfWorkers?: number;
    locate?: boolean;
    multiple?: boolean;
    decoder?: {
      readers?: string[];
      multiple?: boolean;
    };
    locator?: {
      halfSample?: boolean;
      patchSize?: string;
    };
    halfSample?: boolean;
  }

  export interface QuaggaJSResultObject {
    codeResult: {
      code: string;
      format: string;
      start?: number;
      end?: number;
      codeset?: number;
      startInfo?: { error: number; code: number; start: number; end: number };
      decodedCodes?: Array<{ code: number; start: number; end: number; error?: number }>;
      endInfo?: { error: number; code: number; start: number; end: number };
    };
    line?: Array<{ x: number; y: number }>;
    angle?: number;
    pattern?: number[];
    box?: Array<[number, number]>;
    boxes?: Array<Array<[number, number]>>;
  }

  export interface QuaggaJSStatic {
    init(
      config: QuaggaJSConfigObject,
      callback?: (err: any) => void
    ): void;

    start(): void;

    stop(): void;

    onProcessed(
      callback: (result: any) => void
    ): void;

    offProcessed(
      callback?: (result: any) => void
    ): void;

    onDetected(
      callback: (result: QuaggaJSResultObject) => void
    ): void;

    offDetected(
      callback?: (result: QuaggaJSResultObject) => void
    ): void;

    decodeSingle(
      config: QuaggaJSConfigObject,
      callback: (result: QuaggaJSResultObject) => void
    ): void;

    ImageWrapper: any;
    ImageDebug: any;
    ResultCollector: any;
    CameraAccess: any;
  }

  const Quagga: QuaggaJSStatic;
  export default Quagga;
}
