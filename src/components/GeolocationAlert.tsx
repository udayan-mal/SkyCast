
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GeolocationAlertProps {
  error: string | null;
}

export const GeolocationAlert = ({ error }: GeolocationAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert className="my-4 bg-amber-50 dark:bg-amber-950/40 border-amber-300">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
