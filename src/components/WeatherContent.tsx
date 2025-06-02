
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrentWeather from "@/components/CurrentWeather";
import { ForecastSection } from "@/components/ForecastSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserPreferences from "@/components/UserPreferences";

interface WeatherContentProps {
  currentWeather: any;
  forecast: any[];
}

export const WeatherContent = ({ currentWeather, forecast }: WeatherContentProps) => {
  const handleBack = () => {
    window.location.reload(); // Simple back functionality
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBack}
        className="mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        New Search
      </Button>

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
