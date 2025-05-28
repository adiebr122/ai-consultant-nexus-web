
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Globe, Search, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SEOSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

const SEOSettings = () => {
  const [settings, setSettings] = useState<SEOSetting[]>([
    { setting_key: 'site_title', setting_value: '', description: 'Judul Website' },
    { setting_key: 'site_description', setting_value: '', description: 'Deskripsi Website' },
    { setting_key: 'site_keywords', setting_value: '', description: 'Keywords (pisahkan dengan koma)' },
    { setting_key: 'og_title', setting_value: '', description: 'Open Graph Title' },
    { setting_key: 'og_description', setting_value: '', description: 'Open Graph Description' },
    { setting_key: 'og_image', setting_value: '', description: 'Open Graph Image URL' },
    { setting_key: 'twitter_title', setting_value: '', description: 'Twitter Card Title' },
    { setting_key: 'twitter_description', setting_value: '', description: 'Twitter Card Description' },
    { setting_key: 'canonical_url', setting_value: '', description: 'Canonical URL' },
    { setting_key: 'robots_txt', setting_value: '', description: 'Robots.txt Content' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'seo_config');

      if (error) throw error;

      if (data && data.length > 0) {
        const updatedSettings = settings.map(setting => {
          const existingSetting = data.find(d => d.setting_key === setting.setting_key);
          return existingSetting ? {
            ...setting,
            id: existingSetting.id,
            setting_value: existingSetting.setting_value || ''
          } : setting;
        });
        setSettings(updatedSettings);
      }
    } catch (error: any) {
      console.error('Error fetching SEO settings:', error);
      toast({
        title: "Error",
        description: `Gagal memuat pengaturan SEO: ${error.message}`,
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

  const saveSEOSettings = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User tidak terautentikasi');

      for (const setting of settings) {
        const settingData = {
          setting_category: 'seo_config',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: 'text',
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
        description: "Pengaturan SEO berhasil disimpan dan akan segera terupdate di website",
      });

      // Trigger a page refresh to apply new settings
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      await fetchSEOSettings();
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
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
        <span>Memuat pengaturan SEO...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Search className="h-5 w-5 mr-2 text-blue-600" />
          Pengaturan SEO
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting, index) => (
          <div key={setting.setting_key}>
            <Label htmlFor={setting.setting_key} className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              {setting.setting_key.includes('image') ? <Image className="h-4 w-4 mr-1" /> : 
               setting.setting_key.includes('robots') ? <FileText className="h-4 w-4 mr-1" /> :
               <Globe className="h-4 w-4 mr-1" />}
              {setting.description}
            </Label>
            {setting.setting_key === 'site_description' || setting.setting_key === 'robots_txt' ? (
              <textarea
                id={setting.setting_key}
                value={setting.setting_value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder={`Masukkan ${setting.description.toLowerCase()}`}
              />
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
          onClick={saveSEOSettings}
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
              Simpan Pengaturan SEO
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SEOSettings;
