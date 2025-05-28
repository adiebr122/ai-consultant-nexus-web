import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Eye, EyeOff, Search, RefreshCw, Package } from 'lucide-react';

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
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Transform data to ensure service_features is always an array of strings
      const transformedData = (data || []).map(service => ({
        ...service,
        service_features: Array.isArray(service.service_features) 
          ? (service.service_features as any[]).map(feature => String(feature))
          : []
      }));
      
      setServices(transformedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat layanan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.service_name.trim()) {
      toast({
        title: "Error",
        description: "Nama layanan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const serviceData = {
        service_name: formData.service_name.trim(),
        service_description: formData.service_description.trim() || null,
        service_features: formData.service_features ? formData.service_features.split('\n').filter(f => f.trim()) : [],
        price_starting_from: formData.price_starting_from ? parseFloat(formData.price_starting_from) : null,
        price_currency: formData.price_currency,
        service_category: formData.service_category.trim() || null,
        estimated_duration: formData.estimated_duration.trim() || null,
        service_image_url: formData.service_image_url.trim() || null,
        display_order: formData.display_order,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Layanan berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            user_id: user.id,
            ...serviceData
          });

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Layanan berhasil ditambahkan" });
      }

      resetForm();
      await fetchServices();
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

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      service_name: service.service_name,
      service_description: service.service_description || '',
      service_features: service.service_features.join('\n'),
      price_starting_from: service.price_starting_from?.toString() || '',
      price_currency: service.price_currency,
      service_category: service.service_category || '',
      estimated_duration: service.estimated_duration || '',
      service_image_url: service.service_image_url || '',
      display_order: service.display_order
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Layanan berhasil dihapus" });
      await fetchServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal menghapus: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Berhasil!",
        description: `Layanan berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      await fetchServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal mengubah status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat layanan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editingId ? <Edit3 className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-green-600" />}
          {editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Layanan *
            </label>
            <input
              type="text"
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Website Development, Mobile App, dll"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <input
              type="text"
              value={formData.service_category}
              onChange={(e) => setFormData({ ...formData, service_category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !formData.service_name.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Menyimpan...' : (editingId ? 'Update' : 'Simpan')}</span>
          </button>
          
          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Batal
            </button>
          )}
          
          <button
            onClick={fetchServices}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">Daftar Layanan ({filteredServices.length})</h3>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari layanan..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Layanan'}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan layanan pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
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
        )}
      </div>
    </div>
  );
};

export default ServiceManager;
