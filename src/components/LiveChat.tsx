
import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { whatsappSettings, createWhatsAppLink } = useWhatsAppSettings();
  const { toast } = useToast();

  // Initialize conversation when customer info is provided
  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Info Required",
        description: "Nama dan nomor telepon wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email || null,
          platform: 'website',
          status: 'active',
          last_message_content: 'Percakapan dimulai',
          last_message_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(conversation.id);
      setShowCustomerForm(false);
      
      // Add initial system message
      const welcomeMessage: Message = {
        id: '1',
        text: `Halo ${customerInfo.name}! Selamat datang di AI Consultant Pro. Tim CS kami akan segera merespons pesan Anda. Untuk respons lebih cepat, Anda juga bisa langsung menghubungi kami via WhatsApp.`,
        sender: 'agent',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([welcomeMessage]);
      
      // Store initial message in database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'agent',
          sender_name: 'System',
          message_content: welcomeMessage.text,
          message_type: 'text'
        });

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Gagal memulai percakapan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Store message in database
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'customer',
          sender_name: customerInfo.name,
          message_content: userMessage.text,
          message_type: 'text'
        });

      // Update conversation last message
      await supabase
        .from('chat_conversations')
        .update({
          last_message_content: userMessage.text,
          last_message_time: new Date().toISOString(),
          unread_count: 1
        })
        .eq('id', conversationId);

      // Auto-response after 2 seconds
      setTimeout(() => {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Terima kasih atas pesan Anda. Tim expert kami akan segera merespons. Untuk konsultasi langsung, silakan klik tombol WhatsApp di bawah.',
          sender: 'agent',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentResponse]);

        // Store auto-response in database
        supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'agent',
            sender_name: 'Auto Response',
            message_content: agentResponse.text,
            message_type: 'text'
          });
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppRedirect = () => {
    const message = `Halo, saya ${customerInfo.name} (${customerInfo.phone}). Saya ingin melanjutkan konsultasi dari website Anda.`;
    const whatsappUrl = createWhatsAppLink(message);
    window.open(whatsappUrl, '_blank');
  };

  // Listen for real-time updates from admin
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_type === 'agent' && newMsg.sender_name !== 'Auto Response' && newMsg.sender_name !== 'System') {
            const agentMessage: Message = {
              id: newMsg.id,
              text: newMsg.message_content,
              sender: 'agent',
              time: new Date(newMsg.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, agentMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 relative"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Consultant Support</h3>
                <p className="text-sm opacity-90">Online sekarang</p>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          {showCustomerForm ? (
            <form onSubmit={handleCustomerInfoSubmit} className="p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mulai Konsultasi</h4>
                <p className="text-sm text-gray-600 mb-4">Silakan isi informasi Anda untuk memulai chat</p>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Nama lengkap *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder="Nomor WhatsApp *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email (opsional)"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Memulai...' : 'Mulai Chat'}
              </button>
            </form>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp Button */}
              <div className="px-4 py-2 border-t border-gray-200">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <Phone className="h-4 w-4" />
                  <span>Lanjut ke WhatsApp</span>
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
