
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface QuotationItem {
  id?: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface QuotationFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mutation: any;
  quotation: any;
}

const QuotationForm = ({ open, setOpen, mutation, quotation }: QuotationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    quotation_number: '',
    quotation_date: new Date().toISOString().split('T')[0],
    valid_until: '',
    client_name: '',
    client_email: '',
    client_company: '',
    client_address: '',
    notes: '',
    terms_conditions: '',
    tax_percentage: 11.00,
    status: 'draft'
  });

  const [items, setItems] = useState<QuotationItem[]>([
    {
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
  ]);

  useEffect(() => {
    if (quotation) {
      setFormData({
        quotation_number: quotation.quotation_number || '',
        quotation_date: quotation.quotation_date || new Date().toISOString().split('T')[0],
        valid_until: quotation.valid_until || '',
        client_name: quotation.client_name || '',
        client_email: quotation.client_email || '',
        client_company: quotation.client_company || '',
        client_address: quotation.client_address || '',
        notes: quotation.notes || '',
        terms_conditions: quotation.terms_conditions || '',
        tax_percentage: quotation.tax_percentage || 11.00,
        status: quotation.status || 'draft'
      });
    } else {
      // Generate quotation number for new quotation
      const now = new Date();
      const quotationNumber = `QUO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      setFormData(prev => ({
        ...prev,
        quotation_number: quotationNumber
      }));
    }
  }, [quotation, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax_amount = subtotal * (formData.tax_percentage / 100);
    const total_amount = subtotal + tax_amount;
    
    return { subtotal, tax_amount, total_amount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "User tidak terautentikasi",
        variant: "destructive",
      });
      return;
    }

    const { subtotal, tax_amount, total_amount } = calculateTotals();
    
    const quotationData = {
      ...formData,
      user_id: user.id,
      subtotal,
      tax_amount,
      total_amount,
      quotation_items: items.filter(item => item.item_name.trim() !== '')
    };

    if (quotation) {
      quotationData.id = quotation.id;
    }

    try {
      await mutation.mutate(quotationData);
    } catch (error) {
      console.error('Error submitting quotation:', error);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {quotation ? 'Edit Quotation' : 'Buat Quotation Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quotation_number">Nomor Quotation</Label>
                <Input
                  id="quotation_number"
                  value={formData.quotation_number}
                  onChange={(e) => handleInputChange('quotation_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quotation_date">Tanggal Quotation</Label>
                <Input
                  id="quotation_date"
                  type="date"
                  value={formData.quotation_date}
                  onChange={(e) => handleInputChange('quotation_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valid_until">Berlaku Hingga</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleInputChange('valid_until', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tax_percentage">Persentase Pajak (%)</Label>
                <Input
                  id="tax_percentage"
                  type="number"
                  step="0.01"
                  value={formData.tax_percentage}
                  onChange={(e) => handleInputChange('tax_percentage', parseFloat(e.target.value) || 0)}
                />
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
                <Label htmlFor="client_name">Nama Klien</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="client_email">Email Klien</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="client_company">Perusahaan</Label>
                <Input
                  id="client_company"
                  value={formData.client_company}
                  onChange={(e) => handleInputChange('client_company', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="client_address">Alamat</Label>
                <Textarea
                  id="client_address"
                  value={formData.client_address}
                  onChange={(e) => handleInputChange('client_address', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Item Quotation
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Nama Item</Label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Harga Satuan</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <Input
                        value={`Rp ${item.total.toLocaleString('id-ID')}`}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Deskripsi</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rp {totals.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak ({formData.tax_percentage}%):</span>
                  <span>Rp {totals.tax_amount.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>Rp {totals.total_amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Catatan & Syarat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terms_conditions">Syarat & Ketentuan</Label>
                <Textarea
                  id="terms_conditions"
                  value={formData.terms_conditions}
                  onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : (quotation ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationForm;
