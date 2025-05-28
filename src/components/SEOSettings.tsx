
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Globe, Search, Image, FileText, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSEOSettings();
    }
  }, [user]);

  const fetchSEOSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'seo_config')
        .eq('user_id', user.id);

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
    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan. Silakan login ulang.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      for (const setting of settings) {
        const settingData = {
          setting_category: 'seo_config',
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          setting_type: 'text',
          description: setting.description,
          is_public: true,
          updated_at: new Date().toISOString(),
          user_id: user.id
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
            .insert(settingData);
          if (error) throw error;
        }
      }

      toast({
        title: "🎉 Berhasil!",
        description: "Pengaturan SEO berhasil disimpan dan akan segera terupdate di website",
      });

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
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
            <Sparkles className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-700 text-lg font-medium">Memuat pengaturan SEO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center mb-2">
                <Search className="h-8 w-8 mr-3 text-purple-200" />
                Pengaturan SEO
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Optimalkan website Anda untuk mesin pencari dan social media
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Zap className="h-16 w-16 text-purple-200" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Form */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {settings.map((setting, index) => (
              <div key={setting.setting_key} className="space-y-3">
                <Label 
                  htmlFor={setting.setting_key} 
                  className="text-sm font-bold text-gray-800 mb-3 flex items-center"
                >
                  {setting.setting_key.includes('image') ? 
                    <Image className="h-5 w-5 mr-2 text-purple-600" /> : 
                   setting.setting_key.includes('robots') ? 
                    <FileText className="h-5 w-5 mr-2 text-blue-600" /> :
                    <Globe className="h-5 w-5 mr-2 text-emerald-600" />}
                  {setting.description}
                </Label>
                {setting.setting_key === 'site_description' || setting.setting_key === 'robots_txt' ? (
                  <textarea
                    id={setting.setting_key}
                    value={setting.setting_value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 resize-vertical bg-white/80 backdrop-blur-sm"
                    placeholder={`Masukkan ${setting.description.toLowerCase()}`}
                  />
                ) : (
                  <Input
                    id={setting.setting_key}
                    type="text"
                    value={setting.setting_value}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    placeholder={`Masukkan ${setting.description.toLowerCase()}`}
                    className="border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 py-3 bg-white/80 backdrop-blur-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-10">
            <Button
              onClick={saveSEOSettings}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Simpan Pengaturan SEO
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;
