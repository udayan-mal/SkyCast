
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Droplets, Wind, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedDay, setExpandedDay] = useState<number | null>(0); // Default to first day expanded
  
  const isMetric = profile.unit === 'metric';
  
  const toggleExpand = (idx: number) => {
    if (expandedDay === idx) {
      setExpandedDay(null);
    } else {
      setExpandedDay(idx);
    }
  };
  
  if (!forecast || forecast.length === 0) {
    return (
      <Card className="w-full glass-card animate-fade-in">
        <CardContent className="p-6 text-center text-muted-foreground">
          No forecast data available
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full glass-card animate-fade-in">
      <CardContent className="p-4">
        <div className="grid gap-3">
          {forecast.map((day, index) => (
            <div
              key={day.date}
              className={`rounded-lg transition-all ${
                index === 0 ? "bg-blue-100/30 dark:bg-blue-900/30" : "hover:bg-white/40 dark:hover:bg-slate-700/40"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              aria-expanded={expandedDay === index}
            >
              {/* Day header - always visible */}
              <button 
                className="w-full flex items-center justify-between p-3 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => toggleExpand(index)}
                aria-label={`Toggle ${day.day} forecast details`}
              >
                <div className="w-24 font-medium flex items-center">
                  {index === 0 ? (
                    <span className="bg-primary text-white px-2 py-0.5 text-xs rounded mr-2">Today</span>
                  ) : (
                    <span>{day.day}</span>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center gap-2">
                  <WeatherIcon 
                    condition={day.condition} 
                    className={expandedDay === index ? "animate-bounce" : ""}
                  />
                  <span className="text-sm text-muted-foreground hidden sm:inline">{day.condition}</span>
                </div>
                
                <div className="flex gap-3 items-center">
                  <div className="flex gap-1">
                    <ArrowUp className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{formatTempUnit(day.maxTemp, isMetric)}</span>
                  </div>
                  <div className="flex gap-1">
                    <ArrowDown className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">{formatTempUnit(day.minTemp, isMetric)}</span>
                  </div>
                  {expandedDay === index ? (
                    <ChevronUp className="h-5 w-5 ml-2" />
                  ) : (
                    <ChevronDown className="h-5 w-5 ml-2" />
                  )}
                </div>
              </button>
              
              {/* Expanded details */}
              {expandedDay === index && (
                <div className="p-3 pt-1 border-t animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {day.humidity && (
                    <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-slate-800/30 rounded">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Humidity</div>
                        <div className="font-medium">{day.humidity}%</div>
                      </div>
                    </div>
                  )}
                  {day.windSpeed && (
                    <div className="flex items-center gap-2 p-2 bg-white/30 dark:bg-slate-800/30 rounded">
                      <Wind className="h-5 w-5 text-teal-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Wind</div>
                        <div className="font-medium">
                          {isMetric ? day.windSpeed : (day.windSpeed * 0.621371).toFixed(1)} {isMetric ? 'km/h' : 'mph'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Temperature range chart */}
                  <div className="col-span-1 sm:col-span-2 pt-2">
                    <div className="text-xs text-muted-foreground mb-1">Temperature Range</div>
                    <div className="relative h-6 rounded-full bg-gradient-to-r from-blue-500 to-red-500 overflow-hidden">
                      <div 
                        className="absolute top-0 h-full bg-gradient-to-r from-blue-200 to-blue-500"
                        style={{ 
                          width: `${((day.minTemp - forecast.reduce((min, d) => Math.min(min, d.minTemp), Infinity)) / 
                            (forecast.reduce((max, d) => Math.max(max, d.maxTemp), -Infinity) - 
                            forecast.reduce((min, d) => Math.min(min, d.minTemp), Infinity))) * 100}%`,
                          opacity: 0.7
                        }}
                      ></div>
                      <div className="absolute top-0 right-0 h-full flex items-center justify-end px-2">
                        <span className="text-xs text-white font-medium">
                          {formatTempUnit(day.maxTemp, isMetric)}
                        </span>
                      </div>
                      <div className="absolute top-0 left-0 h-full flex items-center px-2">
                        <span className="text-xs text-white font-medium">
                          {formatTempUnit(day.minTemp, isMetric)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
