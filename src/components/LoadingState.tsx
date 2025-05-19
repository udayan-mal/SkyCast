
import { Loader } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-12 h-12 text-primary animate-spin" />
      <p className="mt-4 text-muted-foreground">Fetching weather data...</p>
    </div>
  );
};
