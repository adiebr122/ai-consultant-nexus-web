
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, api_key, model } = await req.json();

    console.log('Testing AI connection:', { provider, model });

    if (!api_key || !provider || !model) {
      throw new Error('Missing required parameters: provider, api_key, and model are required');
    }

    const testMessage = "Hello, this is a test message to verify the connection.";
    let apiUrl = '';
    let headers = {};
    let requestBody = {};

    if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: testMessage }
        ],
        temperature: 0.7,
        max_tokens: 50
      };
    } else if (provider === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: testMessage }
        ],
        temperature: 0.7,
        max_tokens: 50
      };
    } else if (provider === 'gemini') {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`;
      headers = {
        'Content-Type': 'application/json',
      };
      requestBody = {
        contents: [
          {
            parts: [
              {
                text: testMessage
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        }
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
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response received successfully');
    
    let responseText = '';
    if (provider === 'gemini') {
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Test successful';
    } else {
      responseText = data.choices?.[0]?.message?.content || 'Test successful';
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      response: responseText,
      provider: provider,
      model: model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing AI connection:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
