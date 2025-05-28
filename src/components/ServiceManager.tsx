
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Eye, EyeOff, Search, RefreshCw, Package, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  service_name: string;
  service_description: string | null;
  service_features: string[];
  price_starting_from: number | null;
  price_currency: string;
  service_category: string | null;
  estimated_duration: string | null;
  service_image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const ServiceManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    service_name: '',
    service_description: '',
    service_features: '',
    price_starting_from: '',
    price_currency: 'IDR',
    service_category: '',
    estimated_duration: '',
    service_image_url: '',
    display_order: 0
  });
  const { toastSuccess, toastError, toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('Fetching services...');
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Services fetched:', data);
      
      // Transform data to ensure service_features is always an array of strings
      const transformedData = (data || []).map(service => ({
        ...service,
        service_features: Array.isArray(service.service_features) 
          ? (service.service_features as any[]).map(feature => String(feature))
          : []
      }));
      
      setServices(transformedData);
      console.log('Services set:', transformedData);
    } catch (error: any) {
      console.error('Fetch services error:', error);
      toastError({
        title: "Error",
        description: `Gagal memuat layanan: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.service_name.trim()) {
      toastError({
        title: "Error",
        description: "Nama layanan wajib diisi",
      });
      return;
    }

    try {
      setSaving(true);
      console.log('Starting save process...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toastError({
          title: "Error",
          description: "User tidak terautentikasi",
        });
        return;
      }

      const serviceData = {
        service_name: formData.service_name.trim(),
        service_description: formData.service_description.trim() || null,
        service_features: formData.service_features 
          ? formData.service_features.split('\n').filter(f => f.trim()).map(f => f.trim())
          : [],
        price_starting_from: formData.price_starting_from ? parseFloat(formData.price_starting_from) : null,
        price_currency: formData.price_currency,
        service_category: formData.service_category.trim() || null,
        estimated_duration: formData.estimated_duration.trim() || null,
        service_image_url: formData.service_image_url.trim() || null,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      console.log('Service data to save:', serviceData);

      if (editingId) {
        console.log('Updating service with ID:', editingId);
        
        const { data, error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        console.log('Update successful:', data);
        toastSuccess({ 
          title: "✅ Berhasil!", 
          description: "Layanan berhasil diupdate" 
        });
      } else {
        console.log('Creating new service...');
        
        const { data, error } = await supabase
          .from('services')
          .insert({
            user_id: user.id,
            ...serviceData
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        console.log('Insert successful:', data);
        toastSuccess({ 
          title: "✅ Berhasil!", 
          description: "Layanan berhasil ditambahkan" 
        });
      }

      resetForm();
      await fetchServices();
    } catch (error: any) {
      console.error('Save error:', error);
      toastError({
        title: "❌ Error",
        description: `Gagal menyimpan: ${error.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    console.log('Editing service:', service);
    
    setEditingId(service.id);
    setFormData({
      service_name: service.service_name,
      service_description: service.service_description || '',
      service_features: Array.isArray(service.service_features) 
        ? service.service_features.join('\n') 
        : '',
      price_starting_from: service.price_starting_from?.toString() || '',
      price_currency: service.price_currency,
      service_category: service.service_category || '',
      estimated_duration: service.estimated_duration || '',
      service_image_url: service.service_image_url || '',
      display_order: service.display_order
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast({
      title: "📝 Mode Edit",
      description: `Mengedit layanan: ${service.service_name}`,
      variant: "info"
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;

    try {
      console.log('Deleting service with ID:', id);
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('Delete successful');
      toastSuccess({ 
        title: "🗑️ Berhasil!", 
        description: "Layanan berhasil dihapus" 
      });
      await fetchServices();
    } catch (error: any) {
      console.error('Delete error:', error);
      toastError({
        title: "❌ Error",
        description: `Gagal menghapus: ${error.message}`,
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log('Toggling status for service:', id, 'from', currentStatus, 'to', !currentStatus);
      
      const { error } = await supabase
        .from('services')
        .update({ 
          is_active: !currentStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Toggle status error:', error);
        throw error;
      }
      
      console.log('Status toggle successful');
      toast({
        title: "🔄 Status Diubah",
        description: `Layanan berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
        variant: !currentStatus ? "success" : "warning"
      });
      await fetchServices();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toastError({
        title: "❌ Error",
        description: `Gagal mengubah status: ${error.message}`,
      });
    }
  };

  const resetForm = () => {
    console.log('Resetting form...');
    setEditingId(null);
    setFormData({
      service_name: '',
      service_description: '',
      service_features: '',
      price_starting_from: '',
      price_currency: 'IDR',
      service_category: '',
      estimated_duration: '',
      service_image_url: '',
      display_order: 0
    });
  };

  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.service_description && service.service_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (service.service_category && service.service_category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <Sparkles className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Memuat layanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Package className="h-8 w-8 mr-3 text-emerald-200" />
                Kelola Layanan
              </CardTitle>
              <CardDescription className="text-emerald-100 text-lg">
                Atur dan kelola semua layanan yang Anda tawarkan
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Zap className="h-16 w-16 text-emerald-200" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl border-b">
          <CardTitle className="text-xl font-bold flex items-center text-gray-800">
            {editingId ? <Edit3 className="h-6 w-6 mr-3 text-blue-600" /> : <Plus className="h-6 w-6 mr-3 text-green-600" />}
            {editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </CardTitle>
          {editingId && (
            <CardDescription className="text-blue-600 font-medium">
              Mode edit aktif - Anda sedang mengedit layanan
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800">
                Nama Layanan *
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80"
                placeholder="Website Development, Mobile App, dll"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-800">
                Kategori
              </label>
              <input
                type="text"
                value={formData.service_category}
                onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80"
                placeholder="Web Development, Mobile, Design, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harga Mulai Dari
              </label>
              <div className="flex">
                <select
                  value={formData.price_currency}
                  onChange={(e) => setFormData({ ...formData, price_currency: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
                <input
                  type="number"
                  value={formData.price_starting_from}
                  onChange={(e) => setFormData({ ...formData, price_starting_from: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimasi Durasi
              </label>
              <input
                type="text"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2-4 minggu, 1-3 bulan, dll"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar
              </label>
              <input
                type="url"
                value={formData.service_image_url}
                onChange={(e) => setFormData({ ...formData, service_image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/service-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Layanan
              </label>
              <textarea
                value={formData.service_description}
                onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Deskripsi detail tentang layanan..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fitur Layanan
              </label>
              <textarea
                value={formData.service_features}
                onChange={(e) => setFormData({ ...formData, service_features: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Tulis satu fitur per baris&#10;Responsive Design&#10;SEO Optimized&#10;Fast Loading&#10;Mobile Friendly"
              />
              <p className="text-xs text-gray-500 mt-1">Tulis satu fitur per baris</p>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.service_name.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{saving ? 'Menyimpan...' : (editingId ? 'Update Layanan' : 'Simpan Layanan')}</span>
            </Button>
            
            {editingId && (
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 font-bold px-6 py-3 rounded-xl transition-all duration-300"
              >
                Batal Edit
              </Button>
            )}
            
            <Button
              onClick={fetchServices}
              variant="outline"
              className="border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-800">
              Daftar Layanan ({filteredServices.length})
            </CardTitle>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari layanan..."
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80"
              />
            </div>
          </div>
        </CardHeader>
        
        {filteredServices.length === 0 ? (
          <CardContent className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-6" />
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Layanan'}
            </h4>
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan layanan pertama Anda'}
            </p>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Layanan</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Durasi</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                          {service.service_description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={service.service_description}>
                              {service.service_description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">Urutan: {service.display_order}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {service.service_category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {formatPrice(service.price_starting_from, service.price_currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {service.estimated_duration || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(service.id, service.is_active)}
                          className={`inline-flex items-center px-2 py-1 text-xs rounded-full transition-colors ${
                            service.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {service.is_active ? (
                            <><Eye className="h-3 w-3 mr-1" /> Aktif</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" /> Nonaktif</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit layanan"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Hapus layanan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ServiceManager;
