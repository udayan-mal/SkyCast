
import { useState } from "react";
import { toast } from "sonner";
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecast, fetchLocationByIP } from "@/lib/api";
import { getDayOfWeek } from "@/lib/utils";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";

export const useWeatherData = () => {
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [forecastProvider, setForecastProvider] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { profile } = useWeatherProfile();

  const normalizeWindSpeed = (speed: number | null | undefined) => {
    if (speed === null || speed === undefined) return null;
    const value = profile.unit === 'metric' ? speed * 3.6 : speed;
    return Math.round(value * 10) / 10;
  };

  const normalizePrecipitation = (pop: number | null | undefined) => {
    if (pop === null || pop === undefined) return 0;
    return pop <= 1 ? Math.round(pop * 100) : Math.round(pop);
  };

  const fetchWeatherForCity = async (city: string) => {
    setLoading(true);
    setGeoError(null);
    
    try {
      console.log('Fetching weather for city:', city, 'with unit:', profile.unit);
      const weatherData = await fetchWeatherByCity(city, profile.unit);
      
      const { lat, lon } = weatherData.coord;
      const forecastData = await fetchForecast(lat, lon, profile.unit);

      if (forecastProvider !== forecastData.provider) {
        setForecastProvider(forecastData.provider);
        if (forecastData.provider === 'openmeteo') {
          toast.info('Using fallback forecast data (Open-Meteo).');
        }
      }
      
      setCurrentWeather({
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: normalizeWindSpeed(weatherData.wind.speed) ?? 0,
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        date: weatherData.dt,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility / 1000, // Convert to km
        unit: profile.unit
      });
      
      // Process daily forecast data
      setForecast(
        forecastData.daily.map((day: any) => ({
          date: day.dt,
          day: getDayOfWeek(day.dt),
          minTemp: day.temp.min,
          maxTemp: day.temp.max,
          condition: day.weather[0].main,
          humidity: day.humidity,
          windSpeed: normalizeWindSpeed(day.wind_speed) ?? undefined,
          precipitation: normalizePrecipitation(day.pop)
        }))
      );

      setLastFetch(Date.now());
      
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch weather data");
      
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForLocation = async () => {
    console.log('Attempting to get user location...');
    
    if ("geolocation" in navigator) {
      setLoading(true);
      setGeoError(null);
      
      // Add a timeout to handle geolocation hanging
      const geoTimeout = setTimeout(() => {
        console.log('Geolocation timeout, trying IP fallback');
        handleGeolocationFallback();
      }, 8000); // Reduced timeout to 8 seconds
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(geoTimeout);
          try {
            const { latitude, longitude } = position.coords;
            console.log('Got geolocation:', latitude, longitude);
            
            const weatherData = await fetchWeatherByCoords(latitude, longitude, profile.unit);
            const forecastData = await fetchForecast(latitude, longitude, profile.unit);

            if (forecastProvider !== forecastData.provider) {
              setForecastProvider(forecastData.provider);
              if (forecastData.provider === 'openmeteo') {
                toast.info('Using fallback forecast data (Open-Meteo).');
              }
            }
            
            setCurrentWeather({
              city: weatherData.name,
              country: weatherData.sys.country,
              temperature: weatherData.main.temp,
              feelsLike: weatherData.main.feels_like,
              humidity: weatherData.main.humidity,
              windSpeed: normalizeWindSpeed(weatherData.wind.speed) ?? 0,
              condition: weatherData.weather[0].main,
              description: weatherData.weather[0].description,
              sunrise: weatherData.sys.sunrise,
              sunset: weatherData.sys.sunset,
              date: weatherData.dt,
              pressure: weatherData.main.pressure,
              visibility: weatherData.visibility / 1000,
              unit: profile.unit
            });
            
            // Process daily forecast data
            setForecast(
              forecastData.daily.map((day: any) => ({
                date: day.dt,
                day: getDayOfWeek(day.dt),
                minTemp: day.temp.min,
                maxTemp: day.temp.max,
                condition: day.weather[0].main,
                humidity: day.humidity,
                windSpeed: normalizeWindSpeed(day.wind_speed) ?? undefined,
                precipitation: normalizePrecipitation(day.pop)
              }))
            );
            
            setLastFetch(Date.now());
            toast.success(`Weather loaded for ${weatherData.name}`);
            
          } catch (error) {
            console.error("Error fetching weather by location:", error);
            toast.error("Failed to fetch weather data for your location");
            handleGeolocationFallback();
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          clearTimeout(geoTimeout);
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to access your location. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          
          setGeoError(errorMessage);
          handleGeolocationFallback();
        },
        { 
          enableHighAccuracy: false,
          timeout: 6000, 
          maximumAge: 60000
        }
      );
    } else {
      console.log('Geolocation not supported, using IP fallback');
      handleGeolocationFallback();
    }
  };

  const handleGeolocationFallback = async () => {
    console.log('Trying IP-based location fallback');
    try {
      setLoading(true);
      const ipLocation = await fetchLocationByIP();
      console.log('IP location:', ipLocation);
      
      if (ipLocation.city) {
        await fetchWeatherForCity(ipLocation.city);
        toast.info(`Using your approximate location: ${ipLocation.city}`);
      } else {
        throw new Error('Could not determine city from IP');
      }
    } catch (error) {
      console.error('IP geolocation fallback failed:', error);
      setGeoError("Unable to detect your location automatically. Please search for your city manually.");
      toast.error("Please search for your city manually or enable location permissions.");
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh weather data with current unit
  const refreshWeatherData = async () => {
    if (currentWeather && currentWeather.city) {
      await fetchWeatherForCity(currentWeather.city);
    }
  };

  return {
    loading,
    currentWeather,
    forecast,
    geoError,
    lastFetch,
    fetchWeatherForCity,
    fetchWeatherForLocation,
    refreshWeatherData,
    setGeoError,
    forecastProvider,
  };
};
