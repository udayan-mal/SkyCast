
import { useState, useEffect } from "react";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";

export const useThemeEffect = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { profile } = useWeatherProfile();

  // Set initial theme based on profile
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (profile.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (profile.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, [profile.theme]);

  // Monitor dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};
