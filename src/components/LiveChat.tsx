
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, X, MessageCircle, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name?: string;
  created_at: string;
}

interface ChatSettings {
  isEnabled: boolean;
  welcomeMessage: string;
  businessHours: string;
  autoReply: boolean;
  autoReplyMessage: string;
}

const LiveChat = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [showContactForm, setShowContactForm] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    isEnabled: true,
    welcomeMessage: 'Hallo! Ada yang bisa kami bantu?',
    businessHours: '09:00 - 17:00 WIB',
    autoReply: true,
    autoReplyMessage: 'Terima kasih telah menghubungi kami. Tim kami akan segera membalas pesan Anda.'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatSettings();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSettings = async () => {
    try {
      // Use app_settings table to store chat settings
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_category', 'chat')
        .eq('is_public', true);

      if (error) throw error;

      if (data && data.length > 0) {
        const settings = data.reduce((acc: any, setting: any) => {
          const key = setting.setting_key;
          const value = setting.setting_value;
          
          if (key === 'is_enabled') {
            acc.isEnabled = value === 'true';
          } else if (key === 'welcome_message') {
            acc.welcomeMessage = value || 'Hallo! Ada yang bisa kami bantu?';
          } else if (key === 'business_hours') {
            acc.businessHours = value || '09:00 - 17:00 WIB';
          } else if (key === 'auto_reply') {
            acc.autoReply = value === 'true';
          } else if (key === 'auto_reply_message') {
            acc.autoReplyMessage = value || 'Terima kasih telah menghubungi kami. Tim kami akan segera membalas pesan Anda.';
          }
          return acc;
        }, {});

        setChatSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error fetching chat settings:', error);
    }
  };

  const startConversation = async () => {
    if (!customerInfo.name.trim()) {
      toast({
        title: "Error",
        description: "Nama wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email || null,
          customer_phone: customerInfo.phone || null,
          customer_company: customerInfo.company || null,
          status: 'active',
          chat_started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(data.id);
      setShowContactForm(false);
      
      // Add welcome message
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        message: chatSettings.welcomeMessage,
        sender_type: 'system',
        sender_name: 'System',
        created_at: new Date().toISOString()
      };
      
      setMessages([welcomeMsg]);

      // Add welcome message to database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: data.id,
          message: chatSettings.welcomeMessage,
          sender_type: 'system',
          sender_name: 'System'
        });

    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Gagal memulai percakapan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    const messageObj: ChatMessage = {
      id: `temp-${Date.now()}`,
      message: newMessage,
      sender_type: 'customer',
      sender_name: customerInfo.name,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, messageObj]);
    setNewMessage('');

    try {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          message: newMessage,
          sender_type: 'customer',
          sender_name: customerInfo.name
        });

      // Auto reply if enabled
      if (chatSettings.autoReply) {
        setTimeout(async () => {
          const autoReplyMsg: ChatMessage = {
            id: `auto-${Date.now()}`,
            message: chatSettings.autoReplyMessage,
            sender_type: 'system',
            sender_name: 'System',
            created_at: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, autoReplyMsg]);

          await supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversationId,
              message: chatSettings.autoReplyMessage,
              sender_type: 'system',
              sender_name: 'System'
            });
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chatSettings.isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-xs opacity-90">{chatSettings.businessHours}</p>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {showContactForm ? (
              <div className="p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Mulai Percakapan</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Nama *"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Nomor Telepon"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Perusahaan"
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={startConversation}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Memulai...' : 'Mulai Chat'}
                </Button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender_type === 'customer'
                            ? 'bg-blue-600 text-white'
                            : message.sender_type === 'system'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-h-[40px] max-h-[80px] resize-none"
                      rows={1}
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
