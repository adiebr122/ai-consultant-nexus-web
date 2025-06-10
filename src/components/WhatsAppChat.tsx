
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageCircle, 
  Phone, 
  Send, 
  Settings, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Globe,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  platform: string;
  status: string;
  last_message_content: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string;
  message_content: string;
  message_type: string;
  message_time: string;
}

const WhatsAppChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', platformFilter],
    queryFn: async () => {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (platformFilter) {
        query = query.eq('platform', platformFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Conversation[];
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('message_time', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'agent',
          sender_name: user?.email || 'Agent',
          message_content: content,
          message_type: 'text'
        });
      
      if (error) throw error;

      // Update conversation
      await supabase
        .from('chat_conversations')
        .update({
          last_message_content: content,
          last_message_time: new Date().toISOString(),
          unread_count: 0
        })
        .eq('id', conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
      toast({
        title: "Pesan Terkirim",
        description: "Pesan berhasil dikirim ke customer",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal mengirim pesan: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      supabase
        .from('chat_conversations')
        .update({ unread_count: 0 })
        .eq('id', selectedConversation);
    }
  }, [selectedConversation]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customer_phone.includes(searchTerm) ||
    (conv.customer_email && conv.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'website': return <Globe className="h-4 w-4" />;
      case 'whatsapp': return <Smartphone className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'website': return 'bg-blue-100 text-blue-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
              Live Chat ({filteredConversations.length})
            </h3>
            <button className="text-green-600 hover:text-green-700">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari konversasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Semua Platform</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada percakapan</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-gray-900">{conversation.customer_name}</h4>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mb-1 space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPlatformColor(conversation.platform)}`}>
                        {getPlatformIcon(conversation.platform)}
                        <span className="ml-1 capitalize">{conversation.platform}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center mb-1">
                      <Phone className="h-3 w-3 mr-1" />
                      {conversation.customer_phone}
                    </p>
                    {conversation.customer_email && (
                      <p className="text-xs text-gray-500 mb-1">{conversation.customer_email}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message_content}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs ${getStatusColor(conversation.status)}`}>
                      {conversation.status}
                    </span>
                    {conversation.last_message_time && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(conversation.last_message_time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversationData?.customer_name}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {selectedConversationData?.customer_phone}
                    </span>
                    {selectedConversationData?.customer_email && (
                      <span>{selectedConversationData.customer_email}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPlatformColor(selectedConversationData?.platform || '')}`}>
                    {getPlatformIcon(selectedConversationData?.platform || '')}
                    <span className="ml-1 capitalize">{selectedConversationData?.platform}</span>
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedConversationData?.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedConversationData?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedConversationData?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada pesan</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_type === 'agent'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.message_content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.sender_type === 'agent' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.sender_name}
                        </p>
                        <p className={`text-xs ${
                          message.sender_type === 'agent' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.message_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pilih Percakapan
              </h3>
              <p className="text-gray-500">
                Pilih percakapan dari daftar untuk mulai chat
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
