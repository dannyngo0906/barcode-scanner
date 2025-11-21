import { useState } from 'react';
import { ArrowLeft, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@shared/schema';
import { formatPrice, calculateDiscount, cleanHtmlDescription } from '@/lib/formatters';

interface ProductDisplayProps {
  product: Product;
  onBack: () => void;
  onScanAgain: () => void;
  onEnterNewBarcode: () => void;
}

export function ProductDisplay({ product, onBack, onScanAgain, onEnterNewBarcode }: ProductDisplayProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const discount = calculateDiscount(product.price, product.sale_price);
  const cleanDescription = product.description ? cleanHtmlDescription(product.description) : '';

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center space-x-2 mb-3 text-muted-foreground hover:text-foreground"
        data-testid="back-to-scanner-btn"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại quét</span>
      </Button>

      {/* Product card */}
      <Card className="bg-white rounded-2xl shadow-lg overflow-hidden border-0">
        {/* Product image */}
        <div className="aspect-square bg-muted relative">
          <img
            src={product.image_link || '/api/placeholder/400/400'}
            alt={product.title || 'Product Image'}
            className="w-full h-full object-cover"
            data-testid="product-image"
          />
        </div>

        <CardContent className="p-4 sm:p-6">
          {/* Product info */}
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-tight" data-testid="product-title">
              {product.title || 'Không có tên sản phẩm'}
            </h2>
            
            {/* Product details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-primary text-sm">•</span>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground font-medium text-sm">Mã sản phẩm: </span>
                  <span className="text-primary font-medium text-sm" data-testid="product-sku">
                    {product.sku || product.barcode}
                  </span>
                </div>
                <span className="text-primary text-sm">•</span>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground font-medium text-sm">Tình trạng: </span>
                  <span className={`font-medium text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-primary text-sm">•</span>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground font-medium text-sm">Thương hiệu: </span>
                  <span className="text-muted-foreground text-sm" data-testid="product-brand">
                    {product.brand || 'Không rõ thương hiệu'}
                  </span>
                </div>
                <span className="text-primary text-sm">•</span>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground font-medium text-sm">Dòng sản phẩm: </span>
                  <span className="text-muted-foreground text-sm" data-testid="product-type">
                    {product.type || 'Không rõ loại'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price section */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-red-600" data-testid="product-sale-price">
                {formatPrice(product.sale_price)}
              </span>
              {product.price > product.sale_price && (
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg text-muted-foreground line-through" data-testid="product-original-price">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-medium">
                    -{discount}%
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* Description */}
          {cleanDescription && (
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">Mô tả sản phẩm</h3>
              <div className="text-muted-foreground text-sm leading-relaxed" data-testid="product-description">
                <p className={showFullDescription ? '' : 'line-clamp-3'}>
                  {cleanDescription}
                </p>
                {cleanDescription.length > 200 && (
                  <Button
                    variant="link"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="p-0 h-auto mt-3 text-primary text-sm font-medium"
                    data-testid="toggle-description-btn"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Xem thêm
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onScanAgain}
              className="w-full flex items-center justify-center space-x-2 h-12 text-base font-medium"
              data-testid="scan-again-btn"
            >
              <Camera className="w-5 h-5" />
              <span>Quét lại</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onEnterNewBarcode}
              className="w-full h-11 text-base font-medium border-2"
              data-testid="enter-new-barcode-btn"
            >
              Nhập barcode khác
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
