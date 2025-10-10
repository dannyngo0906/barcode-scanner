import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@assets/Logo ZNS _ Den_1760068379975.png';

interface HeaderProps {
  onCameraClick: () => void;
}

export function Header({ onCameraClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-center px-4 py-3 relative">
        <img src={logoImage} alt="BOSHOP.VN" className="h-8" />
        <Button
          onClick={onCameraClick}
          size="sm"
          className="w-10 h-10 p-0 absolute right-4"
          data-testid="header-camera-btn"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
