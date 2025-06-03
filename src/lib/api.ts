
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Fallback geolocation using IP
export const fetchLocationByIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP geolocation failed');
    const data = await response.json();
    return {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country
    };
  } catch (error) {
    console.error('IP geolocation error:', error);
    throw new Error('Unable to determine location automatically');
  }
};

// Use Supabase Edge Function as proxy for OpenWeatherMap API
const callWeatherProxy = async (endpoint: string, params: string) => {
  try {
    // Use the supabase.functions.invoke with proper URL
    const url = `https://xhztnomgjzvzmapdflgt.supabase.co/functions/v1/weather-proxy?endpoint=${endpoint}&params=${encodeURIComponent(params)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'apikey': supabase.supabaseKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', response.status, errorText);
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    if (data && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Weather proxy call failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your internet connection.');
  }
};

export const fetchWeatherByCity = async (city: string, unit: string = 'metric') => {
  try {
    const params = `q=${encodeURIComponent(city)}&units=${unit}`;
    const data = await callWeatherProxy('weather', params);
    
    console.log('Weather data fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number, unit: string = 'metric') => {
  try {
    const params = `lat=${lat}&lon=${lon}&units=${unit}`;
    const data = await callWeatherProxy('weather', params);
    
    console.log('Weather data by coordinates fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather by coords:", error);
    throw error;
  }
};

export const fetchForecast = async (lat: number, lon: number, unit: string = 'metric') => {
  try {
    const params = `lat=${lat}&lon=${lon}&units=${unit}`;
    const data = await callWeatherProxy('forecast', params);
    
    console.log('Forecast data fetched:', data);
    
    // Process the forecast data to get daily forecasts
    const dailyForecasts = processDailyForecasts(data);
    
    return {
      daily: dailyForecasts
    };
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
};

// Helper function to process forecast data into daily forecasts
const processDailyForecasts = (forecastData: any) => {
  const dailyMap = new Map();
  
  // Group forecast data by day
  forecastData.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!dailyMap.has(day)) {
      dailyMap.set(day, {
        temps: [],
        conditions: [],
        dt: item.dt,
        humidity: [],
        wind: [],
        precipitation: []
      });
    }
    
    const dayData = dailyMap.get(day);
    dayData.temps.push(item.main.temp);
    dayData.conditions.push(item.weather[0].main);
    dayData.humidity.push(item.main.humidity);
    dayData.wind.push(item.wind.speed);
    dayData.precipitation.push(item.pop || 0); // Probability of precipitation
  });
  
  // For each day, compute min/max temps and most common condition
  const dailyForecasts = Array.from(dailyMap.entries()).map(([_, data]: [string, any]) => {
    return {
      dt: data.dt,
      temp: {
        min: Math.min(...data.temps),
        max: Math.max(...data.temps)
      },
      weather: [
        {
          main: getMostFrequent(data.conditions)
        }
      ],
      humidity: Math.round(getAverage(data.humidity)),
      wind_speed: getAverage(data.wind),
      pop: Math.round(getAverage(data.precipitation) * 100) // Convert to percentage
    };
  });
  
  // Limit to 7 days
  return dailyForecasts.slice(0, 7);
};

// Helper function to get most frequent item in array
const getMostFrequent = (arr: any[]) => {
  const counts: { [key: string]: number } = {};
  let maxItem = arr[0];
  let maxCount = 1;
  
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxItem = item;
      maxCount = counts[item];
    }
  }
  
  return maxItem;
};

// Helper function to get average of array
const getAverage = (arr: number[]) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};
