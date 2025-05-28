
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Mail, 
  Eye,
  Search,
  RefreshCw,
  Calculator,
  User,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Quotation {
  id: string;
  quotation_number: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_address: string | null;
  quotation_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  terms_conditions: string | null;
  created_at: string;
  lead_id: string | null;
}

interface QuotationItem {
  id: string;
  item_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CRMContact {
  id: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_phone: string | null;
}

const QuotationManager = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  
  const [formData, setFormData] = useState({
    lead_id: '',
    client_name: '',
    client_email: '',
    client_company: '',
    client_address: '',
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    tax_percentage: 11,
    notes: '',
    terms_conditions: 'Penawaran ini berlaku selama 30 hari dari tanggal penerbitan.',
    items: [{
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0
    }]
  });

  const { toast } = useToast();

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
    { value: 'sent', label: 'Terkirim', color: 'bg-blue-100 text-blue-700', icon: Mail },
    { value: 'accepted', label: 'Diterima', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
    { value: 'expired', label: 'Kedaluwarsa', color: 'bg-orange-100 text-orange-700', icon: Calendar }
  ];

  useEffect(() => {
    fetchQuotations();
    fetchCRMContacts();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat penawaran: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCRMContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_management')
        .select('id, client_name, client_email, client_company, client_phone')
        .order('client_name', { ascending: true });

      if (error) throw error;
      setCrmContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching CRM contacts:', error);
    }
  };

