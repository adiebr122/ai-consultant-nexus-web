
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  BarChart3,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Volume2,
  VolumeX,
  Bot
} from 'lucide-react';
import WhatsAppChat from './WhatsAppChat';
import LiveChatConfig from './LiveChatConfig';
import LiveChatAIConfig from './LiveChatAIConfig';
import ChatAgentManager from './ChatAgentManager';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const LiveChatManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch chat statistics
  const { data: chatStats } = useQuery({
    queryKey: ['chat_stats'],
    queryFn: async () => {
      const [conversationsResult, messagesResult, agentsResult] = await Promise.all([
        supabase.from('chat_conversations').select('id, status, platform'),
        supabase.from('chat_messages').select('id').gte('message_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('chat_agents').select('id, is_active, is_online')
      ]);

      const conversations = conversationsResult.data || [];
      const todayMessages = messagesResult.data || [];
      const agents = agentsResult.data || [];

      return {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        pendingConversations: conversations.filter(c => c.status === 'pending').length,
        unassignedConversations: conversations.filter(c => c.status === 'unassigned').length,
        websiteChats: conversations.filter(c => c.platform === 'website').length,
        whatsappChats: conversations.filter(c => c.platform === 'whatsapp').length,
        todayMessages: todayMessages.length,
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.is_active).length,
        onlineAgents: agents.filter(a => a.is_online).length
      };
    },
    enabled: !!user
  });

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    toast({
      title: soundEnabled ? "Notifikasi Suara Dimatikan" : "Notifikasi Suara Dinyalakan",
      description: soundEnabled ? "Anda tidak akan mendengar suara saat ada chat masuk" : "Anda akan mendengar suara saat ada chat masuk",
    });
  };

  const tabs = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'agents', label: 'Manajemen Agent', icon: UserCheck },
    { id: 'config', label: 'Konfigurasi Live Chat', icon: Settings },
    { id: 'ai-config', label: 'Konfigurasi AI', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Analytics Live Chat</h3>
        <div className="text-sm text-gray-500">
          Data diperbarui secara real-time
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Percakapan</p>
              <p className="text-3xl font-bold text-blue-900">{chatStats?.totalConversations || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Percakapan Aktif</p>
              <p className="text-3xl font-bold text-green-900">{chatStats?.activeConversations || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Belum Ditugaskan</p>
              <p className="text-3xl font-bold text-orange-900">{chatStats?.unassignedConversations || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Menunggu Respons</p>
              <p className="text-3xl font-bold text-yellow-900">{chatStats?.pendingConversations || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chat Website</p>
              <p className="text-2xl font-bold text-blue-600">{chatStats?.websiteChats || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chat WhatsApp</p>
              <p className="text-2xl font-bold text-green-600">{chatStats?.whatsappChats || 0}</p>
            </div>
            <Phone className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pesan Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{chatStats?.todayMessages || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agent Online</p>
              <p className="text-2xl font-bold text-green-600">
                {chatStats?.onlineAgents || 0}/{chatStats?.totalAgents || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="text-lg font-semibold mb-4">Tren Pesan Harian</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Chart akan ditampilkan di sini</p>
              <p className="text-xs text-gray-400 mt-1">Data visualisasi akan segera tersedia</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h4 className="text-lg font-semibold mb-4">Distribusi Status Chat</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Pie chart akan ditampilkan di sini</p>
              <p className="text-xs text-gray-400 mt-1">Visualisasi status percakapan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Live Chat Manager</h2>
              <p className="text-gray-600 mt-1">Kelola percakapan dan notifikasi chat secara real-time</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleToggleSound}
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {soundEnabled ? 'Suara Aktif' : 'Suara Nonaktif'}
                </span>
              </Button>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-blue-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{chatStats?.onlineAgents || 0} Agent Online</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Sistem Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex space-x-1 bg-gray-50 p-1 rounded-t-xl">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'chat' && <WhatsAppChat soundEnabled={soundEnabled} />}
            {activeTab === 'agents' && <ChatAgentManager />}
            {activeTab === 'config' && <LiveChatConfig />}
            {activeTab === 'ai-config' && <LiveChatAIConfig />}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatManager;
