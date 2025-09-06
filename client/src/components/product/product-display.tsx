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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2" data-testid="product-title">
                {product.title || 'Không có tên sản phẩm'}
              </h2>
              <p className="text-sm text-muted-foreground mb-2" data-testid="product-barcode">
                {product.barcode}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="font-medium text-foreground" data-testid="product-brand">
                  {product.brand || 'Không rõ thương hiệu'}
                </span>
                <span className="text-muted-foreground" data-testid="product-type">
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

          {/* Stock info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">Tồn kho</p>
              <p className="text-xl font-bold text-primary" data-testid="product-stock">
                {product.stock || 0}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">Kho tổng</p>
              <p className="text-xl font-bold text-primary" data-testid="warehouse-stock">
                {product["Kho tong"] || 0}
              </p>
            </div>
          </div>

          {/* Description */}
          {cleanDescription && (
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center justify-between w-full text-left p-0 h-auto"
                data-testid="toggle-description-btn"
              >
                <h3 className="text-lg font-semibold text-foreground">Mô tả sản phẩm</h3>
                {showFullDescription ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
              {showFullDescription && (
                <div className="mt-3 text-muted-foreground text-sm leading-relaxed" data-testid="product-description">
                  <p>{cleanDescription}</p>
                </div>
              )}
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
