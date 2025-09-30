
import { useEffect } from "react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { getWeatherBackground } from "@/lib/utils";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { GeolocationAlert } from "@/components/GeolocationAlert";
import { LoadingState } from "@/components/LoadingState";
import { WeatherContent } from "@/components/WeatherContent";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavoriteLocations } from "@/components/FavoriteLocations";
import { LastUpdated } from "@/components/LastUpdated";

const Index = () => {
  const isDarkMode = useThemeEffect();
  const { profile } = useWeatherProfile();
  const { addToHistory } = useSearchHistory();
  const {
    loading,
    currentWeather,
    forecast,
    geoError,
    lastFetch,
    fetchWeatherForCity,
    fetchWeatherForLocation,
    refreshWeatherData
  } = useWeatherData();

  // Load default city if available
  useEffect(() => {
    if (profile.default_city && !currentWeather) {
      fetchWeatherForCity(profile.default_city);
    }
  }, [profile.default_city, currentWeather]);

  const handleSearch = async (city: string) => {
    fetchWeatherForCity(city);
    addToHistory(city);
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
        <Header onUnitChange={refreshWeatherData} />

  <SearchBar onSearch={handleSearch} onUseCurrentLocation={fetchWeatherForLocation} />

        <GeolocationAlert error={geoError} />

        <main className="mt-8 space-y-6">
          {loading ? (
            <LoadingState />
          ) : currentWeather ? (
            <>
              {lastFetch > 0 && (
                <LastUpdated timestamp={lastFetch} />
              )}
              <WeatherContent 
                currentWeather={currentWeather} 
                forecast={forecast} 
              />
            </>
          ) : (
            <>
              <EmptyState 
                onGetLocation={fetchWeatherForLocation} 
                onSearch={handleSearch}
              />
              <FavoriteLocations onLocationSelect={handleSearch} />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
