
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options);
}

export function getDayOfWeek(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  
  if (date.getDate() === today.getDate() && 
      date.getMonth() === today.getMonth() && 
      date.getFullYear() === today.getFullYear()) {
    return "Today";
  }
  
  const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
  return date.toLocaleDateString('en-US', options);
}

export function getWeatherBackground(condition: string, isDark: boolean): string {
  const lowerCondition = condition.toLowerCase();
  
  if (isDark) {
    // Dark mode backgrounds
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return 'bg-gradient-to-b from-slate-900 to-blue-900';
    } else if (lowerCondition.includes('cloud')) {
      return 'bg-gradient-to-b from-slate-900 to-slate-800';
    } else if (lowerCondition.includes('rain')) {
      return 'bg-gradient-to-b from-slate-900 to-blue-950';
    } else if (lowerCondition.includes('snow')) {
      return 'bg-gradient-to-b from-slate-900 to-slate-700';
    } else if (lowerCondition.includes('thunder')) {
      return 'bg-gradient-to-b from-slate-900 to-purple-950';
    } else {
      return 'bg-gradient-to-b from-slate-900 to-slate-800';
    }
  } else {
    // Light mode backgrounds
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) {
      return 'bg-gradient-to-b from-blue-400 to-sky-300';
    } else if (lowerCondition.includes('cloud')) {
      return 'bg-gradient-to-b from-gray-300 to-gray-200';
    } else if (lowerCondition.includes('rain')) {
      return 'bg-gradient-to-b from-blue-500 to-blue-400';
    } else if (lowerCondition.includes('snow')) {
      return 'bg-gradient-to-b from-blue-100 to-gray-100';
    } else if (lowerCondition.includes('thunder')) {
      return 'bg-gradient-to-b from-purple-400 to-purple-300';
    } else {
      return 'bg-gradient-to-b from-blue-200 to-blue-100';
    }
  }
}
