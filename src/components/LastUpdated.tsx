
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LastUpdatedProps {
  timestamp: number;
}

export const LastUpdated = ({ timestamp }: LastUpdatedProps) => {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (minutes < 1) {
        setTimeAgo("Just now");
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} min ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        setTimeAgo("More than a day ago");
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>Updated {timeAgo}</span>
    </div>
  );
};
