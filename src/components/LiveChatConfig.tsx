
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings, 
  Globe, 
  MessageCircle, 
  Clock,
  Users,
  Save,
  Edit,
  CheckCircle,
  AlertCircle,
  Volume2,
  Bell,
  Info,
  Bot,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface LiveChatSettings {
  id?: string;
  welcome_message: string;
  offline_message: string;
  auto_reply_enabled: boolean;
  auto_reply_message: string;
  working_hours_enabled: boolean;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  max_chat_duration: number;
  chat_widget_color: string;
  chat_widget_position: string;
  require_email: boolean;
  require_phone: boolean;
  require_company: boolean;
  sound_notifications: boolean;
  email_notifications: boolean;
}

const LiveChatConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeMode, setActiveMode] = useState<'human' | 'ai' | 'hybrid' | null>(null);
  const [settings, setSettings] = useState<LiveChatSettings>({
    welcome_message: 'Halo! Selamat datang di AI Consultant Pro. Tim CS kami siap membantu Anda.',
    offline_message: 'Maaf, CS kami sedang offline. Silakan tinggalkan pesan dan kami akan merespons segera.',
    auto_reply_enabled: true,
    auto_reply_message: 'Terima kasih atas pesan Anda. Tim CS kami akan segera merespons.',
    working_hours_enabled: true,
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    max_chat_duration: 60,
    chat_widget_color: '#3B82F6',
    chat_widget_position: 'bottom-right',
    require_email: false,
    require_phone: true,
    require_company: false,
    sound_notifications: true,
    email_notifications: true
  });

  // Fetch live chat settings and determine active mode
  const { data: configData, isLoading } = useQuery({
    queryKey: ['livechat_settings'],
    queryFn: async () => {
      // Load base settings
      const { data: baseData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_base_config')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (baseData?.value) {
        const parsedSettings = JSON.parse(baseData.value);
        setSettings({ ...settings, ...parsedSettings, id: baseData.id });
      }

      // Check which mode is active
      const { data: humanData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_human_config')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: aiData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_ai_config')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: hybridData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_hybrid_config')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Determine active mode priority: AI > Hybrid > Human
      if (aiData?.value) {
        setActiveMode('ai');
      } else if (hybridData?.value) {
        setActiveMode('hybrid');
      } else if (humanData?.value) {
        setActiveMode('human');
      } else {
        setActiveMode('human'); // Default
      }
      
      return { baseData, humanData, aiData, hybridData };
    },
    enabled: !!user
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: LiveChatSettings) => {
      const settingsToSave = { ...newSettings };
      delete settingsToSave.id;

      // Use upsert logic with base config key
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'livechat_base_config',
          value: JSON.stringify(settingsToSave),
          user_id: user?.id,
          description: 'Live Chat Base Configuration Settings',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key,user_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livechat_settings'] });
      setIsEditing(false);
      toast({
        title: "Settings Saved",
        description: "Konfigurasi live chat berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(settings);
  };

  const weekDays = [
    { value: 'monday', label: 'Senin' },
    { value: 'tuesday', label: 'Selasa' },
    { value: 'wednesday', label: 'Rabu' },
    { value: 'thursday', label: 'Kamis' },
    { value: 'friday', label: 'Jumat' },
    { value: 'saturday', label: 'Sabtu' },
    { value: 'sunday', label: 'Minggu' }
  ];

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setSettings({
        ...settings,
        working_days: [...settings.working_days, day]
      });
    } else {
      setSettings({
        ...settings,
        working_days: settings.working_days.filter(d => d !== day)
      });
    }
  };

  const getModeInfo = () => {
    switch (activeMode) {
      case 'ai':
        return {
          icon: <Bot className="h-4 w-4" />,
          label: 'AI Mode',
          description: 'AI Assistant menangani semua percakapan',
          color: 'bg-purple-50 text-purple-800'
        };
      case 'hybrid':
        return {
          icon: <Users className="h-4 w-4" />,
          label: 'Hybrid Mode',
          description: 'AI + Human Support',
          color: 'bg-blue-50 text-blue-800'
        };
      case 'human':
        return {
          icon: <User className="h-4 w-4" />,
          label: 'Human Mode',
          description: 'Hanya customer service manusia',
          color: 'bg-green-50 text-green-800'
        };
      default:
        return {
          icon: <User className="h-4 w-4" />,
          label: 'Human Mode',
          description: 'Mode default',
          color: 'bg-gray-50 text-gray-800'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  const modeInfo = getModeInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
            Konfigurasi Live Chat
          </h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Batal' : 'Edit Settings'}</span>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${modeInfo.color}`}>
            <h4 className="font-medium mb-2 flex items-center">
              {modeInfo.icon}
              <span className="ml-2">Mode Aktif</span>
            </h4>
            <p className="text-sm">
              {modeInfo.label}: {modeInfo.description}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Jam Kerja
            </h4>
            <p className="text-sm text-blue-600">
              {settings.working_hours_enabled 
                ? `${settings.working_hours_start} - ${settings.working_hours_end}`
                : 'Selalu Online'
              }
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Auto Reply
            </h4>
            <p className="text-sm text-green-600">
              {activeMode === 'human' 
                ? (settings.auto_reply_enabled ? 'Aktif' : 'Nonaktif')
                : 'Dikontrol oleh AI'
              }
            </p>
          </div>
        </div>

        {/* Mode Information */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800">Mode Live Chat</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {activeMode === 'ai' && 'AI Mode: Semua percakapan ditangani oleh AI Assistant.'}
                {activeMode === 'hybrid' && 'Hybrid Mode: AI menangani respons awal dan dapat mentransfer ke human agent.'}
                {activeMode === 'human' && 'Human Mode: Percakapan ditangani oleh customer service manusia.'}
                {!activeMode && 'Belum ada mode yang dikonfigurasi. Default menggunakan Human Mode.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          {/* Basic Messages */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Pesan Dasar
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan Selamat Datang
                </label>
                <textarea
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({...settings, welcome_message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Pesan yang ditampilkan saat chat dimulai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan Offline
                </label>
                <textarea
                  value={settings.offline_message}
                  onChange={(e) => setSettings({...settings, offline_message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Pesan saat di luar jam kerja"
                />
              </div>
            </div>
            
            {/* Auto Reply - Only show for Human mode */}
            {activeMode === 'human' && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="auto_reply"
                    checked={settings.auto_reply_enabled}
                    onChange={(e) => setSettings({...settings, auto_reply_enabled: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="auto_reply" className="text-sm font-medium text-gray-700">
                    Aktifkan Auto Reply (Mode Human)
                  </label>
                </div>
                {settings.auto_reply_enabled && (
                  <textarea
                    value={settings.auto_reply_message}
                    onChange={(e) => setSettings({...settings, auto_reply_message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Pesan balasan otomatis untuk mode human"
                  />
                )}
              </div>
            )}

            {activeMode !== 'human' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <Info className="h-4 w-4 inline mr-1" />
                  Auto reply dikontrol oleh AI dalam mode {activeMode === 'ai' ? 'AI' : 'Hybrid'}.
                </p>
              </div>
            )}
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Jam Kerja
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="working_hours"
                  checked={settings.working_hours_enabled}
                  onChange={(e) => setSettings({...settings, working_hours_enabled: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="working_hours" className="text-sm font-medium text-gray-700">
                  Atur Jam Kerja
                </label>
              </div>
              
              {settings.working_hours_enabled && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={settings.working_hours_start}
                        onChange={(e) => setSettings({...settings, working_hours_start: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={settings.working_hours_end}
                        onChange={(e) => setSettings({...settings, working_hours_end: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hari Kerja
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {weekDays.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={day.value}
                            checked={settings.working_days.includes(day.value)}
                            onChange={(e) => handleWorkingDayChange(day.value, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={day.value} className="text-sm text-gray-700">
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Requirements */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Persyaratan Form
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="require_email"
                  checked={settings.require_email}
                  onChange={(e) => setSettings({...settings, require_email: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="require_email" className="text-sm font-medium text-gray-700">
                  Wajib Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="require_phone"
                  checked={settings.require_phone}
                  onChange={(e) => setSettings({...settings, require_phone: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="require_phone" className="text-sm font-medium text-gray-700">
                  Wajib Telepon
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="require_company"
                  checked={settings.require_company}
                  onChange={(e) => setSettings({...settings, require_company: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="require_company" className="text-sm font-medium text-gray-700">
                  Wajib Perusahaan
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifikasi
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sound_notifications"
                  checked={settings.sound_notifications}
                  onChange={(e) => setSettings({...settings, sound_notifications: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sound_notifications" className="text-sm font-medium text-gray-700 flex items-center">
                  <Volume2 className="h-4 w-4 mr-1" />
                  Notifikasi Suara
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="email_notifications" className="text-sm font-medium text-gray-700">
                  Notifikasi Email
                </label>
              </div>
            </div>
          </div>

          {/* Widget Customization */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Kustomisasi Widget
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warna Widget
                </label>
                <input
                  type="color"
                  value={settings.chat_widget_color}
                  onChange={(e) => setSettings({...settings, chat_widget_color: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posisi Widget
                </label>
                <select
                  value={settings.chat_widget_position}
                  onChange={(e) => setSettings({...settings, chat_widget_position: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bottom-right">Kanan Bawah</option>
                  <option value="bottom-left">Kiri Bawah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Durasi Chat (menit)
                </label>
                <input
                  type="number"
                  value={settings.max_chat_duration}
                  onChange={(e) => setSettings({...settings, max_chat_duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="180"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saveSettingsMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LiveChatConfig;
