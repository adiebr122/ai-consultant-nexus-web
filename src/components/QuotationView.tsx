
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QuotationPreview } from '@/components/quotation/QuotationPreview';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface QuotationItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  client_phone: string | null;
  client_address: string | null;
  items: QuotationItem[];
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  notes: string | null;
  terms: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const fetchQuotation = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to ensure items is properly typed
      const transformedQuotation: Quotation = {
        ...data,
        items: Array.isArray(data.items) 
          ? data.items.map((item: any) => ({
              description: item.description || '',
              quantity: Number(item.quantity) || 0,
              price: Number(item.price) || 0,
              total: Number(item.total) || 0
            }))
          : []
      };

      setQuotation(transformedQuotation);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data penawaran",
        variant: "destructive",
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!quotation) return;

    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text('PENAWARAN HARGA', 20, 30);
    
    // Add quotation details
    pdf.setFontSize(12);
    pdf.text(`No: ${quotation.quotation_number}`, 20, 50);
    pdf.text(`Tanggal: ${new Date(quotation.quotation_date).toLocaleDateString('id-ID')}`, 20, 60);
    
    // Add client info
    pdf.text('Kepada:', 20, 80);
    pdf.text(`${quotation.client_name}`, 20, 90);
    if (quotation.client_company) {
      pdf.text(`${quotation.client_company}`, 20, 100);
    }
    
    // Add items
    let yPos = 120;
    pdf.text('Item:', 20, yPos);
    yPos += 10;
    
    quotation.items.forEach((item, index) => {
      pdf.text(`${index + 1}. ${item.description}`, 20, yPos);
      pdf.text(`Qty: ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')} = Rp ${item.total.toLocaleString('id-ID')}`, 30, yPos + 10);
      yPos += 20;
    });
    
    // Add total
    yPos += 10;
    pdf.text(`Total: Rp ${quotation.total_amount?.toLocaleString('id-ID') || '0'}`, 20, yPos);
    
    pdf.save(`penawaran-${quotation.quotation_number}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!quotation?.client_email) {
      toast({
        title: "Error",
        description: "Email klien tidak tersedia",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-quotation-email', {
        body: { quotationId: quotation.id }
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Penawaran berhasil dikirim via email",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim email",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Penawaran tidak ditemukan</h3>
        <Button onClick={() => navigate('/admin')} variant="outline">
          Kembali ke Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/admin')} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {quotation.client_email && (
            <Button onClick={handleSendEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Kirim Email
            </Button>
          )}
        </div>
      </div>

      <QuotationPreview quotation={quotation} />
    </div>
  );
};

export default QuotationView;
