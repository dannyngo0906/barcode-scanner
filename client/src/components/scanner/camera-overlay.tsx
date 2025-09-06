export function CameraOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Center scanning frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-40">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
          
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse">
            <div className="h-full bg-primary animate-scan-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
