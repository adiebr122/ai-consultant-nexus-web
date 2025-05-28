
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
  Building
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
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'sent', label: 'Terkirim', color: 'bg-blue-100 text-blue-800' },
    { value: 'accepted', label: 'Diterima', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Ditolak', color: 'bg-red-100 text-red-800' },
    { value: 'expired', label: 'Kedaluwarsa', color: 'bg-orange-100 text-orange-800' }
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

  const filteredQuotations = quotations.filter(quotation => 
    quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quotation.client_company && quotation.client_company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Penawaran</h2>
          <p className="text-gray-600">Kelola penawaran untuk klien Anda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Buat Penawaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Penawaran' : 'Buat Penawaran Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Lead Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih dari CRM (Opsional)
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kontak dari CRM atau isi manual</option>
                  {crmContacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.client_name} - {contact.client_email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Klien *
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Klien
                </label>
                <textarea
                  value={formData.client_address}
                  onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Items */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Item Penawaran</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Item *
                        </label>
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </div>
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="ml-2 text-red-600 hover:text-red-700"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Deskripsi detail item..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN ({formData.tax_percentage}%):</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syarat & Ketentuan
                </label>
                <textarea
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari penawaran..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={fetchQuotations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Penawaran</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Penawaran'}
                  </h4>
                  <p className="text-gray-500">
                    {searchTerm ? 'Coba kata kunci yang berbeda' : 'Buat penawaran pertama Anda'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((quotation) => {
                const statusInfo = getStatusInfo(quotation.status);
                return (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">
                      {quotation.quotation_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.client_name}</div>
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
                        <div>{new Date(quotation.quotation_date).toLocaleDateString('id-ID')}</div>
                        {quotation.valid_until && (
                          <div className="text-gray-500">
                            Berlaku hingga: {new Date(quotation.valid_until).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(quotation.total_amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(quotation)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuotationManager;
