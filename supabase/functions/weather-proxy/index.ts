
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const params = url.searchParams.get('params');
    
    if (!endpoint || !params) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint or params' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const API_KEY = "313e5b04beb744a18ace8439054363ba";
    const BASE_URL = "https://api.openweathermap.org/data/2.5";
    
    const weatherUrl = `${BASE_URL}/${endpoint}?${params}&appid=${API_KEY}`;
    
    console.log('Fetching weather data from:', weatherUrl);
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeatherMap API error:', response.status, errorText);
      
      let errorMessage = 'Failed to fetch weather data';
      if (response.status === 404) {
        errorMessage = 'City not found. Please check the spelling and try again.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your configuration.';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const data = await response.json();
    console.log('Weather data fetched successfully');
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Weather proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
