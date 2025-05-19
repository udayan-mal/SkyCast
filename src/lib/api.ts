
const API_KEY = "313e5b04beb744a18ace8439054363ba";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchWeatherByCity = async (city: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.");
      }
      throw new Error("Failed to fetch weather data");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching current weather by coords:", error);
    throw error;
  }
};

// The onecall API endpoint requires a paid subscription
// Using the forecast endpoint instead which is available in the free tier
export const fetchForecast = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch forecast data");
    }
    
    const data = await response.json();
    
    // Process the forecast data to get daily forecasts
    // The forecast endpoint provides data in 3-hour steps
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
const processDailyForecasts = (forecastData) => {
  const dailyMap = new Map();
  
  // Group forecast data by day
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!dailyMap.has(day)) {
      dailyMap.set(day, {
        temps: [],
        conditions: [],
        dt: item.dt,
        humidity: [],
        wind: []
      });
    }
    
    const dayData = dailyMap.get(day);
    dayData.temps.push(item.main.temp);
    dayData.conditions.push(item.weather[0].main);
    dayData.humidity.push(item.main.humidity);
    dayData.wind.push(item.wind.speed);
  });
  
  // For each day, compute min/max temps and most common condition
  const dailyForecasts = Array.from(dailyMap.entries()).map(([_, data]) => {
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
      humidity: getAverage(data.humidity),
      wind_speed: getAverage(data.wind)
    };
  });
  
  // Limit to 7 days
  return dailyForecasts.slice(0, 7);
};

// Helper function to get most frequent item in array
const getMostFrequent = (arr) => {
  const counts = {};
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
const getAverage = (arr) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
};