  const generateQuotationNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QUO-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    const taxAmount = (subtotal * formData.tax_percentage) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.client_email.trim()) {
      toast({
        title: "Error",
        description: "Nama klien dan email wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.items.some(item => !item.item_name.trim() || item.unit_price <= 0)) {
      toast({
        title: "Error",
        description: "Semua item harus memiliki nama dan harga yang valid",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const { subtotal, taxAmount, total } = calculateTotals();

      const quotationData = {
        user_id: user.id,
        lead_id: formData.lead_id || null,
        quotation_number: editingId ? undefined : generateQuotationNumber(),
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_company: formData.client_company || null,
        client_address: formData.client_address || null,
        quotation_date: formData.quotation_date,
        valid_until: formData.valid_until || null,
        subtotal,
        tax_percentage: formData.tax_percentage,
        tax_amount: taxAmount,
        total_amount: total,
        status: 'draft',
        notes: formData.notes || null,
        terms_conditions: formData.terms_conditions || null,
        updated_at: new Date().toISOString()
      };

      let quotationId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from('quotations')
          .update(quotationData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quotations')
          .insert(quotationData)
          .select()
          .single();

        if (error) throw error;
        quotationId = data.id;
      }

      // Save quotation items
      if (quotationId) {
        // Delete existing items if editing
        if (editingId) {
          await supabase
            .from('quotation_items')
            .delete()
            .eq('quotation_id', quotationId);
        }

        // Insert new items
        const items = formData.items.map(item => ({
          quotation_id: quotationId,
          item_name: item.item_name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('quotation_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({ 
        title: "Berhasil!", 
        description: editingId ? "Penawaran berhasil diupdate" : "Penawaran berhasil dibuat" 
      });
      
      resetForm();
      setIsDialogOpen(false);
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menyimpan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (quotation: Quotation) => {
    try {
      // Fetch quotation items
      const { data: items, error } = await supabase
        .from('quotation_items')
        .select('*')
        .eq('quotation_id', quotation.id);

      if (error) throw error;

      setEditingId(quotation.id);
      setFormData({
        lead_id: quotation.lead_id || '',
        client_name: quotation.client_name,
        client_email: quotation.client_email,
        client_company: quotation.client_company || '',
        client_address: quotation.client_address || '',
        quotation_date: quotation.quotation_date,
        valid_until: quotation.valid_until || '',
        tax_percentage: quotation.tax_percentage,
        notes: quotation.notes || '',
        terms_conditions: quotation.terms_conditions || '',
        items: items.map(item => ({
          item_name: item.item_name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });
      setIsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat data penawaran: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penawaran ini?')) return;

    try {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Penawaran berhasil dihapus" });
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (quotation: Quotation) => {
    toast({
      title: "Info",
      description: "Fitur download PDF akan segera tersedia",
    });
  };

  const handleSendEmail = async (quotation: Quotation) => {
    toast({
      title: "Info",
      description: "Fitur kirim email akan segera tersedia",
    });
  };

  const handleUpdateStatus = async (quotationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quotationId);

      if (error) throw error;
      
      toast({ 
        title: "Berhasil!", 
        description: `Status penawaran berhasil diupdate ke ${getStatusInfo(newStatus).label}` 
      });
      
      await fetchQuotations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengupdate status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      lead_id: '',
      client_name: '',
      client_email: '',
      client_company: '',
      client_address: '',
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: '',
      tax_percentage: 11,
      notes: '',
      terms_conditions: 'Penawaran ini berlaku selama 30 hari dari tanggal penerbitan.',
      items: [{
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }]
    });
  };

  const handleLeadSelect = (leadId: string) => {
    const selectedLead = crmContacts.find(contact => contact.id === leadId);
    if (selectedLead) {
      setFormData(prev => ({
        ...prev,
        lead_id: leadId,
        client_name: selectedLead.client_name,
        client_email: selectedLead.client_email,
        client_company: selectedLead.client_company || ''
      }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        item_name: '',
        description: '',
        quantity: 1,
        unit_price: 0
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quotation.client_company && quotation.client_company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const { subtotal, taxAmount, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat penawaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Penawaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-gray-500">Semua penawaran</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menunggu Respons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {quotations.filter(q => q.status === 'sent').length}
            </div>
            <p className="text-xs text-gray-500">Penawaran terkirim</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Diterima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {quotations.filter(q => q.status === 'accepted').length}
            </div>
            <p className="text-xs text-gray-500">Penawaran disetujui</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(quotations.reduce((sum, q) => sum + q.total_amount, 0))}
            </div>
            <p className="text-xs text-gray-500">Nilai total penawaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="h-6 w-6 mr-2 text-blue-600" />
            Manajemen Penawaran
          </h2>
          <p className="text-gray-600">Kelola penawaran untuk klien Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Buat Penawaran Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                {editingId ? 'Edit Penawaran' : 'Buat Penawaran Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              {/* Client Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informasi Klien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lead Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih dari CRM (Opsional)
                    </label>
                    <select
                      value={formData.lead_id}
                      onChange={(e) => handleLeadSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Pilih kontak dari CRM atau isi manual</option>
                      {crmContacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.client_name} - {contact.client_email}
                          {contact.client_company && ` (${contact.client_company})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Klien *
                      </label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan nama klien"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Klien *
                      </label>
                      <input
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@klien.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perusahaan
                      </label>
                      <input
                        type="text"
                        value={formData.client_company}
                        onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nama perusahaan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Penawaran
                      </label>
                      <input
                        type="date"
                        value={formData.quotation_date}
                        onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Berlaku Hingga
                      </label>
                      <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PPN (%)
                      </label>
                      <input
                        type="number"
                        value={formData.tax_percentage}
                        onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        placeholder="11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Klien
                    </label>
                    <textarea
                      value={formData.client_address}
                      onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alamat lengkap klien"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Item Penawaran
                    </CardTitle>
                    <Button type="button" onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Item *
                            </label>
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              placeholder="Nama produk/layanan"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Qty
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              min="1"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Harga Satuan
                            </label>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </div>
                          </div>
                          
                          <div className="flex items-end">
                            {formData.items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                          </label>
                          <textarea
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            placeholder="Deskripsi detail item..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals Summary */}
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">PPN ({formData.tax_percentage}%):</span>
                        <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2 border-gray-300">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes and Terms Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catatan & Syarat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Catatan tambahan untuk penawaran ini..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Syarat & Ketentuan
                      </label>
                      <textarea
                        value={formData.terms_conditions}
                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Syarat dan ketentuan penawaran..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Menyimpan...' : (editingId ? 'Update Penawaran' : 'Simpan Penawaran')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari penawaran berdasarkan nama, nomor, atau perusahaan..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Semua Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <Button onClick={fetchQuotations} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">No. Penawaran</TableHead>
                <TableHead className="font-semibold">Klien</TableHead>
                <TableHead className="font-semibold">Tanggal</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Penawaran'}
                      </h4>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? 'Coba kata kunci yang berbeda' : 'Buat penawaran pertama Anda untuk klien'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Penawaran
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotations.map((quotation) => {
                  const statusInfo = getStatusInfo(quotation.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={quotation.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          {quotation.quotation_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="h-3 w-3 mr-1 text-gray-400" />
                            {quotation.client_name}
                          </div>
                          <div className="text-sm text-gray-500">{quotation.client_email}</div>
                          {quotation.client_company && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {quotation.client_company}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {new Date(quotation.quotation_date).toLocaleDateString('id-ID')}
                          </div>
                          {quotation.valid_until && (
                            <div className="text-gray-500 text-xs">
                              Berlaku hingga: {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                          {formatCurrency(quotation.total_amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} flex items-center w-fit`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(quotation)}
                            className="hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(quotation)}
                            className="hover:bg-green-50"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendEmail(quotation)}
                            className="hover:bg-purple-50"
                            title="Kirim Email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {quotation.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(quotation.id, 'sent')}
                              className="hover:bg-blue-50"
                              title="Tandai Terkirim"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(quotation.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationManager;
