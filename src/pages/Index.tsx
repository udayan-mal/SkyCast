
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import DailyForecast from "@/components/DailyForecast";
import UserPreferences from "@/components/UserPreferences";
import EmptyState from "@/components/EmptyState";
import UnitToggle from "@/components/UnitToggle";
import { fetchWeatherByCity, fetchWeatherByCoords, fetchForecast } from "@/lib/api";
import { getDayOfWeek, getWeatherBackground } from "@/lib/utils";
import { Loader, UserRound, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const { profile } = useWeatherProfile();
  const { user } = useAuth();

  // Set initial theme based on profile
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (profile.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (profile.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, [profile.theme]);

  // Monitor dark mode changes
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

  // Load default city if available
  useEffect(() => {
    if (profile.default_city && !currentWeather) {
      handleSearch(profile.default_city);
    }
  }, [profile.default_city]);

  const handleSearch = async (city: string) => {
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

  const handleGetLocation = () => {
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
          <div className="flex items-center gap-2">
            <UnitToggle />
            <ThemeToggle />
            {!user ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">
                  <UserRound className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <UserRound className="h-4 w-4 mr-2" />
                {user.email?.split('@')[0]}
              </Button>
            )}
          </div>
        </header>

        <SearchBar onSearch={handleSearch} />

        {geoError && (
          <Alert className="my-4 bg-amber-50 dark:bg-amber-950/40 border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription>{geoError}</AlertDescription>
          </Alert>
        )}

        <main className="mt-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-12 h-12 text-primary animate-spin" />
              <p className="mt-4 text-muted-foreground">Fetching weather data...</p>
            </div>
          ) : currentWeather ? (
            <div className="space-y-6">
              {/* Current Weather */}
              <CurrentWeather data={currentWeather} />
              
              {/* 7-Day Forecast displayed below current weather */}
              <h2 className="text-2xl font-semibold mt-8 mb-4">7-Day Forecast</h2>
              <DailyForecast forecast={forecast} />
              
              {/* User Preferences are now in a separate tab */}
              <Tabs defaultValue="preferences" className="mt-8">
                <TabsList className="glass-card w-full justify-start">
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                <TabsContent value="preferences" className="mt-4">
                  <UserPreferences />
                </TabsContent>
              </Tabs>
            </div>
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
}

export default Index;
