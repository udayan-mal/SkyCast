
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherIcon } from "@/components/WeatherIcon";

interface DailyForecastProps {
  forecast: Array<{
    date: number;
    day: string;
    minTemp: number;
    maxTemp: number;
    condition: string;
  }>;
}

export default function DailyForecast({ forecast }: DailyForecastProps) {
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
              className={`flex items-center justify-between p-2 rounded-md hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors ${
                index !== forecast.length - 1 ? "border-b" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-24 font-medium">{day.day}</div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <WeatherIcon condition={day.condition} />
                <span className="text-sm text-muted-foreground">{day.condition}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-medium">{Math.round(day.maxTemp)}°</span>
                <span className="text-muted-foreground">{Math.round(day.minTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
