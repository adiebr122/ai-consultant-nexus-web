
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeModalProps {
  children: React.ReactNode;
}

const QRCodeModal = ({ children }: QRCodeModalProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-qr', {
        body: { userId: user.id }
      });

      if (error) throw error;

      if (data?.qrCode) {
        setQrCode(data.qrCode);
        toast({
          title: "Berhasil",
          description: "QR Code berhasil dibuat",
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Gagal membuat QR Code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setQrCode(null);
    generateQRCode();
  };

  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            WhatsApp QR Code
          </DialogTitle>
          <DialogDescription>
            Scan QR code ini dengan WhatsApp Business untuk menghubungkan akun
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <div className="text-center">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh QR Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Gagal memuat QR Code</p>
              <Button onClick={generateQRCode} variant="outline">
                Coba Lagi
              </Button>
            </div>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Langkah-langkah:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Buka WhatsApp Business di ponsel Anda</li>
              <li>Pilih menu "Linked Devices"</li>
              <li>Tap "Link a Device"</li>
              <li>Scan QR code di atas</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
