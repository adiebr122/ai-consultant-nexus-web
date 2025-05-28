
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Upload, Image, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BrandSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

const BrandSettings = () => {
  const [settings, setSettings] = useState<BrandSetting[]>([
    { setting_key: 'company_logo', setting_value: '', description: 'Logo Perusahaan' },
    { setting_key: 'company_favicon', setting_value: '', description: 'Favicon (16x16px)' },
    { setting_key: 'primary_color', setting_value: '#3B82F6', description: 'Warna Utama' },
    { setting_key: 'secondary_color', setting_value: '#1E40AF', description: 'Warna Sekunder' },
    { setting_key: 'accent_color', setting_value: '#10B981', description: 'Warna Aksen' },
    { setting_key: 'font_family', setting_value: 'Inter', description: 'Font Utama' },
    { setting_key: 'company_tagline', setting_value: '', description: 'Tagline Perusahaan' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrandSettings();
  }, []);

  const fetchBrandSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'brand_config');

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSettings = settings.map(setting => {
          const existingSetting = data.find(d => d.setting_key === setting.setting_key);
          return existingSetting ? {
            ...setting,
            id: existingSetting.id,
            setting_value: existingSetting.setting_value || setting.setting_value
          } : setting;
        });
        setSettings(updatedSettings);
      }
    } catch (error: any) {
      console.error('Error fetching brand settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan brand: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], setting_value: value };
    setSettings(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploading(settings[index].setting_key);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings[index].setting_key}_${Date.now()}.${fileExt}`;
      
      // Upload to a hypothetical public storage (you'd need to create the bucket)
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Update the setting value with the URL
      handleInputChange(index, publicUrl);

      toast({
        title: "Berhasil!",
        description: "File berhasil diupload",
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Gagal upload file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const saveBrandSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      for (const setting of settings) {
        const settingData = {
          setting_category: 'brand_config',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: setting.setting_key.includes('color') ? 'color' : 'text',
          description: setting.description,
          is_public: true,
          updated_at: new Date().toISOString()
        };

        if (setting.id) {
          const { error } = await supabase
            .from('app_settings')
            .update(settingData)
            .eq('id', setting.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('app_settings')
            .insert({
              user_id: user.id,
              ...settingData
            });
          if (error) throw error;
        }
      }

      toast({
        title: "Berhasil!",
        description: "Pengaturan brand berhasil disimpan",
      });

      await fetchBrandSettings();
    } catch (error: any) {
      console.error('Error saving brand settings:', error);
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
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>Memuat pengaturan brand...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Palette className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan Brand & Logo
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting, index) => (
          <div key={setting.setting_key}>
            <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-700 mb-2">
              {setting.description}
            </Label>
            
            {setting.setting_key.includes('logo') || setting.setting_key.includes('favicon') ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    id={setting.setting_key}
                    type="text"
                    value={setting.setting_value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder="URL gambar atau upload file"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading === setting.setting_key}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(index, file);
                      };
                      input.click();
                    }}
                  >
                    {uploading === setting.setting_key ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {setting.setting_value && (
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img 
                      src={setting.setting_value} 
                      alt={setting.description}
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : setting.setting_key.includes('color') ? (
              <div className="flex items-center space-x-2">
                <Input
                  id={setting.setting_key}
                  type="color"
                  value={setting.setting_value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={setting.setting_value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            ) : (
              <Input
                id={setting.setting_key}
                type="text"
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder={`Masukkan ${setting.description.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveBrandSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Brand
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BrandSettings;
