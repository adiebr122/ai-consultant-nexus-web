
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit3, Plus, Trash2, Search, RefreshCw, Settings, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface AppSetting {
  id: string;
  setting_category: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const SettingsManager = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    setting_category: '',
    setting_key: '',
    setting_value: '',
    setting_type: 'text',
    description: '',
    is_public: false
  });
  const { toast } = useToast();

  const settingCategories = [
    'general', 'contact', 'social_media', 'seo', 'design', 'email', 'api', 'security', 'other'
  ];

  const settingTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'url', label: 'URL' },
    { value: 'email', label: 'Email' },
    { value: 'color', label: 'Color' },
    { value: 'json', label: 'JSON' }
  ];

  const defaultSettings = [
    {
      category: 'general',
      settings: [
        { key: 'site_name', value: 'Visual Media X', type: 'text', description: 'Nama website', public: true },
        { key: 'site_tagline', value: 'Solusi Digital Terdepan', type: 'text', description: 'Tagline website', public: true },
        { key: 'site_description', value: 'Kami adalah perusahaan yang fokus pada pengembangan solusi digital inovatif', type: 'textarea', description: 'Deskripsi website', public: true }
      ]
    },
    {
      category: 'contact',
      settings: [
        { key: 'company_name', value: 'Visual Media X', type: 'text', description: 'Nama perusahaan', public: true },
        { key: 'company_address', value: 'Jakarta, Indonesia', type: 'textarea', description: 'Alamat perusahaan', public: true },
        { key: 'company_phone', value: '+62 21 1234 5678', type: 'text', description: 'Telepon perusahaan', public: true },
        { key: 'company_email', value: 'info@visualmediax.com', type: 'email', description: 'Email perusahaan', public: true },
        { key: 'company_whatsapp', value: '+62812345678', type: 'text', description: 'WhatsApp perusahaan', public: true }
      ]
    },
    {
      category: 'social_media',
      settings: [
        { key: 'facebook_url', value: '', type: 'url', description: 'URL Facebook', public: true },
        { key: 'instagram_url', value: '', type: 'url', description: 'URL Instagram', public: true },
        { key: 'twitter_url', value: '', type: 'url', description: 'URL Twitter', public: true },
        { key: 'linkedin_url', value: '', type: 'url', description: 'URL LinkedIn', public: true },
        { key: 'youtube_url', value: '', type: 'url', description: 'URL YouTube', public: true }
      ]
    }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('setting_category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const settingsToCreate = [];
      for (const category of defaultSettings) {
        for (const setting of category.settings) {
          settingsToCreate.push({
            user_id: user.id,
            setting_category: category.category,
            setting_key: setting.key,
            setting_value: setting.value,
            setting_type: setting.type,
            description: setting.description,
            is_public: setting.public
          });
        }
      }

      const { error } = await supabase
        .from('app_settings')
        .insert(settingsToCreate);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Pengaturan default berhasil dibuat",
      });

      await fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal membuat pengaturan default: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.setting_category.trim() || !formData.setting_key.trim()) {
      toast({
        title: "Error",
        description: "Kategori dan key wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      const settingData = {
        setting_category: formData.setting_category.trim(),
        setting_key: formData.setting_key.trim(),
        setting_value: formData.setting_value.trim() || null,
        setting_type: formData.setting_type,
        description: formData.description.trim() || null,
        is_public: formData.is_public,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase
          .from('app_settings')
          .update(settingData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Pengaturan berhasil diupdate" });
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert({
            user_id: user.id,
            ...settingData
          });

        if (error) throw error;
        toast({ title: "Berhasil!", description: "Pengaturan berhasil ditambahkan" });
      }

      resetForm();
      await fetchSettings();
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

  const handleEdit = (setting: AppSetting) => {
    setEditingId(setting.id);
    setFormData({
      setting_category: setting.setting_category,
      setting_key: setting.setting_key,
      setting_value: setting.setting_value || '',
      setting_type: setting.setting_type,
      description: setting.description || '',
      is_public: setting.is_public
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengaturan ini?')) return;

    try {
      const { error } = await supabase.from('app_settings').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Berhasil!", description: "Pengaturan berhasil dihapus" });
      await fetchSettings();
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
      setting_category: '',
      setting_key: '',
      setting_value: '',
      setting_type: 'text',
      description: '',
      is_public: false
    });
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = 
      setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.setting_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (setting.setting_value && setting.setting_value.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || setting.setting_category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getUniqueCategories = () => {
    const categories = [...new Set(settings.map(s => s.setting_category))];
    return categories.sort();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contact': return <Phone className="h-4 w-4" />;
      case 'social_media': return <Globe className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'general': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Setup */}
      {settings.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Awal</h3>
              <p className="text-blue-700">Belum ada pengaturan. Buat pengaturan default untuk memulai?</p>
            </div>
            <button
              onClick={createDefaultSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Buat Pengaturan Default
            </button>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {editingId ? <Edit3 className="h-5 w-5 mr-2 text-blue-600" /> : <Plus className="h-5 w-5 mr-2 text-green-600" />}
          {editingId ? 'Edit Pengaturan' : 'Tambah Pengaturan Baru'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              value={formData.setting_category}
              onChange={(e) => setFormData({ ...formData, setting_category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Pilih kategori</option>
              {settingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key *
            </label>
            <input
              type="text"
              value={formData.setting_key}
              onChange={(e) => setFormData({ ...formData, setting_key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="site_name, company_email, dll"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe
            </label>
            <select
              value={formData.setting_type}
              onChange={(e) => setFormData({ ...formData, setting_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {settingTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Deskripsi pengaturan"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nilai
            </label>
            {formData.setting_type === 'textarea' ? (
              <textarea
                value={formData.setting_value}
                onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Nilai pengaturan"
              />
            ) : formData.setting_type === 'boolean' ? (
              <select
                value={formData.setting_value}
                onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : (
              <input
                type={formData.setting_type === 'number' ? 'number' : 
                      formData.setting_type === 'email' ? 'email' :
                      formData.setting_type === 'url' ? 'url' :
                      formData.setting_type === 'color' ? 'color' : 'text'}
                value={formData.setting_value}
                onChange={(e) => setFormData({ ...formData, setting_value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nilai pengaturan"
              />
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pengaturan publik (dapat diakses frontend)</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !formData.setting_category.trim() || !formData.setting_key.trim()}
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
            onClick={fetchSettings}
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
            <h3 className="text-lg font-semibold">Daftar Pengaturan ({filteredSettings.length})</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari pengaturan..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                {getUniqueCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {filteredSettings.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum Ada Pengaturan'}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? 'Coba kata kunci yang berbeda' : 'Tambahkan pengaturan pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(setting.setting_category)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {setting.setting_category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{setting.setting_key}</div>
                        {setting.description && (
                          <div className="text-sm text-gray-500">{setting.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={setting.setting_value || ''}>
                        {setting.setting_value || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {setting.setting_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        setting.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {setting.is_public ? 'Publik' : 'Privat'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(setting)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit pengaturan"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(setting.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Hapus pengaturan"
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

export default SettingsManager;
