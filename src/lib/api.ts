
import { toast } from "sonner";

const API_KEY = "313e5b04beb744a18ace8439054363ba";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

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

export const fetchWeatherByCity = async (city: string, unit: string = 'metric') => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${unit}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.");
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Please check your configuration.");
      } else if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error(`Failed to fetch weather data (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Weather data fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number, unit: string = 'metric') => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your configuration.");
      } else if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error(`Failed to fetch weather data (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Weather data by coordinates fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather by coords:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
  }
};

export const fetchForecast = async (lat: number, lon: number, unit: string = 'metric') => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key for forecast data.");
      } else if (response.status === 429) {
        throw new Error("Too many forecast requests. Please try again later.");
      }
      throw new Error(`Failed to fetch forecast data (${response.status})`);
    }
    
    const data = await response.json();
    console.log('Forecast data fetched:', data);
    
    // Process the forecast data to get daily forecasts
    const dailyForecasts = processDailyForecasts(data);
    
    return {
      daily: dailyForecasts
    };
  } catch (error) {
    console.error("Error fetching forecast:", error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error while fetching forecast. Please check your internet connection.');
    }
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
