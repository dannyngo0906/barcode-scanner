import { Camera, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@assets/Logo ZNS _ Den_1760068379975.png';

interface HeaderProps {
  onCameraClick: () => void;
}

export function Header({ onCameraClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </div>
          <img src={logoImage} alt="BOSHOP.VN" className="h-8" />
        </div>
        <Button
          onClick={onCameraClick}
          size="sm"
          className="w-10 h-10 p-0"
          data-testid="header-camera-btn"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
