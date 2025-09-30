
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

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0";
type ForecastProvider = 'openweather' | 'openmeteo';
const DEFAULT_OPENWEATHER_API_KEY = "313e5b04beb744a18ace8439054363ba";
const ENV_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim();
const OPENWEATHER_API_KEY = ENV_API_KEY && ENV_API_KEY.length > 0
  ? ENV_API_KEY
  : DEFAULT_OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  console.error("Missing OpenWeather API key. Set VITE_OPENWEATHER_API_KEY in your environment.");
}

type WeatherApiError = Error & { status?: number; details?: unknown };
type ForecastResponse = { daily: any[]; provider: ForecastProvider };

const callWeatherApi = async (endpoint: string, params: Record<string, string | number>) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured.');
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    searchParams.set('appid', OPENWEATHER_API_KEY);

    const url = `${OPENWEATHER_BASE_URL}/${endpoint}?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenWeather error:', response.status, errorText);
      const errorMessage = response.status === 401
        ? 'Missing or invalid OpenWeather API key. Add VITE_OPENWEATHER_API_KEY to your .env file.'
        : 'Failed to fetch weather data';
      const error: WeatherApiError = new Error(errorMessage);
      error.status = response.status;
      try {
        error.details = JSON.parse(errorText);
      } catch {
        error.details = errorText;
      }
      throw error;
    }

    const data = await response.json();

    if (data && (data.cod && Number(data.cod) !== 200) && data.message) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Weather API call failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your internet connection.');
  }
};

export interface CitySuggestion {
  id: string;
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

const citySuggestionCache = new Map<string, CitySuggestion[]>();

export const fetchCitySuggestions = async (query: string, limit: number = 7): Promise<CitySuggestion[]> => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const normalizedKey = `${trimmed.toLowerCase()}::${limit}`;
  const cached = citySuggestionCache.get(normalizedKey);
  if (cached) {
    return cached;
  }

  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeather API key is not configured.');
  }

  const params = new URLSearchParams({
    q: trimmed,
    limit: String(limit),
    appid: OPENWEATHER_API_KEY,
  });

  const response = await fetch(`${OPENWEATHER_GEO_BASE_URL}/direct?${params.toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenWeather geocoding error:', response.status, errorText);
    throw new Error('Failed to fetch city suggestions');
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  const suggestions: CitySuggestion[] = data
    .filter((item: any) => item && item.name && item.lat != null && item.lon != null)
    .map((item: any, index: number) => ({
      id: `${item.lat},${item.lon},${index}`,
      name: item.name,
      state: item.state ?? undefined,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }));

  citySuggestionCache.set(normalizedKey, suggestions);
  return suggestions;
};

export const fetchWeatherByCity = async (city: string, unit: string = 'metric') => {
  try {
    const data = await callWeatherApi('weather', {
      q: city,
      units: unit,
    });
    
    console.log('Weather data fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat: number, lon: number, unit: string = 'metric') => {
  try {
    const data = await callWeatherApi('weather', {
      lat,
      lon,
      units: unit,
    });
    
    console.log('Weather data by coordinates fetched:', data);
    return data;
  } catch (error) {
    console.error("Error fetching current weather by coords:", error);
    throw error;
  }
};

const mapOpenMeteoWeatherCode = (code: number): string => {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Clouds';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Clouds';
};

const fetchForecastFromOpenMeteo = async (lat: number, lon: number, unit: string): Promise<ForecastResponse> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,wind_speed_10m_max,precipitation_probability_max,relative_humidity_2m_max',
    timezone: 'auto',
  });

  if (unit === 'imperial') {
    params.set('temperature_unit', 'fahrenheit');
    params.set('wind_speed_unit', 'mph');
  } else {
    params.set('temperature_unit', 'celsius');
    params.set('wind_speed_unit', 'kmh');
  }

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Open-Meteo error:', response.status, errorText);
    throw new Error('Failed to fetch fallback forecast data');
  }

  const data = await response.json();

  if (!data?.daily?.time) {
    throw new Error('Unexpected Open-Meteo forecast format');
  }

  const daily = data.daily.time.map((date: string, index: number) => {
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    const rawWind = data.daily.wind_speed_10m_max?.[index] ?? null;
    const windSpeed = rawWind == null ? null : unit === 'metric' ? rawWind / 3.6 : rawWind; // convert km/h -> m/s for metric
    const precipitationProb = data.daily.precipitation_probability_max?.[index] ?? null;
    return {
      dt: timestamp,
      temp: {
        min: data.daily.temperature_2m_min[index],
        max: data.daily.temperature_2m_max[index],
      },
      weather: [
        {
          main: mapOpenMeteoWeatherCode(data.daily.weathercode[index]),
        },
      ],
      humidity: data.daily.relative_humidity_2m_max?.[index] ?? null,
      wind_speed: windSpeed,
      pop: precipitationProb == null ? null : precipitationProb / 100,
    };
  });

  return { daily: daily.slice(0, 7), provider: 'openmeteo' };
};

export const fetchForecast = async (lat: number, lon: number, unit: string = 'metric'): Promise<ForecastResponse> => {
  try {
    const data = await callWeatherApi('onecall', {
      lat,
      lon,
      units: unit,
      exclude: 'current,minutely,hourly,alerts',
    });

    if (!data?.daily || !Array.isArray(data.daily)) {
      throw new Error('Unexpected forecast response format');
    }

    console.log('Forecast data fetched via OpenWeather One Call');

    return {
      daily: data.daily.slice(0, 7),
      provider: 'openweather',
    };
  } catch (error) {
    const status = (error as WeatherApiError)?.status;
    console.warn('OpenWeather One Call failed, attempting Open-Meteo fallback', error);

    if (status && status !== 401 && status !== 403) {
      throw error;
    }

    try {
  const fallbackData = await fetchForecastFromOpenMeteo(lat, lon, unit);
  console.info('Forecast data fetched via Open-Meteo fallback');
  return fallbackData;
    } catch (fallbackError) {
      console.error('Fallback forecast fetch failed:', fallbackError);
      throw fallbackError;
    }
  }
};
