
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
      console.log('Fetching brand settings...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'brand_config');

      if (error) {
        console.error('Error fetching brand settings:', error);
        throw error;
      }

      console.log('Fetched brand settings:', data);

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
        console.log('Updated settings state:', updatedSettings);
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
    console.log(`Updating setting at index ${index} with value:`, value);
    const updated = [...settings];
    updated[index] = { ...updated[index], setting_value: value };
    setSettings(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploading(settings[index].setting_key);
      console.log('Uploading file:', file.name, 'for setting:', settings[index].setting_key);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar');
      }

      if (file.size > 10485760) {
        throw new Error('Ukuran file maksimal 10MB');
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings[index].setting_key}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading to storage with filename:', fileName);
      
      // Try to upload to storage
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        // If upload fails, create a local URL as fallback
        const localUrl = URL.createObjectURL(file);
        handleInputChange(index, localUrl);
        
        toast({
          title: "Info",
          description: "Gambar disimpan sementara. Untuk penyimpanan permanen, pastikan storage bucket tersedia.",
          variant: "default",
        });
      } else {
        console.log('Upload successful:', data);
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(fileName);

        console.log('Public URL:', publicUrl);
        
        // Update the setting value with the URL
        handleInputChange(index, publicUrl);

        toast({
          title: "Berhasil!",
          description: "Gambar berhasil diupload",
        });
      }
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
      console.log('Starting to save brand settings...');
      setSaving(true);
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Error checking authentication');
      }
      
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User tidak terautentikasi');
      }

      console.log('Authenticated user:', user.id);
      console.log('Settings to save:', settings);

      let successCount = 0;
      let errorCount = 0;

      for (const setting of settings) {
        try {
          console.log(`Processing setting: ${setting.setting_key} with value: ${setting.setting_value}`);
          
          const settingData = {
            setting_category: 'brand_config',
            setting_key: setting.setting_key,
            setting_value: setting.setting_value || '',
            setting_type: setting.setting_key.includes('color') ? 'color' : 'text',
            description: setting.description,
            is_public: true,
            updated_at: new Date().toISOString()
          };

          if (setting.id) {
            console.log(`Updating existing setting with ID: ${setting.id}`);
            const { error } = await supabase
              .from('app_settings')
              .update(settingData)
              .eq('id', setting.id);
            
            if (error) {
              console.error(`Error updating setting ${setting.setting_key}:`, error);
              errorCount++;
            } else {
              console.log(`Successfully updated setting: ${setting.setting_key}`);
              successCount++;
            }
          } else {
            console.log(`Inserting new setting: ${setting.setting_key}`);
            const { data: insertedData, error } = await supabase
              .from('app_settings')
              .insert({
                user_id: user.id,
                ...settingData
              })
              .select();
            
            if (error) {
              console.error(`Error inserting setting ${setting.setting_key}:`, error);
              errorCount++;
            } else {
              console.log(`Successfully inserted setting: ${setting.setting_key}`, insertedData);
              // Update the setting with the returned ID
              const updatedSettings = [...settings];
              const settingIndex = updatedSettings.findIndex(s => s.setting_key === setting.setting_key);
              if (settingIndex !== -1 && insertedData && insertedData[0]) {
                updatedSettings[settingIndex].id = insertedData[0].id;
                setSettings(updatedSettings);
              }
              successCount++;
            }
          }
        } catch (settingError: any) {
          console.error(`Error processing setting ${setting.setting_key}:`, settingError);
          errorCount++;
        }
      }

      console.log(`Save completed. Success: ${successCount}, Errors: ${errorCount}`);

      if (errorCount === 0) {
        toast({
          title: "Berhasil!",
          description: "Semua pengaturan brand berhasil disimpan",
        });
      } else if (successCount > 0) {
        toast({
          title: "Sebagian Berhasil",
          description: `${successCount} pengaturan berhasil disimpan, ${errorCount} gagal`,
          variant: "default",
        });
      } else {
        throw new Error('Semua pengaturan gagal disimpan');
      }

      // Refresh the settings from database
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
                        toast({
                          title: "Error",
                          description: "Gambar tidak dapat dimuat. Pastikan URL valid.",
                          variant: "destructive",
                        });
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
