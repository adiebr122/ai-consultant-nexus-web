
import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Star, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAudioNotification } from '@/hooks/useAudioNotification';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
  senderName?: string;
}

interface LiveChatSettings {
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

interface AISettings {
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

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [chatEnded, setChatEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
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
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [isWithinWorkingHours, setIsWithinWorkingHours] = useState(true);
  
  const { toast } = useToast();
  const { playNotification } = useAudioNotification();

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check working hours
  useEffect(() => {
    if (settings.working_hours_enabled) {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5);
      
      const isDayIncluded = settings.working_days.includes(currentDay);
      const isTimeWithin = currentTime >= settings.working_hours_start && currentTime <= settings.working_hours_end;
      
      setIsWithinWorkingHours(isDayIncluded && isTimeWithin);
    } else {
      setIsWithinWorkingHours(true);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      // Load live chat settings
      const { data: livechatData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_config')
        .single();
      
      if (livechatData?.value) {
        const parsedSettings = JSON.parse(livechatData.value);
        setSettings({ ...settings, ...parsedSettings });
      }

      // Load AI settings
      const { data: aiData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'livechat_ai_config')
        .single();
      
      if (aiData?.value) {
        const parsedAiSettings = JSON.parse(aiData.value);
        setAiSettings(parsedAiSettings);
        console.log('AI Settings loaded:', parsedAiSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Initialize conversation when customer info is provided
  const handleCustomerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields based on settings
    if (!customerInfo.name || 
        (settings.require_phone && !customerInfo.phone) ||
        (settings.require_email && !customerInfo.email) ||
        (settings.require_company && !customerInfo.company)) {
      toast({
        title: "Info Required",
        description: "Harap lengkapi semua field yang wajib diisi",
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
          customer_company: customerInfo.company || null,
          platform: 'website',
          status: 'unassigned',
          last_message_content: 'Percakapan dimulai',
          last_message_time: new Date().toISOString(),
          chat_started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(conversation.id);
      setShowCustomerForm(false);
      
      // Add welcome message based on working hours
      const welcomeText = isWithinWorkingHours ? settings.welcome_message : settings.offline_message;
      const welcomeMessage: Message = {
        id: '1',
        text: welcomeText.replace('{name}', customerInfo.name),
        sender: 'agent',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        senderName: 'System'
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

      // Create CRM entry
      await supabase
        .from('user_management')
        .insert({
          admin_user_id: '2da7d5d8-a2d8-4bfa-bcb8-8ac350d299cf',
          client_name: customerInfo.name,
          client_email: customerInfo.email || '',
          client_phone: customerInfo.phone,
          client_company: customerInfo.company || null,
          lead_source: 'Live Chat',
          lead_status: 'new',
          notes: 'Lead dari Live Chat website'
        });

      toast({
        title: "Chat Dimulai",
        description: "Percakapan berhasil dimulai.",
      });

    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Gagal memulai percakapan. Silakan coba lagi.",
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
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      senderName: customerInfo.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
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

      // Update conversation
      await supabase
        .from('chat_conversations')
        .update({
          last_message_content: userMessage.text,
          last_message_time: new Date().toISOString(),
          unread_count: 1,
          status: 'active'
        })
        .eq('id', conversationId);

      console.log('AI Settings for response:', aiSettings);

      // Handle AI response if enabled
      if (aiSettings && (aiSettings.mode === 'ai' || aiSettings.mode === 'hybrid')) {
        console.log('Attempting AI response...');
        await handleAIResponse(messageToSend);
      } else if (settings.auto_reply_enabled) {
        // Send auto reply for human mode
        setTimeout(() => {
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            text: settings.auto_reply_message,
            sender: 'agent',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            senderName: 'System'
          };
          setMessages(prev => [...prev, autoReply]);
          
          // Store auto reply in database
          supabase
            .from('chat_messages')
            .insert({
              conversation_id: conversationId,
              sender_type: 'agent',
              sender_name: 'System',
              message_content: autoReply.text,
              message_type: 'text'
            });
        }, 1000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    }
  };

  const handleAIResponse = async (userMessage: string) => {
    if (!aiSettings || !conversationId) {
      console.log('No AI settings or conversation ID');
      return;
    }

    console.log('Making AI request with settings:', {
      provider: aiSettings.provider,
      model: aiSettings.model,
      hasApiKey: !!aiSettings.api_key
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId,
          provider: aiSettings.provider,
          api_key: aiSettings.api_key,
          model: aiSettings.model,
          temperature: aiSettings.temperature,
          max_tokens: aiSettings.max_tokens,
          system_prompt: aiSettings.system_prompt,
          conversation_history: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          knowledge_base: aiSettings.knowledge_base
        })
      });

      console.log('AI Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'AI response failed');
      }

      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: data.response,
        sender: 'agent',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        senderName: 'AI Assistant'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Store AI response
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'agent',
          sender_name: 'AI Assistant',
          message_content: aiMessage.text,
          message_type: 'text'
        });

      // Check for handoff in hybrid mode
      if (aiSettings.mode === 'hybrid' && data.should_handoff) {
        await supabase
          .from('chat_conversations')
          .update({ status: 'pending_handoff' })
          .eq('id', conversationId);
        
        const handoffMessage: Message = {
          id: (Date.now() + 3).toString(),
          text: 'Permintaan Anda akan diteruskan ke customer service kami. Mohon tunggu sebentar.',
          sender: 'agent',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          senderName: 'System'
        };
        setMessages(prev => [...prev, handoffMessage]);

        // Store handoff message
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'agent',
            sender_name: 'System',
            message_content: handoffMessage.text,
            message_type: 'text'
          });
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 4).toString(),
        text: 'Maaf, saya mengalami gangguan teknis. Tim CS kami akan segera membantu Anda.',
        sender: 'agent',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        senderName: 'System'
      };
      setMessages(prev => [...prev, errorMessage]);

      // Store error message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'agent',
          sender_name: 'System',
          message_content: errorMessage.text,
          message_type: 'text'
        });
    }
  };

