import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Không tìm thấy sản phẩm", 
  message 
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <AlertTriangle className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <Button
          onClick={onClose}
          className="w-full"
          data-testid="error-close-btn"
        >
          Đóng
        </Button>
      </DialogContent>
    </Dialog>
  );
}
