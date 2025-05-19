
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Droplets, Wind } from "lucide-react";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";
import { formatTempUnit } from "@/lib/utils";

interface DailyForecastProps {
  forecast: Array<{
    date: number;
    day: string;
    minTemp: number;
    maxTemp: number;
    condition: string;
    humidity?: number;
    windSpeed?: number;
  }>;
}

export default function DailyForecast({ forecast }: DailyForecastProps) {
  const { profile } = useWeatherProfile();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  
  const isMetric = profile.unit === 'metric';
  
  const toggleExpand = (idx: number) => {
    if (expandedDay === idx) {
      setExpandedDay(null);
    } else {
      setExpandedDay(idx);
    }
  };
  
  return (
    <Card className="w-full glass-card animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {forecast.map((day, index) => (
            <div
              key={day.date}
              className={`flex flex-col p-2 rounded-md hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all cursor-pointer ${
                index !== forecast.length - 1 ? "border-b" : ""
              } ${index === 0 ? "bg-blue-100/30 dark:bg-blue-900/30" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center justify-between">
                <div className="w-24 font-medium">
                  {index === 0 ? "Today" : day.day}
                </div>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <WeatherIcon 
                    condition={day.condition} 
                    className={expandedDay === index ? "animate-bounce" : ""}
                  />
                  <span className="text-sm text-muted-foreground">{day.condition}</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium">{formatTempUnit(day.maxTemp, isMetric)}</span>
                  <span className="text-muted-foreground">{formatTempUnit(day.minTemp, isMetric)}</span>
                </div>
              </div>
              
              {/* Expanded details */}
              {expandedDay === index && (
                <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t animate-fade-in">
                  {day.humidity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>Humidity: {day.humidity}%</span>
                    </div>
                  )}
                  {day.windSpeed && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-4 w-4 text-teal-500" />
                      <span>Wind: {isMetric ? day.windSpeed : (day.windSpeed * 0.621371).toFixed(1)} {isMetric ? 'km/h' : 'mph'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
