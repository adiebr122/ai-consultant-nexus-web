
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
    const requestBody = await req.json();
    const { provider, api_key, model } = requestBody;

    console.log('Testing AI connection:', { provider, model, hasApiKey: !!api_key });

    // Validate required parameters
    if (!provider) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Provider is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!api_key) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'API key is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!model) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Model is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const testMessage = "Hello, this is a test message to verify the connection.";
    let apiUrl = '';
    let headers = {};
    let requestBodyForAPI = {};

    if (provider === 'deepseek') {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      headers = {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      };
      requestBodyForAPI = {
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
      requestBodyForAPI = {
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
      requestBodyForAPI = {
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
      return new Response(JSON.stringify({ 
        success: false,
        error: `Unsupported AI provider: ${provider}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to:', apiUrl);
    console.log('Request headers:', Object.keys(headers));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBodyForAPI),
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorMessage = `API request failed: ${response.status}`;
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the raw error text
        if (errorText) {
          errorMessage = errorText.substring(0, 200); // Limit error message length
        }
      }

      return new Response(JSON.stringify({ 
        success: false,
        error: errorMessage,
        statusCode: response.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
