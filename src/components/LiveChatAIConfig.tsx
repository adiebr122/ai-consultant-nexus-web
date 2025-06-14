
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bot, 
  User, 
  Key,
  Settings,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface AIConfig {
  id?: string;
  chat_mode: 'human' | 'ai' | 'hybrid';
  ai_provider: 'deepseek' | 'openai';
  deepseek_api_key: string;
  openai_api_key: string;
  ai_model: string;
  ai_temperature: number;
  ai_max_tokens: number;
  ai_system_prompt: string;
  auto_handoff_to_human: boolean;
  handoff_triggers: string[];
  ai_response_delay: number;
}

const LiveChatAIConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<AIConfig>({
    chat_mode: 'human',
    ai_provider: 'deepseek',
    deepseek_api_key: '',
    openai_api_key: '',
    ai_model: 'deepseek-chat',
    ai_temperature: 0.7,
    ai_max_tokens: 500,
    ai_system_prompt: 'Anda adalah asisten AI yang membantu customer service. Jawab dengan ramah, profesional, dan informatif. Jika ada pertanyaan yang kompleks atau memerlukan tindak lanjut manusia, arahkan ke customer service.',
    auto_handoff_to_human: true,
    handoff_triggers: ['komplain', 'refund', 'pembatalan', 'masalah teknis'],
    ai_response_delay: 2000
  });

  // Fetch AI configuration
  const { data: aiConfigData, isLoading } = useQuery({
    queryKey: ['livechat_ai_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_ai_config')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.value) {
        const parsedConfig = JSON.parse(data.value);
        setConfig({ ...config, ...parsedConfig, id: data.id });
        return { ...config, ...parsedConfig, id: data.id };
      }
      
      return config;
    },
    enabled: !!user
  });

  // Save AI config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: AIConfig) => {
      const configToSave = { ...newConfig };
      delete configToSave.id;

      if (aiConfigData?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            value: JSON.stringify(configToSave),
            updated_at: new Date().toISOString()
          })
          .eq('id', aiConfigData.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            key: 'livechat_ai_config',
            value: JSON.stringify(configToSave),
            user_id: user?.id,
            description: 'Live Chat AI Configuration Settings'
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livechat_ai_config'] });
      setIsEditing(false);
      toast({
        title: "AI Configuration Saved",
        description: "Konfigurasi AI live chat berhasil disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi AI: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Test AI connection
  const testAIMutation = useMutation({
    mutationFn: async (testConfig: AIConfig) => {
      const response = await fetch('/api/test-ai-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: testConfig.ai_provider,
          api_key: testConfig.ai_provider === 'deepseek' ? testConfig.deepseek_api_key : testConfig.openai_api_key,
          model: testConfig.ai_model,
          test_message: 'Hello, this is a test message.'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test AI connection');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Berhasil",
        description: "Koneksi AI berhasil diuji",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Gagal",
        description: "Gagal menguji koneksi AI: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfigMutation.mutate(config);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    testAIMutation.mutate(config);
    setTimeout(() => setIsTesting(false), 3000);
  };

  const deepseekModels = [
    { value: 'deepseek-chat', label: 'DeepSeek Chat' },
    { value: 'deepseek-coder', label: 'DeepSeek Coder' }
  ];

  const openaiModels = [
    { value: 'gpt-4o-mini', label: 'GPT-4O Mini' },
    { value: 'gpt-4o', label: 'GPT-4O' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ];

  const chatModes = [
    { value: 'human', label: 'Human Only', description: 'Semua chat ditangani oleh human agent', icon: User },
    { value: 'ai', label: 'AI Only', description: 'Semua chat ditangani oleh AI', icon: Bot },
    { value: 'hybrid', label: 'Hybrid (AI + Human)', description: 'AI menangani pertama, handoff ke human jika diperlukan', icon: Settings }
  ];

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
            <Bot className="h-5 w-5 mr-2 text-purple-600" />
            AI Assistant Configuration
          </h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Settings'}</span>
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2 flex items-center">
              {config.chat_mode === 'human' && <User className="h-4 w-4 mr-2" />}
              {config.chat_mode === 'ai' && <Bot className="h-4 w-4 mr-2" />}
              {config.chat_mode === 'hybrid' && <Settings className="h-4 w-4 mr-2" />}
              Mode Chat
            </h4>
            <p className="text-sm text-purple-600 capitalize">
              {config.chat_mode === 'human' && 'Human Only'}
              {config.chat_mode === 'ai' && 'AI Only'}
              {config.chat_mode === 'hybrid' && 'Hybrid (AI + Human)'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              AI Provider
            </h4>
            <p className="text-sm text-blue-600 capitalize">
              {config.ai_provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Status
            </h4>
            <p className="text-sm text-green-600">
              {(config.ai_provider === 'deepseek' && config.deepseek_api_key) || 
               (config.ai_provider === 'openai' && config.openai_api_key) 
                ? 'Configured' : 'Not Configured'}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          {/* Chat Mode Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Mode Operasi Chat
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {chatModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <div
                    key={mode.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      config.chat_mode === mode.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({ ...config, chat_mode: mode.value as any })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <h5 className="font-medium">{mode.label}</h5>
                    </div>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Provider Configuration */}
          {(config.chat_mode === 'ai' || config.chat_mode === 'hybrid') && (
            <>
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  Konfigurasi AI Provider
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <select
                      value={config.ai_provider}
                      onChange={(e) => setConfig({ ...config, ai_provider: e.target.value as 'deepseek' | 'openai' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="deepseek">DeepSeek</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={config.ai_model}
                      onChange={(e) => setConfig({ ...config, ai_model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {config.ai_provider === 'deepseek' 
                        ? deepseekModels.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                          ))
                        : openaiModels.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                          ))
                      }
                    </select>
                  </div>
                </div>

                {/* API Keys */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {config.ai_provider === 'deepseek' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Key className="h-4 w-4 mr-1" />
                        DeepSeek API Key
                      </label>
                      <input
                        type="password"
                        value={config.deepseek_api_key}
                        onChange={(e) => setConfig({ ...config, deepseek_api_key: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="sk-..."
                      />
                    </div>
                  )}
                  
                  {config.ai_provider === 'openai' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Key className="h-4 w-4 mr-1" />
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={config.openai_api_key}
                        onChange={(e) => setConfig({ ...config, openai_api_key: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="sk-..."
                      />
                    </div>
                  )}
                  
                  <div>
                    <Button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || testAIMutation.isPending}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <TestTube className="h-4 w-4" />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </Button>
                  </div>
                </div>

                {/* AI Parameters */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (0-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.ai_temperature}
                      onChange={(e) => setConfig({ ...config, ai_temperature: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="2000"
                      value={config.ai_max_tokens}
                      onChange={(e) => setConfig({ ...config, ai_max_tokens: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response Delay (ms)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="500"
                      value={config.ai_response_delay}
                      onChange={(e) => setConfig({ ...config, ai_response_delay: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={config.ai_system_prompt}
                    onChange={(e) => setConfig({ ...config, ai_system_prompt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Instruksi untuk AI assistant..."
                  />
                </div>
              </div>

              {/* Hybrid Mode Settings */}
              {config.chat_mode === 'hybrid' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Pengaturan Hybrid Mode
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto_handoff"
                        checked={config.auto_handoff_to_human}
                        onChange={(e) => setConfig({ ...config, auto_handoff_to_human: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="auto_handoff" className="text-sm font-medium text-gray-700">
                        Auto Handoff ke Human jika AI tidak bisa menangani
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trigger Keywords untuk Handoff (pisahkan dengan koma)
                      </label>
                      <textarea
                        value={config.handoff_triggers.join(', ')}
                        onChange={(e) => setConfig({ 
                          ...config, 
                          handoff_triggers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="komplain, refund, pembatalan, masalah teknis"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saveConfigMutation.isPending}
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
