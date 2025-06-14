
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
  AlertCircle,
  Brain,
  FileText,
  Upload,
  Link,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface AIConfig {
  id?: string;
  chat_mode: 'human' | 'ai' | 'hybrid';
  ai_provider: 'deepseek' | 'openai' | 'gemini';
  deepseek_api_key: string;
  openai_api_key: string;
  gemini_api_key: string;
  ai_model: string;
  ai_temperature: number;
  ai_max_tokens: number;
  ai_system_prompt: string;
  auto_handoff_to_human: boolean;
  handoff_triggers: string[];
  ai_response_delay: number;
  connection_tested: boolean;
  knowledge_base: {
    type: 'text' | 'upload' | 'google_sheet';
    content: string;
    file_url?: string;
    sheet_url?: string;
  };
}

const LiveChatAIConfig = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [knowledgeInput, setKnowledgeInput] = useState('');
  const [config, setConfig] = useState<AIConfig>({
    chat_mode: 'human',
    ai_provider: 'deepseek',
    deepseek_api_key: '',
    openai_api_key: '',
    gemini_api_key: '',
    ai_model: 'deepseek-chat',
    ai_temperature: 0.7,
    ai_max_tokens: 500,
    ai_system_prompt: 'Anda adalah asisten AI yang membantu customer service. Jawab dengan ramah, profesional, dan informatif. Jika ada pertanyaan yang kompleks atau memerlukan tindak lanjut manusia, arahkan ke customer service.',
    auto_handoff_to_human: true,
    handoff_triggers: ['komplain', 'refund', 'pembatalan', 'masalah teknis'],
    ai_response_delay: 2000,
    connection_tested: false,
    knowledge_base: {
      type: 'text',
      content: ''
    }
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
        setTestStatus(parsedConfig.connection_tested ? 'success' : 'idle');
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
      const apiKey = testConfig.ai_provider === 'deepseek' ? testConfig.deepseek_api_key 
                   : testConfig.ai_provider === 'openai' ? testConfig.openai_api_key 
                   : testConfig.gemini_api_key;

      const response = await supabase.functions.invoke('test-ai-connection', {
        body: {
          provider: testConfig.ai_provider,
          api_key: apiKey,
          model: testConfig.ai_model,
          test_message: 'Hello, this is a test message.'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to test AI connection');
      }

      return response.data;
    },
    onSuccess: () => {
      setTestStatus('success');
      setConfig(prev => ({ ...prev, connection_tested: true }));
      toast({
        title: "Test Berhasil",
        description: "Koneksi AI berhasil diuji dan dapat digunakan",
      });
    },
    onError: (error) => {
      setTestStatus('error');
      setConfig(prev => ({ ...prev, connection_tested: false }));
      toast({
        title: "Test Gagal",
        description: "Gagal menguji koneksi AI: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.connection_tested && (config.chat_mode === 'ai' || config.chat_mode === 'hybrid')) {
      toast({
        title: "Koneksi Belum Diuji",
        description: "Silakan test koneksi AI terlebih dahulu sebelum menyimpan",
        variant: "destructive",
      });
      return;
    }
    saveConfigMutation.mutate(config);
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestStatus('idle');
    testAIMutation.mutate(config);
    setTimeout(() => setIsTesting(false), 3000);
  };

  const handleKnowledgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setConfig(prev => ({
          ...prev,
          knowledge_base: {
            ...prev.knowledge_base,
            content: content,
            file_url: file.name
          }
        }));
      };
      reader.readAsText(file);
    }
  };

  const addKnowledgeFromInput = () => {
    if (knowledgeInput.trim()) {
      const currentContent = config.knowledge_base.content;
      const newContent = currentContent ? `${currentContent}\n\n${knowledgeInput.trim()}` : knowledgeInput.trim();
      
      setConfig(prev => ({
        ...prev,
        knowledge_base: {
          ...prev.knowledge_base,
          content: newContent
        }
      }));
      setKnowledgeInput('');
    }
  };

  const clearKnowledge = () => {
    setConfig(prev => ({
      ...prev,
      knowledge_base: {
        type: 'text',
        content: ''
      }
    }));
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

  const geminiModels = [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-pro', label: 'Gemini Pro' }
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

  const getCurrentApiKey = () => {
    switch (config.ai_provider) {
      case 'deepseek': return config.deepseek_api_key;
      case 'openai': return config.openai_api_key;
      case 'gemini': return config.gemini_api_key;
      default: return '';
    }
  };

  const isConfigured = getCurrentApiKey().length > 0;

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
        <div className="grid md:grid-cols-4 gap-4">
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
              {config.ai_provider === 'deepseek' ? 'DeepSeek' : 
               config.ai_provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              {testStatus === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
              Status
            </h4>
            <p className={`text-sm ${testStatus === 'success' ? 'text-green-600' : 'text-orange-600'}`}>
              {isConfigured ? (testStatus === 'success' ? 'Connected & Tested' : 'Configured - Not Tested') : 'Not Configured'}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Knowledge Base
            </h4>
            <p className="text-sm text-indigo-600">
              {config.knowledge_base.content ? `${config.knowledge_base.content.length} karakter` : 'Kosong'}
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
                      onChange={(e) => {
                        const provider = e.target.value as 'deepseek' | 'openai' | 'gemini';
                        setConfig({ 
                          ...config, 
                          ai_provider: provider,
                          ai_model: provider === 'deepseek' ? 'deepseek-chat' 
                                   : provider === 'openai' ? 'gpt-4o-mini' 
                                   : 'gemini-1.5-flash',
                          connection_tested: false
                        });
                        setTestStatus('idle');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="deepseek">DeepSeek</option>
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={config.ai_model}
                      onChange={(e) => setConfig({ ...config, ai_model: e.target.value, connection_tested: false })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {config.ai_provider === 'deepseek' && deepseekModels.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                      {config.ai_provider === 'openai' && openaiModels.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                      {config.ai_provider === 'gemini' && geminiModels.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* API Keys */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Key className="h-4 w-4 mr-1" />
                      {config.ai_provider === 'deepseek' && 'DeepSeek API Key'}
                      {config.ai_provider === 'openai' && 'OpenAI API Key'}
                      {config.ai_provider === 'gemini' && 'Gemini API Key'}
                    </label>
                    <input
                      type="password"
                      value={getCurrentApiKey()}
                      onChange={(e) => {
                        const newConfig = { ...config };
                        if (config.ai_provider === 'deepseek') {
                          newConfig.deepseek_api_key = e.target.value;
                        } else if (config.ai_provider === 'openai') {
                          newConfig.openai_api_key = e.target.value;
                        } else {
                          newConfig.gemini_api_key = e.target.value;
                        }
                        newConfig.connection_tested = false;
                        setConfig(newConfig);
                        setTestStatus('idle');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        config.ai_provider === 'deepseek' ? 'sk-...' :
                        config.ai_provider === 'openai' ? 'sk-...' : 'AI...'
                      }
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || testAIMutation.isPending || !getCurrentApiKey()}
                      variant={testStatus === 'success' ? 'default' : 'outline'}
                      className={`flex items-center space-x-2 ${
                        testStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        testStatus === 'error' ? 'border-red-500 text-red-500' : ''
                      }`}
                    >
                      {testStatus === 'success' ? <CheckCircle className="h-4 w-4" /> :
                       testStatus === 'error' ? <AlertCircle className="h-4 w-4" /> :
                       <TestTube className="h-4 w-4" />}
                      <span>
                        {isTesting ? 'Testing...' : 
                         testStatus === 'success' ? 'Connection OK' :
                         testStatus === 'error' ? 'Test Failed' : 'Test Connection'}
                      </span>
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

                {/* Knowledge Base */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Knowledge Base
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={config.knowledge_base.type === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig(prev => ({ ...prev, knowledge_base: { ...prev.knowledge_base, type: 'text' } }))}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Text
                      </Button>
                      <Button
                        type="button"
                        variant={config.knowledge_base.type === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig(prev => ({ ...prev, knowledge_base: { ...prev.knowledge_base, type: 'upload' } }))}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload File
                      </Button>
                      <Button
                        type="button"
                        variant={config.knowledge_base.type === 'google_sheet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setConfig(prev => ({ ...prev, knowledge_base: { ...prev.knowledge_base, type: 'google_sheet' } }))}
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Google Sheet
                      </Button>
                      {config.knowledge_base.content && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearKnowledge}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>

                    {config.knowledge_base.type === 'text' && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={knowledgeInput}
                            onChange={(e) => setKnowledgeInput(e.target.value)}
                            placeholder="Ketik pengetahuan baru..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button
                            type="button"
                            onClick={addKnowledgeFromInput}
                            disabled={!knowledgeInput.trim()}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                        <textarea
                          value={config.knowledge_base.content}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            knowledge_base: { ...prev.knowledge_base, content: e.target.value } 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder="Knowledge base content akan muncul di sini..."
                        />
                      </div>
                    )}

                    {config.knowledge_base.type === 'upload' && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".txt,.md,.csv"
                          onChange={handleKnowledgeUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500">
                          Upload file .txt, .md, atau .csv untuk knowledge base
                        </p>
                        {config.knowledge_base.content && (
                          <textarea
                            value={config.knowledge_base.content}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            rows={6}
                          />
                        )}
                      </div>
                    )}

                    {config.knowledge_base.type === 'google_sheet' && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={config.knowledge_base.sheet_url || ''}
                          onChange={(e) => setConfig(prev => ({ 
                            ...prev, 
                            knowledge_base: { ...prev.knowledge_base, sheet_url: e.target.value } 
                          }))}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500">
                          Masukkan URL Google Sheet yang dapat diakses publik
                        </p>
                      </div>
                    )}
                  </div>
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
