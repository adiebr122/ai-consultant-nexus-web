
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversation_id: string;
  provider: 'deepseek' | 'openai' | 'gemini';
  api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  conversation_history?: Array<{role: string, content: string}>;
  knowledge_base?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversation_id, 
      provider, 
      api_key, 
      model, 
      temperature, 
      max_tokens, 
      system_prompt,
      conversation_history = [],
      knowledge_base = ''
    }: ChatRequest = await req.json();

    console.log('AI Chat Request:', { provider, model, conversation_id });

    // Validate required parameters
    if (!message || !provider || !api_key || !model) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required parameters: message, provider, api_key, or model',
        response: 'Maaf, terjadi kesalahan dalam konfigurasi. Mohon periksa pengaturan AI.',
        should_handoff: true
      }), {
        status: 200, // Return 200 to avoid non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let apiUrl = '';
    let headers = {};
    let requestBody = {};

    // Enhance system prompt with knowledge base
    const enhancedSystemPrompt = knowledge_base 
      ? `${system_prompt}\n\nKnowledge Base:\n${knowledge_base}\n\nGunakan informasi dari knowledge base di atas untuk menjawab pertanyaan dengan lebih akurat dan spesifik.`
      : system_prompt;

    // Configure API based on provider
    if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      
      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversation_history,
        { role: 'user', content: message }
      ];

      requestBody = {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      };
    } else if (provider === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      
      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversation_history,
        { role: 'user', content: message }
      ];

      requestBody = {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: false
      };
    } else if (provider === 'gemini') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`;
      headers = {
        'Content-Type': 'application/json',
      };

      // Build conversation context for Gemini
      let contextText = enhancedSystemPrompt;
      if (conversation_history.length > 0) {
        contextText += '\n\nPrevious conversation:\n';
        conversation_history.forEach(msg => {
          contextText += `${msg.role}: ${msg.content}\n`;
        });
      }
      contextText += `\nuser: ${message}\nassistant:`;

      requestBody = {
        contents: [
          {
            parts: [
              {
                text: contextText
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: max_tokens
        }
      };
    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: `Unsupported AI provider: ${provider}`,
        response: 'Maaf, provider AI tidak didukung.',
        should_handoff: true
      }), {
        status: 200, // Return 200 to avoid non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      
      // Return error but with 200 status and fallback response
      return new Response(JSON.stringify({ 
        success: false,
        error: `AI API request failed: ${response.status}`,
        response: 'Maaf, saya mengalami gangguan teknis. Mohon tunggu sebentar atau hubungi customer service kami.',
        should_handoff: true,
        conversation_id: conversation_id
      }), {
        status: 200, // Return 200 to avoid non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('AI Response received');

    let aiResponse = '';
    if (provider === 'gemini') {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
    } else {
      aiResponse = data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
    }

    // Check for handoff triggers
    const handoffTriggers = ['komplain', 'refund', 'pembatalan', 'masalah teknis', 'berbicara dengan manusia', 'customer service'];
    const shouldHandoff = handoffTriggers.some(trigger => 
      message.toLowerCase().includes(trigger) || aiResponse.toLowerCase().includes('tidak bisa membantu')
    );

    return new Response(JSON.stringify({ 
      success: true,
      response: aiResponse,
      should_handoff: shouldHandoff,
      provider: provider,
      model: model,
      conversation_id: conversation_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-response function:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Always return 200 status with error details in body
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      response: 'Maaf, saya mengalami gangguan teknis. Mohon tunggu sebentar atau hubungi customer service kami.',
      should_handoff: true
    }), {
      status: 200, // Always return 200 to avoid non-2xx error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
