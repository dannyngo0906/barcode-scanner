import { useState, useEffect } from 'react';
import { Camera, Plus, Smartphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { ManualInputModal } from '@/components/ui/manual-input-modal';
import { ErrorModal } from '@/components/ui/error-modal';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { BarcodeScanner } from '@/components/scanner/barcode-scanner';
import { ProductDisplay } from '@/components/product/product-display';
import { useCameraAccess } from '@/hooks/use-camera-access';
import { searchProductByBarcode } from '@/lib/api';
import { Product, ScannerState } from '@shared/schema';

export default function Home() {
  const [currentState, setCurrentState] = useState<ScannerState>('welcome');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchBarcode, setSearchBarcode] = useState<string | null>(null);

  const { checkCameraAccess, error: cameraError } = useCameraAccess();

  // Query for product search
  const { isLoading, data: product, error } = useQuery({
    queryKey: ['product', searchBarcode],
    queryFn: () => searchProductByBarcode(searchBarcode!),
    enabled: !!searchBarcode,
  });

  // Handle query results with useEffect
  useEffect(() => {
    if (!searchBarcode) return;
    
    if (product !== undefined) {
      if (product) {
        setCurrentProduct(product);
        setCurrentState('product');
      } else {
        setErrorMessage('Không tìm thấy sản phẩm với mã vạch này. Vui lòng kiểm tra lại hoặc thử mã vạch khác.');
        setShowError(true);
        setCurrentState('welcome');
      }
      setSearchBarcode(null);
    }
    
    if (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tìm kiếm sản phẩm.');
      setShowError(true);
      setCurrentState('welcome');
      setSearchBarcode(null);
    }
  }, [product, error, searchBarcode]);

  const handleCameraAction = async () => {
    if (currentState === 'scanner') return;
    
    const hasAccess = await checkCameraAccess();
    if (hasAccess) {
      setCurrentState('scanner');
    } else {
      setCurrentState('cameraError');
    }
  };

  const handleScanSuccess = (barcode: string) => {
    setSearchBarcode(barcode);
    setCurrentState('loading');
  };

  const handleManualSearch = (barcode: string) => {
    setSearchBarcode(barcode);
    setCurrentState('loading');
  };

  const handleRetryCamera = async () => {
    const hasAccess = await checkCameraAccess();
    if (hasAccess) {
      setCurrentState('scanner');
    } else {
      setErrorMessage('Vẫn không thể truy cập camera. Vui lòng kiểm tra quyền truy cập trong cài đặt trình duyệt.');
      setShowError(true);
    }
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
    setCurrentProduct(null);
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Smartphone className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Quét mã vạch để tìm sản phẩm
        </h2>
        <p className="text-muted-foreground">
          Sử dụng camera hoặc nhập mã vạch thủ công để bắt đầu
        </p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <Button
          onClick={handleCameraAction}
          className="w-full flex items-center justify-center space-x-2"
          data-testid="start-scan-btn"
        >
          <Camera className="w-5 h-5" />
          <span>Quét mã vạch</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowManualInput(true)}
          className="w-full flex items-center justify-center space-x-2"
          data-testid="manual-input-btn"
        >
          <Plus className="w-5 h-5" />
          <span>Nhập mã vạch thủ công</span>
        </Button>
      </div>
    </div>
  );

  const CameraErrorScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
          <Camera className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Camera Error</h3>
        <p className="text-muted-foreground mb-6">
          {cameraError || 'Không thể truy cập camera. Vui lòng cấp quyền truy cập camera và thử lại.'}
        </p>
        <Button
          onClick={handleRetryCamera}
          className="w-full mb-3"
          data-testid="retry-camera-btn"
        >
          Thử lại
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowManualInput(true)}
          className="w-full flex items-center justify-center space-x-2"
          data-testid="use-manual-input-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Nhập mã vạch thủ công</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <Header onCameraClick={handleCameraAction} />
      
      <main className="pb-20">
        {currentState === 'welcome' && <WelcomeScreen />}
        
        {currentState === 'cameraError' && <CameraErrorScreen />}
        
        {currentState === 'scanner' && (
          <BarcodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={handleBackToWelcome}
            onManualInput={() => {
              setCurrentState('welcome');
              setShowManualInput(true);
            }}
          />
        )}
        
        {currentState === 'product' && currentProduct && (
          <ProductDisplay
            product={currentProduct}
            onBack={handleBackToWelcome}
            onScanAgain={handleCameraAction}
            onEnterNewBarcode={() => setShowManualInput(true)}
          />
        )}
      </main>

      {/* Loading overlay */}
      {(currentState === 'loading' || isLoading) && <LoadingScreen />}

      {/* Floating Action Button */}
      {currentState !== 'scanner' && (
        <FloatingActionButton onClick={handleCameraAction} />
      )}

      {/* Modals */}
      <ManualInputModal
        isOpen={showManualInput}
        onClose={() => setShowManualInput(false)}
        onSearch={handleManualSearch}
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
    </div>
  );
}
