
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWeatherProfile, WeatherProfile } from "@/hooks/useWeatherProfile";
import { Loader } from "lucide-react";

export default function UserPreferences() {
  const { profile, loading, updateProfile, isAuthenticated } = useWeatherProfile();
  const [tempProfile, setTempProfile] = useState<WeatherProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof WeatherProfile, value: any) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(tempProfile);
    setIsSaving(false);
  };

  if (loading) {
    return (
      <Card className="w-full glass-card animate-fade-in">
        <CardContent className="pt-6 flex justify-center items-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full glass-card animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>Weather Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={tempProfile.theme} 
              onValueChange={(value) => handleChange('theme', value)}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Temperature Unit</Label>
            <Select 
              value={tempProfile.unit} 
              onValueChange={(value) => handleChange('unit', value)}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Celsius (°C)</SelectItem>
                <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_city">Default City</Label>
            <Input 
              id="default_city" 
              value={tempProfile.default_city || ''} 
              onChange={(e) => handleChange('default_city', e.target.value)}
              placeholder="Enter your default city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={tempProfile.language} 
              onValueChange={(value) => handleChange('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="cursor-pointer">Enable Notifications</Label>
            <Switch 
              id="notifications" 
              checked={tempProfile.notifications_enabled}
              onCheckedChange={(checked) => handleChange('notifications_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="analytics" className="cursor-pointer">Enable Analytics</Label>
            <Switch 
              id="analytics" 
              checked={tempProfile.analytics_enabled}
              onCheckedChange={(checked) => handleChange('analytics_enabled', checked)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSaving || !isAuthenticated} 
            className="w-full"
          >
            {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            {!isAuthenticated ? 'Sign in to save preferences' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-sm text-muted-foreground">
          {isAuthenticated 
            ? "Your preferences will be synced across devices." 
            : "Sign in to save your preferences across devices."}
        </p>
      </CardFooter>
    </Card>
  );
}
