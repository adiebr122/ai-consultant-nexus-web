
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Receipt, 
  Plus, 
  Eye, 
  Download, 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Temporary interface using quotations structure
interface Invoice {
  id: string;
  quotation_number: string; // Using as invoice_number
  quotation_date: string; // Using as invoice_date
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  client_address: string | null;
  client_phone: string | null;
  items: any;
  subtotal: number | null;
  tax_rate: number | null; // Using as tax_percentage
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  status: string | null;
  notes: string | null;
  terms: string | null;
  created_at: string;
  updated_at: string;
}

const InvoiceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Temporarily use quotations table with status 'invoiced'
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'invoiced')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform quotation data to invoice format
      const invoiceData = (data || []).map(item => ({
        id: item.id,
        quotation_number: item.quotation_number,
        quotation_date: item.quotation_date,
        client_name: item.client_name,
        client_email: item.client_email,
        client_company: item.client_company,
        client_address: item.client_address,
        client_phone: item.client_phone,
        items: item.items,
        subtotal: item.subtotal,
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        discount_amount: item.discount_amount,
        total_amount: item.total_amount,
        status: item.status,
        notes: item.notes,
        terms: item.terms,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setInvoices(invoiceData);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Info",
        description: "Menggunakan data dummy untuk demo. Database invoice akan dikonfigurasi nanti.",
      });
      
      // Set dummy data for demonstration
      setInvoices([
        {
          id: '1',
          quotation_number: 'INV-001',
          quotation_date: new Date().toISOString().split('T')[0],
          client_name: 'PT Contoh Perusahaan',
          client_email: 'contact@contoh.com',
          client_company: 'PT Contoh Perusahaan',
          client_address: 'Jakarta',
          client_phone: '+62812345678',
          items: [{ name: 'Layanan AI Consultation', quantity: 1, price: 5000000 }],
          subtotal: 5000000,
          tax_rate: 11,
          tax_amount: 550000,
          discount_amount: 0,
          total_amount: 5550000,
          status: 'sent',
          notes: 'Invoice contoh',
          terms: 'Pembayaran dalam 30 hari',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createInvoiceFromQuotation = async (quotationId: string) => {
    try {
      // Update quotation status to 'invoiced'
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'invoiced' })
        .eq('id', quotationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Invoice berhasil dibuat dari quotation",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Gagal membuat invoice",
        variant: "destructive",
      });
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Status invoice berhasil diperbarui",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status invoice",
        variant: "destructive",
      });
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus invoice ini?')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Invoice berhasil dihapus",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'sent': return <Mail className="h-3 w-3" />;
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'overdue': return <AlertCircle className="h-3 w-3" />;
      case 'cancelled': return <Trash2 className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login Diperlukan</h3>
        <p className="text-gray-500">Anda harus login untuk mengelola invoice</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Receipt className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            <strong>Info:</strong> Modul Invoice Management sedang dalam tahap konfigurasi. 
            Saat ini menggunakan tabel quotations sebagai placeholder.
          </p>
        </div>
      </div>

      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Receipt className="h-8 w-8 mr-3 text-green-200" />
                Invoice Management
              </CardTitle>
              <CardDescription className="text-green-100 text-lg">
                Kelola dan pantau semua invoice perusahaan
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{invoices.length}</div>
              <div className="text-green-200">Total Invoices</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Actions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari invoice, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-green-500"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-green-500">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Terkirim</SelectItem>
                  <SelectItem value="paid">Terbayar</SelectItem>
                  <SelectItem value="overdue">Jatuh Tempo</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={fetchInvoices}
                variant="outline"
                disabled={refreshing}
                className="border-2 border-gray-200 hover:border-green-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="grid gap-6">
        {filteredInvoices.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {invoices.length === 0 ? 'Belum Ada Invoice' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-gray-500">
                {invoices.length === 0 
                  ? 'Invoice akan muncul di sini setelah dibuat dari quotation atau manual' 
                  : 'Coba ubah filter atau kata kunci pencarian'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="border-2 border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {invoice.quotation_number}
                      </h3>
                      <Badge className={`flex items-center gap-1 ${getStatusColor(invoice.status || 'draft')}`}>
                        {getStatusIcon(invoice.status || 'draft')}
                        {invoice.status?.toUpperCase() || 'DRAFT'}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{invoice.client_name}</h4>
                        {invoice.client_company && (
                          <p className="text-gray-600">{invoice.client_company}</p>
                        )}
                        {invoice.client_email && (
                          <p className="text-gray-600">{invoice.client_email}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(invoice.total_amount)}
                        </p>
                        <p className="text-gray-600">
                          Tanggal: {new Date(invoice.quotation_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MoreHorizontal className="h-4 w-4 mr-1" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'sent')}>
                          <Mail className="h-4 w-4 mr-2" />
                          Kirim Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateInvoiceStatus(invoice.id, 'paid')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Tandai Terbayar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteInvoice(invoice.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Info: Buat Invoice</DialogTitle>
            <DialogDescription>
              Fitur pembuatan invoice manual belum tersedia. Saat ini invoice hanya bisa dibuat dari quotation yang sudah disetujui.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowCreateDialog(false)}>
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManager;
