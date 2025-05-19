
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import DailyForecast from "@/components/DailyForecast";
import EmptyState from "@/components/EmptyState";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecast } from "@/lib/api";
import { getDayOfWeek, getWeatherBackground } from "@/lib/utils";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>("searchHistory", []);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    return () => observer.disconnect();
  }, []);

  const addToHistory = (city: string) => {
    if (!searchHistory.includes(city)) {
      const newHistory = [city, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
    } else {
      // Move the city to the top of the history
      const newHistory = [city, ...searchHistory.filter(item => item !== city)].slice(0, 5);
      setSearchHistory(newHistory);
    }
  };

  const handleSearch = async (city: string) => {
    setLoading(true);
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
      
      // Process 7-day forecast
      setForecast(
        forecastData.daily.slice(0, 7).map((day: any) => ({
          date: day.dt,
          day: getDayOfWeek(day.dt),
          minTemp: day.temp.min,
          maxTemp: day.temp.max,
          condition: day.weather[0].main
        }))
      );
      
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch weather data");
      
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await fetchWeatherByCoords(latitude, longitude);
            
            // Add city to search history
            if (weatherData.name) {
              addToHistory(weatherData.name);
            }
            
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
            
            // Process 7-day forecast
            setForecast(
              forecastData.daily.slice(0, 7).map((day: any) => ({
                date: day.dt,
                day: getDayOfWeek(day.dt),
                minTemp: day.temp.min,
                maxTemp: day.temp.max,
                condition: day.weather[0].main
              }))
            );
            
          } catch (error) {
            console.error("Error fetching weather by location:", error);
            toast.error("Failed to fetch weather data for your location");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to get your location. Please allow location access or search manually.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  // Set background based on current weather condition
  const pageBackground = currentWeather
    ? getWeatherBackground(currentWeather.condition, isDarkMode)
    : isDarkMode
    ? "bg-gradient-to-b from-slate-900 to-slate-800"
    : "bg-gradient-to-b from-blue-200 to-blue-100";

  return (
    <div className={`min-h-screen transition-colors duration-500 weather-pattern ${pageBackground}`}>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-8">
          <Logo />
          <ThemeToggle />
        </header>

        <SearchBar 
          onSearch={handleSearch} 
          searchHistory={searchHistory}
          addToHistory={addToHistory}
        />

        <main className="mt-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground">Fetching weather data...</p>
            </div>
          ) : currentWeather ? (
            <>
              <CurrentWeather data={currentWeather} />
              <DailyForecast forecast={forecast} />
            </>
          ) : (
            <EmptyState onGetLocation={handleGetLocation} />
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>SkyView Weather App © {new Date().getFullYear()}</p>
          <p className="mt-1">Powered by OpenWeatherMap</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
