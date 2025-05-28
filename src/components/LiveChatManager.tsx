
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
  AlertTriangle
} from 'lucide-react';
import WhatsAppChat from './WhatsAppChat';
import WhatsAppConfig from './WhatsAppConfig';

const LiveChatManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');

  // Fetch chat statistics
  const { data: chatStats } = useQuery({
    queryKey: ['chat_stats'],
    queryFn: async () => {
      const [conversationsResult, messagesResult, devicesResult] = await Promise.all([
        supabase.from('chat_conversations').select('id, status'),
        supabase.from('chat_messages').select('id').gte('message_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('whatsapp_devices').select('id, connection_status').eq('user_id', user?.id || '')
      ]);

      const conversations = conversationsResult.data || [];
      const todayMessages = messagesResult.data || [];
      const devices = devicesResult.data || [];

      return {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        pendingConversations: conversations.filter(c => c.status === 'pending').length,
        todayMessages: todayMessages.length,
        connectedDevices: devices.filter(d => d.connection_status === 'connected').length,
        totalDevices: devices.length
      };
    },
    enabled: !!user
  });

  const tabs = [
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
    { id: 'config', label: 'Konfigurasi', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Analytics Live Chat</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Percakapan</p>
              <p className="text-2xl font-bold text-gray-900">{chatStats?.totalConversations || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Percakapan Aktif</p>
              <p className="text-2xl font-bold text-green-600">{chatStats?.activeConversations || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu Respons</p>
              <p className="text-2xl font-bold text-yellow-600">{chatStats?.pendingConversations || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pesan Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{chatStats?.todayMessages || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Device Terhubung</p>
              <p className="text-2xl font-bold text-green-600">
                {chatStats?.connectedDevices || 0}/{chatStats?.totalDevices || 0}
              </p>
            </div>
            <Phone className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-blue-600">95%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Pesan per Hari</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Chart akan ditampilkan di sini</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Status Percakapan</h4>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">Pie chart akan ditampilkan di sini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Chat Manager</h2>
        <div className="flex items-center space-x-2">
          {chatStats?.connectedDevices ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chat' && <WhatsAppChat />}
        {activeTab === 'config' && <WhatsAppConfig />}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default LiveChatManager;
