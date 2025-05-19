
import { Card, CardContent } from "@/components/ui/card";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Wind, Droplets, Thermometer, Sunrise, Sunset } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate, formatTempUnit } from "@/lib/utils";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";

interface CurrentWeatherProps {
  data: {
    city: string;
    country: string;
    temperature: number;
    condition: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    sunrise: number;
    sunset: number;
    date: number;
  };
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  const [mounted, setMounted] = useState(false);
  const { profile } = useWeatherProfile();
  const isMetric = profile.unit === "metric";
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setMounted(false), 100);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <Card className={`w-full glass-card transition-all duration-300 overflow-hidden ${mounted ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-primary">
                {data.city}, {data.country}
              </h2>
              <p className="text-muted-foreground">
                {formatDate(new Date(data.date * 1000))}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <WeatherIcon condition={data.condition} size={64} className="animate-float" />
              <div>
                <div className="text-5xl font-bold">
                  {formatTempUnit(data.temperature, isMetric)}
                </div>
                <div className="text-lg text-muted-foreground">{data.condition}</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Feels like</div>
                <div className="font-medium">
                  {formatTempUnit(data.feelsLike, isMetric)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Droplets className="text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="font-medium">{data.humidity}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Wind className="text-teal-500" />
              <div>
                <div className="text-sm text-muted-foreground">Wind</div>
                <div className="font-medium">
                  {isMetric ? data.windSpeed : (data.windSpeed * 0.621371).toFixed(1)} {isMetric ? 'km/h' : 'mph'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Sunrise className="text-amber-500" />
              <div>
                <div className="text-sm text-muted-foreground">Sunrise</div>
                <div className="font-medium">
                  {new Date(data.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Sunset className="text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Sunset</div>
                <div className="font-medium">
                  {new Date(data.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