  const handleEndChat = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chat_conversations')
        .update({
          status: 'closed',
          chat_ended_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Automatically send transcript email when chat ends
      if (customerInfo.email) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-chat-transcript`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ conversationId })
        });
      }

      setChatEnded(true);
      setShowFeedback(true);
      
      toast({
        title: "Chat Berakhir",
        description: customerInfo.email ? "Transkrip chat akan dikirim ke email Anda" : "Chat telah berakhir",
      });
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: "Error",
        description: "Gagal mengakhiri chat",
        variant: "destructive",
      });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chat_conversations')
        .update({
          chat_rating: rating,
          chat_feedback: feedback
        })
        .eq('id', conversationId);

      // Send transcript with updated feedback
      if (customerInfo.email) {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-chat-transcript`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ conversationId })
        });
      }

      setShowFeedback(false);
      toast({
        title: "Terima Kasih",
        description: customerInfo.email ? "Feedback Anda telah dikirim dan transkrip final telah dikirim ke email" : "Feedback Anda telah dikirim",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim feedback",
        variant: "destructive",
      });
    }
  };

  // Listen for real-time updates with improved channel handling
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up real-time listener for conversation:', conversationId);

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
          console.log('Real-time message received:', payload);
          const newMsg = payload.new;
          
          // Only add agent messages that aren't from the current customer
          if (newMsg.sender_type === 'agent' && 
              newMsg.sender_name !== 'System' && 
              newMsg.sender_name !== 'AI Assistant') {
            
            const agentMessage: Message = {
              id: newMsg.id,
              text: newMsg.message_content,
              sender: 'agent',
              time: new Date(newMsg.message_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              senderName: newMsg.sender_name
            };
            
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === newMsg.id);
              if (exists) return prev;
              
              return [...prev, agentMessage];
            });
            
            if (settings.sound_notifications) {
              playNotification();
            }
            
            if (!isOpen) {
              setHasNewMessage(true);
            }
            
            toast({
              title: "Pesan Baru dari CS",
              description: `${newMsg.sender_name}: ${newMsg.message_content.substring(0, 50)}...`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [conversationId, isOpen, playNotification, toast, settings.sound_notifications]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
    }
  }, [isOpen]);

  // Dynamic positioning based on settings
  const positionClass = settings.chat_widget_position === 'bottom-left' ? 'bottom-6 left-6' : 'bottom-6 right-6';
  const chatWindowPosition = settings.chat_widget_position === 'bottom-left' ? 'bottom-24 left-6' : 'bottom-24 right-6';

  return (
    <>
      {/* Chat Button */}
      <div className={`fixed ${positionClass} z-50`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
            hasNewMessage ? 'animate-bounce' : ''
          }`}
          style={{ backgroundColor: settings.chat_widget_color }}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!isOpen && hasNewMessage && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              !
            </span>
          )}
          {!isOpen && !hasNewMessage && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${chatWindowPosition} w-80 bg-white rounded-2xl shadow-2xl z-50 border border-gray-200`}>
          {/* Chat Header */}
          <div className="text-white p-4 rounded-t-2xl" style={{ background: `linear-gradient(to right, ${settings.chat_widget_color}, ${settings.chat_widget_color}dd)` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${settings.chat_widget_color}aa` }}>
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Live Chat Support</h3>
                  <p className="text-sm opacity-90">
                    {isWithinWorkingHours ? 'Tim kami siap membantu Anda' : 'Di luar jam kerja'}
                  </p>
                </div>
              </div>
              {!chatEnded && conversationId && (
                <button
                  onClick={handleEndChat}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
                >
                  End Chat
                </button>
              )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder={`Nomor HP ${settings.require_phone ? '*' : ''}`}
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required={settings.require_phone}
                />
              </div>

              {(settings.require_company || customerInfo.company) && (
                <div>
                  <input
                    type="text"
                    placeholder={`Nama Perusahaan ${settings.require_company ? '*' : ''}`}
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required={settings.require_company}
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  placeholder={`Email ${settings.require_email ? '*' : '(untuk menerima transkrip)'}`}
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required={settings.require_email}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                style={{ backgroundColor: settings.chat_widget_color }}
              >
                {loading ? 'Memulai...' : 'Mulai Chat'}
              </button>
            </form>
          ) : showFeedback ? (
            /* Feedback Form */
            <div className="p-4 space-y-4">
              <h4 className="font-medium text-gray-900">Berikan Rating & Feedback</h4>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Rating layanan:</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  placeholder="Feedback (opsional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                />
              </div>

              <button
                onClick={handleFeedbackSubmit}
                className="w-full text-white py-2 rounded-lg transition-colors text-sm font-medium"
                style={{ backgroundColor: settings.chat_widget_color }}
              >
                Kirim Feedback
              </button>
            </div>
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
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      style={{
                        backgroundColor: message.sender === 'user' ? settings.chat_widget_color : undefined
                      }}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.senderName || (message.sender === 'user' ? 'Anda' : 'Agent')}
                        </p>
                        <p className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              {!chatEnded && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan Anda..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      className="text-white p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: settings.chat_widget_color }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChat;
