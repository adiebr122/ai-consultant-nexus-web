
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Phone, Mail, MapPin, Clock, Plus, Trash2, Edit3 } from 'lucide-react';

interface ContactInfo {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

interface OperatingHour {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

const ContactInfoManager = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([
    { day: 'Senin - Jumat', open_time: '09:00', close_time: '18:00', is_closed: false },
    { day: 'Sabtu', open_time: '09:00', close_time: '15:00', is_closed: false },
    { day: 'Minggu', open_time: '', close_time: '', is_closed: true }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultContactFields = [
    { key: 'company_phone', label: 'Nomor Telepon', icon: Phone, placeholder: '+62 21 5555 1234' },
    { key: 'company_email', label: 'Email', icon: Mail, placeholder: 'hello@visualmediax.com' },
    { key: 'company_address', label: 'Alamat Lengkap', icon: MapPin, placeholder: 'Menara BCA Lt. 25\nJl. MH Thamrin No. 1\nJakarta Pusat 10310' }
  ];

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'contact_info')
        .order('setting_key');

      if (error) throw error;

      // Initialize with default fields if no data exists
      if (!data || data.length === 0) {
        const initialData = defaultContactFields.map(field => ({
          id: '',
          setting_key: field.key,
          setting_value: field.placeholder,
          description: field.label
        }));
        setContactInfo(initialData);
      } else {
        setContactInfo(data.map(item => ({
          id: item.id,
          setting_key: item.setting_key,
          setting_value: item.setting_value || '',
          description: item.description || ''
        })));
      }

      // Fetch operating hours
      const { data: hoursData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'operating_hours')
        .single();

      if (hoursData && hoursData.setting_value) {
        try {
          setOperatingHours(JSON.parse(hoursData.setting_value));
        } catch (e) {
          console.error('Error parsing operating hours:', e);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Gagal memuat informasi kontak: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (index: number, field: 'setting_value' | 'description', value: string) => {
    const updated = [...contactInfo];
    updated[index] = { ...updated[index], [field]: value };
    setContactInfo(updated);
  };

  const handleOperatingHourChange = (index: number, field: keyof OperatingHour, value: string | boolean) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  const addOperatingHour = () => {
    setOperatingHours([...operatingHours, { day: '', open_time: '09:00', close_time: '17:00', is_closed: false }]);
  };

  const removeOperatingHour = (index: number) => {
    if (operatingHours.length > 1) {
      setOperatingHours(operatingHours.filter((_, i) => i !== index));
    }
  };

  const saveContactInfo = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      // Save contact info
      for (const info of contactInfo) {
        const contactData = {
          setting_category: 'contact_info',
          setting_key: info.setting_key,
          setting_value: info.setting_value,
          setting_type: 'text',
          description: info.description,
          is_public: true,
          updated_at: new Date().toISOString()
        };

        if (info.id) {
          await supabase
            .from('app_settings')
            .update(contactData)
            .eq('id', info.id);
        } else {
          await supabase
            .from('app_settings')
            .insert({
              user_id: user.id,
              ...contactData
            });
        }
      }

      // Save operating hours
      const { data: existingHours } = await supabase
        .from('app_settings')
        .select('id')
        .eq('setting_category', 'operating_hours')
        .single();

      const hoursData = {
        setting_category: 'operating_hours',
        setting_key: 'business_hours',
        setting_value: JSON.stringify(operatingHours),
        setting_type: 'json',
        description: 'Jam operasional bisnis',
        is_public: true,
        updated_at: new Date().toISOString()
      };

      if (existingHours) {
        await supabase
          .from('app_settings')
          .update(hoursData)
          .eq('id', existingHours.id);
      } else {
        await supabase
          .from('app_settings')
          .insert({
            user_id: user.id,
            ...hoursData
          });
      }

      toast({
        title: "Berhasil!",
        description: "Informasi kontak dan jam operasional berhasil disimpan",
      });

      await fetchContactInfo();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
        <span className="text-lg">Memuat informasi kontak...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-blue-600" />
          Informasi Kontak
        </h3>

        <div className="space-y-6">
          {contactInfo.map((info, index) => {
            const field = defaultContactFields.find(f => f.key === info.setting_key);
            const IconComponent = field?.icon || Edit3;

            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <IconComponent className="h-4 w-4 mr-2" />
                    {field?.label || 'Label'}
                  </label>
                  <input
                    type="text"
                    value={info.description}
                    onChange={(e) => handleContactChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Label field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai
                  </label>
                  {info.setting_key === 'company_address' ? (
                    <textarea
                      value={info.setting_value}
                      onChange={(e) => handleContactChange(index, 'setting_value', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      placeholder={field?.placeholder}
                    />
                  ) : (
                    <input
                      type={info.setting_key === 'company_email' ? 'email' : 'text'}
                      value={info.setting_value}
                      onChange={(e) => handleContactChange(index, 'setting_value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={field?.placeholder}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Jam Operasional
          </h3>
          <button
            onClick={addOperatingHour}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Hari</span>
          </button>
        </div>

        <div className="space-y-4">
          {operatingHours.map((hour, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hari
                </label>
                <input
                  type="text"
                  value={hour.day}
                  onChange={(e) => handleOperatingHourChange(index, 'day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senin - Jumat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Buka
                </label>
                <input
                  type="time"
                  value={hour.open_time}
                  onChange={(e) => handleOperatingHourChange(index, 'open_time', e.target.value)}
                  disabled={hour.is_closed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Tutup
                </label>
                <input
                  type="time"
                  value={hour.close_time}
                  onChange={(e) => handleOperatingHourChange(index, 'close_time', e.target.value)}
                  disabled={hour.is_closed}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hour.is_closed}
                    onChange={(e) => handleOperatingHourChange(index, 'is_closed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Tutup</span>
                </label>
              </div>

              <div>
                {operatingHours.length > 1 && (
                  <button
                    onClick={() => removeOperatingHour(index)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus hari ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveContactInfo}
          disabled={saving}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>
    </div>
  );
};

export default ContactInfoManager;
