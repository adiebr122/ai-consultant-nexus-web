
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuotationItem {
  id: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationViewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  quotation: any;
}

const QuotationView = ({ open, setOpen, quotation }: QuotationViewProps) => {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quotation && open) {
      fetchQuotationItems();
    }
  }, [quotation, open]);

  const fetchQuotationItems = async () => {
    if (!quotation) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotation.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching quotation items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!quotation) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      sent: { label: 'Terkirim', variant: 'default' as const },
      accepted: { label: 'Diterima', variant: 'default' as const },
      rejected: { label: 'Ditolak', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Quotation #{quotation.quotation_number}</span>
            {getStatusBadge(quotation.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Quotation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nomor Quotation</p>
                <p className="font-medium">{quotation.quotation_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium">
                  {new Date(quotation.quotation_date).toLocaleDateString('id-ID')}
                </p>
              </div>
              {quotation.valid_until && (
                <div>
                  <p className="text-sm text-gray-500">Berlaku Hingga</p>
                  <p className="font-medium">
                    {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{getStatusBadge(quotation.status)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Klien</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Klien</p>
                <p className="font-medium">{quotation.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{quotation.client_email}</p>
              </div>
              {quotation.client_company && (
                <div>
                  <p className="text-sm text-gray-500">Perusahaan</p>
                  <p className="font-medium">{quotation.client_company}</p>
                </div>
              )}
              {quotation.client_address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">{quotation.client_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Item Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Memuat item...</p>
              ) : items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Item</p>
                          <p className="font-medium">{item.item_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Harga Satuan</p>
                          <p className="font-medium">Rp {item.unit_price.toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">Rp {item.total.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      {item.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Deskripsi</p>
                          <p className="text-sm">{item.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">Tidak ada item</p>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {Number(quotation.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak ({quotation.tax_percentage || 0}%):</span>
                  <span>Rp {Number(quotation.tax_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Rp {Number(quotation.total_amount || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          {(quotation.notes || quotation.terms_conditions) && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan & Syarat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotation.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Catatan</p>
                    <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
                  </div>
                )}
                {quotation.terms_conditions && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Syarat & Ketentuan</p>
                    <p className="text-sm whitespace-pre-wrap">{quotation.terms_conditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationView;
