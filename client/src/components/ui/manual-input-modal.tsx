import { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (barcode: string) => void;
}

export function ManualInputModal({ isOpen, onClose, onSearch }: ManualInputModalProps) {
  const [barcode, setBarcode] = useState('');

  const handleSearch = () => {
    if (barcode.trim()) {
      onSearch(barcode.trim());
      setBarcode('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-4 p-6">
        <DialogHeader>
          <DialogTitle>Nhập mã vạch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập mã vạch..."
            className="w-full"
            autoFocus
            data-testid="manual-barcode-input"
          />
          <Button
            onClick={handleSearch}
            className="w-full"
            data-testid="search-product-btn"
          >
            <Search className="w-5 h-5 mr-2" />
            Tìm kiếm sản phẩm
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            data-testid="back-to-scanner-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại máy quét
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
