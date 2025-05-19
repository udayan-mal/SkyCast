
import { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UnitToggle() {
  const { profile, updateProfile } = useWeatherProfile();
  const { user } = useAuth();
  const [isMetric, setIsMetric] = useState(profile.unit === "metric");
  
  useEffect(() => {
    setIsMetric(profile.unit === "metric");
  }, [profile.unit]);

  const toggleUnit = async () => {
    const newUnit = isMetric ? "imperial" : "metric";
    setIsMetric(!isMetric);
    
    // Always update local state for immediate feedback
    const result = await updateProfile({ unit: newUnit });
    
    if (!result && user) {
      // If update failed but user is authenticated, show error
      toast.error("Failed to save preference");
      setIsMetric(profile.unit === "metric"); // Revert to original
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle 
            variant="outline" 
            pressed={!isMetric} 
            onPressedChange={() => toggleUnit()}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-9 px-3 text-sm font-medium transition-all"
            aria-label="Toggle temperature unit"
          >
            {isMetric ? "°C" : "°F"}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {isMetric ? "Fahrenheit" : "Celsius"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
