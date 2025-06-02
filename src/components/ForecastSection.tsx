
import DailyForecast from "@/components/DailyForecast";

interface ForecastSectionProps {
  forecast: any[];
}

export const ForecastSection = ({ forecast }: ForecastSectionProps) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-4">7-Day Forecast</h2>
      <DailyForecast forecast={forecast} />
    </>
  );
};
