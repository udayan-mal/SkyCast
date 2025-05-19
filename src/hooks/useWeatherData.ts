
import { useState } from "react";
import { toast } from "sonner";
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecast } from "@/lib/api";
import { getDayOfWeek } from "@/lib/utils";

export const useWeatherData = () => {
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  const fetchWeatherForCity = async (city: string) => {
    setLoading(true);
    setGeoError(null);
    try {
      const weatherData = await fetchWeatherByCity(city);
      
      const { lat, lon } = weatherData.coord;
      const forecastData = await fetchForecast(lat, lon);
      
      setCurrentWeather({
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        condition: weatherData.weather[0].main,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        date: weatherData.dt
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
          windSpeed: day.wind_speed
        }))
      );

      // Show the forecast section after successful data load
      setShowForecast(true);
      
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch weather data");
      
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setGeoError(null);
      
      // Add a timeout to handle geolocation hanging
      const geoTimeout = setTimeout(() => {
        setLoading(false);
        setGeoError("Geolocation request timed out. Please try again or search manually.");
        toast.error("Location request timed out");
      }, 10000);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(geoTimeout);
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await fetchWeatherByCoords(latitude, longitude);
            
            const forecastData = await fetchForecast(latitude, longitude);
            
            setCurrentWeather({
              city: weatherData.name,
              country: weatherData.sys.country,
              temperature: weatherData.main.temp,
              feelsLike: weatherData.main.feels_like,
              humidity: weatherData.main.humidity,
              windSpeed: weatherData.wind.speed,
              condition: weatherData.weather[0].main,
              sunrise: weatherData.sys.sunrise,
              sunset: weatherData.sys.sunset,
              date: weatherData.dt
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
                windSpeed: day.wind_speed
              }))
            );
            
            // Show the forecast section after successful data load
            setShowForecast(true);
            
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
          
          let errorMessage = "Failed to get your location.";
          if (error.code === 1) {
            errorMessage += " Please allow location access or search manually.";
          } else if (error.code === 2) {
            errorMessage += " Your position is unavailable. Please try again or search manually.";
          } else {
            errorMessage += " Please try again or search manually.";
          }
          
          setGeoError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
        },
        { 
          enableHighAccuracy: false, // Less accurate but faster and less power-consuming
          timeout: 8000, 
          maximumAge: 60000 // Allow cached position up to 1 minute old
        }
      );
    } else {
      setGeoError("Geolocation is not supported by your browser. Please search manually.");
      toast.error("Geolocation is not supported by your browser");
    }
  };

  return {
    loading,
    currentWeather,
    forecast,
    geoError,
    showForecast,
    fetchWeatherForCity,
    fetchWeatherForLocation,
    setGeoError
  };
};
