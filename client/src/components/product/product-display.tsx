import { useState } from 'react';
import { ArrowLeft, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/product';
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
    <div className="max-w-2xl mx-auto p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="flex items-center space-x-2 mb-4 text-muted-foreground hover:text-foreground"
        data-testid="back-to-scanner-btn"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại quét</span>
      </Button>

      {/* Product card */}
      <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Product image */}
        <div className="aspect-square bg-muted relative">
          <img
            src={product.image_link || '/api/placeholder/400/400'}
            alt={product.title || 'Product Image'}
            className="w-full h-full object-cover"
            data-testid="product-image"
          />
        </div>

        <CardContent className="p-6">
          {/* Product info */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground mb-3" data-testid="product-title">
              {product.title || 'Không có tên sản phẩm'}
            </h2>
            
            {/* Product details grid */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">•</span>
                <span className="font-medium text-foreground">Mã sản phẩm:</span>
                <span className="ml-1 text-muted-foreground" data-testid="product-sku">
                  {product.sku || product.barcode}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">•</span>
                <span className="font-medium text-foreground">Tình trạng:</span>
                <span className="ml-1 text-muted-foreground">
                  {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">•</span>
                <span className="font-medium text-foreground">Thương hiệu:</span>
                <span className="ml-1 text-muted-foreground" data-testid="product-brand">
                  {product.brand || 'Không rõ thương hiệu'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">•</span>
                <span className="font-medium text-foreground">Dòng sản phẩm:</span>
                <span className="ml-1 text-muted-foreground" data-testid="product-type">
                  {product.type || 'Không rõ loại'}
                </span>
              </div>
            </div>
          </div>

          {/* Price section */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-2xl font-bold text-red-600" data-testid="product-sale-price">
              {formatPrice(product.sale_price)}
            </span>
            {product.price > product.sale_price && (
              <>
                <span className="text-lg text-muted-foreground line-through" data-testid="product-original-price">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  -{discount}%
                </span>
              </>
            )}
          </div>


          {/* Description */}
          {cleanDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Mô tả sản phẩm</h3>
              <div className="text-muted-foreground text-sm leading-relaxed" data-testid="product-description">
                <p className={showFullDescription ? '' : 'line-clamp-3'}>
                  {cleanDescription}
                </p>
                {cleanDescription.length > 200 && (
                  <Button
                    variant="link"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="p-0 h-auto mt-2 text-primary text-sm"
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
          <div className="space-y-3">
            <Button
              onClick={onScanAgain}
              className="w-full flex items-center justify-center space-x-2"
              data-testid="scan-again-btn"
            >
              <Camera className="w-5 h-5" />
              <span>Quét lại</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onEnterNewBarcode}
              className="w-full"
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
