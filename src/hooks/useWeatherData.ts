
import { useState } from "react";
import { toast } from "sonner";
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecast, fetchLocationByIP } from "@/lib/api";
import { getDayOfWeek } from "@/lib/utils";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";

export const useWeatherData = () => {
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { profile } = useWeatherProfile();

  const fetchWeatherForCity = async (city: string) => {
    setLoading(true);
    setGeoError(null);
    
    try {
      console.log('Fetching weather for city:', city, 'with unit:', profile.unit);
      const weatherData = await fetchWeatherByCity(city, profile.unit);
      
      const { lat, lon } = weatherData.coord;
      const forecastData = await fetchForecast(lat, lon, profile.unit);
      
      setCurrentWeather({
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
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
          windSpeed: day.wind_speed,
          precipitation: day.pop || 0
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
    if ("geolocation" in navigator) {
      setLoading(true);
      setGeoError(null);
      
      // Add a timeout to handle geolocation hanging
      const geoTimeout = setTimeout(() => {
        console.log('Geolocation timeout, trying IP fallback');
        handleGeolocationFallback();
      }, 10000);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(geoTimeout);
          try {
            const { latitude, longitude } = position.coords;
            console.log('Got geolocation:', latitude, longitude);
            
            const weatherData = await fetchWeatherByCoords(latitude, longitude, profile.unit);
            const forecastData = await fetchForecast(latitude, longitude, profile.unit);
            
            setCurrentWeather({
              city: weatherData.name,
              country: weatherData.sys.country,
              temperature: weatherData.main.temp,
              feelsLike: weatherData.main.feels_like,
              humidity: weatherData.main.humidity,
              windSpeed: weatherData.wind.speed,
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
                windSpeed: day.wind_speed,
                precipitation: day.pop || 0
              }))
            );
            
            setLastFetch(Date.now());
            
          } catch (error) {
            console.error("Error fetching weather by location:", error);
            toast.error("Failed to fetch weather data for your location");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          clearTimeout(geoTimeout);
          console.error("Geolocation error:", error);
          handleGeolocationFallback();
        },
        { 
          enableHighAccuracy: false,
          timeout: 8000, 
          maximumAge: 60000
        }
      );
    } else {
      handleGeolocationFallback();
    }
  };

  const handleGeolocationFallback = async () => {
    console.log('Trying IP-based location fallback');
    try {
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
    setGeoError
  };
};
