
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Download, Send, Calendar, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuotationItem {
  id: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  client_name: string;
  client_email?: string;
  client_company?: string;
  client_phone?: string;
  client_address?: string;
  items: QuotationItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  status: string;
}

const QuotationView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  // Fetch quotation data
  const { data: quotationData, isLoading, error } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      // Parse items if they exist
      const parsedData = {
        ...data,
        items: Array.isArray(data.items) ? data.items : []
      };
      
      setQuotation(parsedData);
      return parsedData;
    },
    enabled: !!id && !!user
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Quotation yang Anda cari tidak tersedia.</p>
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Kirim Email
            </Button>
          </div>
        </div>

        {/* Quotation Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">PENAWARAN</h1>
              <p className="text-gray-600">#{quotation.quotation_number}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(quotation.quotation_date)}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                quotation.status === 'approved' ? 'bg-green-100 text-green-800' :
                quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {quotation.status === 'approved' ? 'Disetujui' :
                 quotation.status === 'rejected' ? 'Ditolak' : 'Draft'}
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kepada:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{quotation.client_name}</span>
              </div>
              {quotation.client_company && (
                <div className="flex items-center mb-2">
                  <Building className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{quotation.client_company}</span>
                </div>
              )}
              {quotation.client_email && (
                <p className="text-gray-600 ml-6">{quotation.client_email}</p>
              )}
              {quotation.client_phone && (
                <p className="text-gray-600 ml-6">{quotation.client_phone}</p>
              )}
              {quotation.client_address && (
                <p className="text-gray-600 ml-6 whitespace-pre-line">{quotation.client_address}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Penawaran:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">Item</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">Deskripsi</th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-900">Qty</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">Harga Unit</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-3">{item.item_name}</td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-600">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quotation.subtotal || 0)}</span>
                </div>
                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(quotation.discount_amount)}</span>
                  </div>
                )}
                {quotation.tax_rate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pajak ({quotation.tax_rate}%):</span>
                    <span className="font-medium">{formatCurrency(quotation.tax_amount || 0)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(quotation.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(quotation.notes || quotation.terms) && (
            <div className="space-y-6">
              {quotation.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Catatan:</h4>
                  <p className="text-gray-600 whitespace-pre-line">{quotation.notes}</p>
                </div>
              )}
              {quotation.terms && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Syarat & Ketentuan:</h4>
                  <p className="text-gray-600 whitespace-pre-line">{quotation.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
