
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  CloudSun, 
  Droplets 
} from "lucide-react";

type WeatherIconProps = {
  condition: string;
  size?: number;
  className?: string;
};

export const WeatherIcon = ({ condition, size = 24, className = "" }: WeatherIconProps) => {
  const getIcon = () => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
      return <Sun size={size} className={`text-amber-400 ${className}`} />;
    } else if (lowerCondition.includes("partly cloudy") || lowerCondition.includes("few clouds")) {
      return <CloudSun size={size} className={`text-gray-500 ${className}`} />;
    } else if (lowerCondition.includes("cloud")) {
      return <Cloud size={size} className={`text-gray-400 ${className}`} />;
    } else if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
      return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
    } else if (lowerCondition.includes("snow")) {
      return <CloudSnow size={size} className={`text-blue-200 ${className}`} />;
    } else if (lowerCondition.includes("thunder") || lowerCondition.includes("lightning")) {
      return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;
    } else if (lowerCondition.includes("mist") || lowerCondition.includes("fog")) {
      return <CloudFog size={size} className={`text-gray-300 ${className}`} />;
    } else if (lowerCondition.includes("shower")) {
      return <Droplets size={size} className={`text-blue-400 ${className}`} />;
    } else {
      return <Sun size={size} className={`text-amber-400 ${className}`} />;
    }
  };

  return (
    <div className="animate-float">
      {getIcon()}
    </div>
  );
};
