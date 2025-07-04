
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bot, 
  Brain, 
  Settings, 
  Save,
  Edit,
  CheckCircle,
  AlertTriangle,
  TestTube,
  Upload,
  FileText,
  Link,
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface AISettings {
  id?: string;
  mode: 'human' | 'ai' | 'hybrid';
  provider: 'deepseek' | 'openai' | 'gemini';
  api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  knowledge_base: string;
  handoff_triggers: string[];
}

interface KnowledgeEntry {
  id: string;
  type: 'text' | 'file' | 'url';
  title: string;
  content: string;
}

const LiveChatAIConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [settings, setSettings] = useState<AISettings>({
    mode: 'human',
    provider: 'openai',
    api_key: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 500,
    system_prompt: 'Anda adalah asisten AI yang membantu customer service. Berikan respons yang ramah, profesional, dan informatif dalam bahasa Indonesia.',
    knowledge_base: '',
    handoff_triggers: ['butuh bicara dengan manusia', 'minta agent', 'komplain serius', 'refund', 'pembatalan']
  });

  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [newKnowledge, setNewKnowledge] = useState({
    type: 'text' as 'text' | 'file' | 'url',
    title: '',
    content: ''
  });

  // Model options based on provider
  const getModelOptions = () => {
    switch (settings.provider) {
      case 'openai':
        return [
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Cepat & Hemat)' },
          { value: 'gpt-4o', label: 'GPT-4o (Kuat & Akurat)' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Cepat)' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Akurat)' }
        ];
      case 'deepseek':
        return [
          { value: 'deepseek-chat', label: 'DeepSeek Chat' }
        ];
      default:
        return [];
    }
  };

  // Generate unique key based on mode to prevent conflicts
  const getConfigKey = (mode: string) => {
    return `livechat_${mode}_config`;
  };

  // Fetch AI settings with mode-specific key
  const { data: configData, isLoading } = useQuery({
    queryKey: ['livechat_ai_settings', settings.mode],
    queryFn: async () => {
      const configKey = getConfigKey(settings.mode);
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', configKey)
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.setting_value) {
        const parsedSettings = JSON.parse(data.setting_value);
        const updatedSettings = { ...settings, ...parsedSettings, id: data.id };
        setSettings(updatedSettings);
        return updatedSettings;
      }
      
      return settings;
    },
    enabled: !!user
  });

  // Test AI connection
  const testConnection = async () => {
    if (!settings.api_key || !settings.provider) {
      toast({
        title: "Error",
        description: "API Key dan Provider harus diisi",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const response = await supabase.functions.invoke('test-ai-connection', {
        body: {
          provider: settings.provider,
          api_key: settings.api_key,
          model: settings.model
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Test connection failed');
      }

      setConnectionStatus('success');
      toast({
        title: "Koneksi Berhasil",
        description: `Berhasil terhubung ke ${settings.provider.toUpperCase()}`,
      });
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: "Koneksi Gagal",
        description: error.message || "Gagal terhubung ke AI provider",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Save settings mutation with mode-specific key
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AISettings) => {
      // Test connection first if mode is AI or hybrid
      if ((newSettings.mode === 'ai' || newSettings.mode === 'hybrid') && connectionStatus !== 'success') {
        throw new Error('Silakan test koneksi AI terlebih dahulu sebelum mengaktifkan mode AI');
      }

      const settingsToSave = { ...newSettings };
      delete settingsToSave.id;

      // Compile knowledge base from entries
      const compiledKnowledge = knowledgeEntries.map(entry => 
        `${entry.title}:\n${entry.content}`
      ).join('\n\n');
      
      settingsToSave.knowledge_base = compiledKnowledge;

      // Use mode-specific key to prevent conflicts
      const configKey = getConfigKey(newSettings.mode);

      // Use upsert logic with app_settings
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: configKey,
          setting_value: JSON.stringify(settingsToSave),
          setting_category: 'livechat',
          user_id: user?.id,
          description: `Live Chat ${newSettings.mode.toUpperCase()} Mode Configuration`,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key,user_id'
        });
      
      if (error) throw error;

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['livechat_ai_settings'] });
      queryClient.invalidateQueries({ queryKey: ['livechat_settings'] });
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Settings Saved",
        description: "Konfigurasi AI berhasil disimpan",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan konfigurasi AI",
        variant: "destructive",
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(settings);
  };

  // Handle mode change - this will trigger refetch with new key
  const handleModeChange = (newMode: 'human' | 'ai' | 'hybrid') => {
    setSettings(prev => ({ ...prev, mode: newMode }));
    setConnectionStatus('idle'); // Reset connection status when mode changes
  };

  // Knowledge base management
  const addKnowledgeEntry = () => {
    if (!newKnowledge.title || !newKnowledge.content) {
      toast({
        title: "Error",
        description: "Judul dan konten harus diisi",
        variant: "destructive",
      });
      return;
    }

    const entry: KnowledgeEntry = {
      id: Date.now().toString(),
      type: newKnowledge.type,
      title: newKnowledge.title,
      content: newKnowledge.content
    };

    setKnowledgeEntries([...knowledgeEntries, entry]);
    setNewKnowledge({ type: 'text', title: '', content: '' });
    
    toast({
      title: "Knowledge Entry Added",
      description: "Entry pengetahuan berhasil ditambahkan",
    });
  };

  const removeKnowledgeEntry = (id: string) => {
    setKnowledgeEntries(knowledgeEntries.filter(entry => entry.id !== id));
  };

  // Load knowledge entries from existing knowledge_base - FIXED
  useEffect(() => {
    if (configData && configData.knowledge_base && typeof configData.knowledge_base === 'string' && configData.knowledge_base.trim()) {
      try {
        // Parse existing knowledge base (this is a simple implementation)
        const entries = configData.knowledge_base.split('\n\n').map((section: string, index: number) => {
          const [title, ...contentLines] = section.split('\n');
          return {
            id: index.toString(),
            type: 'text' as const,
            title: title.replace(':', ''),
            content: contentLines.join('\n')
          };
        }).filter((entry: any) => entry.title && entry.content);
        
        setKnowledgeEntries(entries);
      } catch (error) {
        console.error('Error parsing knowledge base:', error);
        setKnowledgeEntries([]);
      }
    } else {
      // If no knowledge base or it's not a string, set empty array
      setKnowledgeEntries([]);
    }
  }, [configData]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading AI configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            Konfigurasi AI Live Chat
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
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Mode AI
            </h4>
            <p className="text-sm text-blue-600 capitalize">
              {settings.mode === 'human' && 'Human Only'}
              {settings.mode === 'ai' && 'AI Only'}
              {settings.mode === 'hybrid' && 'AI + Human Hybrid'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Provider
            </h4>
            <p className="text-sm text-green-600 uppercase">
              {settings.provider}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2 flex items-center">
              {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
              {connectionStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
              {connectionStatus === 'idle' && <TestTube className="h-4 w-4 mr-2" />}
              Status Koneksi
            </h4>
            <p className={`text-sm ${
              connectionStatus === 'success' ? 'text-green-600' : 
              connectionStatus === 'error' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {connectionStatus === 'success' && 'Terhubung'}
              {connectionStatus === 'error' && 'Gagal'}
              {connectionStatus === 'idle' && 'Belum Ditest'}
            </p>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Penjelasan Mode
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Human Only:</strong> Semua chat ditangani oleh human agent. Auto-reply menggunakan pesan template.</p>
            <p><strong>AI Only:</strong> Semua chat ditangani oleh AI. Tidak ada escalation ke human.</p>
            <p><strong>AI + Human Hybrid:</strong> AI menangani chat awal, bisa transfer ke human agent jika diperlukan.</p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          {/* Basic AI Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Pengaturan Dasar AI
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode Operasi
                </label>
                <select
                  value={settings.mode}
                  onChange={(e) => handleModeChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="human">Human Only</option>
                  <option value="ai">AI Only</option>
                  <option value="hybrid">AI + Human Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) => setSettings({...settings, provider: e.target.value as any, model: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan API key Anda"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API key akan disimpan dengan aman dan dienkripsi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({...settings, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Model</option>
                  {getModelOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Connection */}
            <div className="mt-4">
              <Button
                type="button"
                onClick={testConnection}
                disabled={testingConnection || !settings.api_key || !settings.provider}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <TestTube className="h-4 w-4" />
                <span>{testingConnection ? 'Testing...' : 'Test Koneksi'}</span>
              </Button>
            </div>
          </div>

          {/* Advanced Settings - Only show if AI mode is enabled */}
          {(settings.mode === 'ai' || settings.mode === 'hybrid') && (
            <>
              {/* Model Parameters */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Parameter Model
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Semakin rendah semakin konsisten, semakin tinggi semakin kreatif
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="2000"
                      value={settings.max_tokens}
                      onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Batas maksimal panjang respons AI
                    </p>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  System Prompt
                </h4>
                <textarea
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Instruksi untuk AI tentang bagaimana harus berperilaku..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Instruksi dasar yang akan diberikan kepada AI untuk menentukan perilaku dan gaya komunikasinya
                </p>
              </div>

              {/* Knowledge Base */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Knowledge Base
                </h4>
                
                {/* Add new knowledge entry */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium mb-3">Tambah Pengetahuan Baru</h5>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe
                      </label>
                      <select
                        value={newKnowledge.type}
                        onChange={(e) => setNewKnowledge({...newKnowledge, type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="text">Teks Manual</option>
                        <option value="url">URL/Google Sheet</option>
                        <option value="file">Upload File</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul
                      </label>
                      <input
                        type="text"
                        value={newKnowledge.title}
                        onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Judul pengetahuan..."
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {newKnowledge.type === 'url' ? 'URL' : 'Konten'}
                    </label>
                    <textarea
                      value={newKnowledge.content}
                      onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder={
                        newKnowledge.type === 'url' 
                          ? 'https://docs.google.com/spreadsheets/d/...' 
                          : 'Konten pengetahuan...'
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={addKnowledgeEntry}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Entry</span>
                  </Button>
                </div>

                {/* Knowledge entries list */}
                <div className="space-y-3">
                  {knowledgeEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {entry.type === 'text' && <FileText className="h-4 w-4 text-blue-600" />}
                          {entry.type === 'url' && <Link className="h-4 w-4 text-green-600" />}
                          {entry.type === 'file' && <Upload className="h-4 w-4 text-purple-600" />}
                          <span className="font-medium">{entry.title}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                            {entry.type}
                          </span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeKnowledgeEntry(entry.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {entry.content.length > 200 ? entry.content.substring(0, 200) + '...' : entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handoff Triggers for Hybrid Mode */}
              {settings.mode === 'hybrid' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Trigger Handoff ke Human
                  </h4>
                  <div className="space-y-2">
                    {settings.handoff_triggers.map((trigger, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={trigger}
                          onChange={(e) => {
                            const newTriggers = [...settings.handoff_triggers];
                            newTriggers[index] = e.target.value;
                            setSettings({...settings, handoff_triggers: newTriggers});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Kata kunci untuk transfer ke human..."
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            const newTriggers = settings.handoff_triggers.filter((_, i) => i !== index);
                            setSettings({...settings, handoff_triggers: newTriggers});
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() => setSettings({
                        ...settings, 
                        handoff_triggers: [...settings.handoff_triggers, '']
                      })}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Trigger</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    AI akan mentransfer chat ke human agent jika mendeteksi kata kunci ini dalam pesan customer
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saveSettingsMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi AI</span>
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

export default LiveChatAIConfig;
