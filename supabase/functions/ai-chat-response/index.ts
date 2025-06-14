
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversation_id: string;
  provider: 'deepseek' | 'openai';
  api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  conversation_history?: Array<{role: string, content: string}>;
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
      conversation_history = []
    }: ChatRequest = await req.json();

    console.log('AI Chat Request:', { provider, model, conversation_id });

    let apiUrl = '';
    let headers = {};
    let requestBody = {};

    // Configure API based on provider
    if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      
      const messages = [
        { role: 'system', content: system_prompt },
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
        { role: 'system', content: system_prompt },
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
    } else {
      throw new Error('Unsupported AI provider');
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
      throw new Error(`AI API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Response received');

    const aiResponse = data.choices[0].message.content;

    // Check for handoff triggers
    const handoffTriggers = ['komplain', 'refund', 'pembatalan', 'masalah teknis', 'berbicara dengan manusia', 'customer service'];
    const shouldHandoff = handoffTriggers.some(trigger => 
      message.toLowerCase().includes(trigger) || aiResponse.toLowerCase().includes('tidak bisa membantu')
    );

    return new Response(JSON.stringify({ 
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
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Maaf, saya mengalami gangguan teknis. Mohon tunggu sebentar atau hubungi customer service kami.',
      should_handoff: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
