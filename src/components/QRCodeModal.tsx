
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ isOpen, onClose }: QRCodeModalProps) => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Check connection status using app_settings
  const { data: connectionStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['whatsapp_connection_status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'whatsapp_connection_status')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching connection status:', error);
        return 'disconnected';
      }
      
      return data?.setting_value || 'disconnected';
    },
    enabled: !!user && isOpen,
    refetchInterval: 5000 // Check every 5 seconds
  });

  const generateQRCode = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Call edge function to generate QR code
      const response = await fetch('/supabase/functions/v1/whatsapp-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({ user_id: user.id })
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr_code || '');
      } else {
        console.error('Failed to generate QR code');
        // Fallback: generate a placeholder QR code URL
        setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=whatsapp://connect/${user.id}`);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback QR code
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=whatsapp://connect/${user.id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      generateQRCode();
    }
  }, [isOpen, user]);

  const handleRefresh = () => {
    generateQRCode();
    refetchStatus();
  };

  if (!isOpen) return null;

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Koneksi WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center">
          {isConnected ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-green-600 mb-2">Terhubung!</h4>
                <p className="text-gray-600">
                  WhatsApp Anda telah berhasil terhubung dengan sistem live chat.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <WifiOff className="h-8 w-8 text-red-600" />
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Scan QR Code
                </h4>
                <p className="text-gray-600 mb-4">
                  Buka WhatsApp di ponsel Anda dan scan QR code di bawah ini untuk menghubungkan akun.
                </p>
              </div>

              {loading ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : qrCode ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <img
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">QR Code tidak tersedia</p>
                  </div>
                </div>
              )}

              <div className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Cara menghubungkan:</h5>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Buka WhatsApp di ponsel Anda</li>
                  <li>2. Pilih menu "Linked Devices" atau "Perangkat Tertaut"</li>
                  <li>3. Tap "Link a Device" atau "Tautkan Perangkat"</li>
                  <li>4. Scan QR code yang ditampilkan di atas</li>
                </ol>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
