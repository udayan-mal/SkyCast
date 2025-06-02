
import CurrentWeather from "@/components/CurrentWeather";
import { ForecastSection } from "@/components/ForecastSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPreferences from "@/components/UserPreferences";

interface WeatherContentProps {
  currentWeather: any;
  forecast: any[];
}

export const WeatherContent = ({ currentWeather, forecast }: WeatherContentProps) => {
  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <CurrentWeather data={currentWeather} />
      
      {/* 7-Day Forecast displayed below current weather */}
      <ForecastSection forecast={forecast} />
      
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
  );
};
