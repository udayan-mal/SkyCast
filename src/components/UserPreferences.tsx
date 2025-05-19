
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useWeatherProfile, WeatherProfile } from "@/hooks/useWeatherProfile";
import { Loader, Trash2 } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UserPreferences() {
  const { profile, loading, updateProfile, isAuthenticated } = useWeatherProfile();
  const { clearHistory } = useSearchHistory();
  const { signOut } = useAuth();
  const [tempProfile, setTempProfile] = useState<WeatherProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field: keyof WeatherProfile, value: any) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(tempProfile);
    setIsSaving(false);
  };

  const handleResetDefaults = () => {
    const defaults = {
      theme: 'system',
      unit: 'metric',
      default_city: null,
      language: 'en',
      notifications_enabled: false,
      analytics_enabled: true,
    };
    
    setTempProfile(defaults);
    toast.info("Preferences reset to defaults. Click Save to apply changes.");
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast.success("You've been signed out");
  };
  
  const handleSignIn = () => {
    navigate('/auth');
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
        <CardTitle className="flex justify-between items-center">
          <span>Weather Preferences</span>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSignIn}>Sign In</Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">App Theme</Label>
              <Select 
                value={tempProfile.theme} 
                onValueChange={(value) => handleChange('theme', value)}
              >
                <SelectTrigger id="theme" className="bg-white/80 dark:bg-slate-800/80">
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
                <SelectTrigger id="unit" className="bg-white/80 dark:bg-slate-800/80">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Celsius (°C)</SelectItem>
                  <SelectItem value="imperial">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_city">Default City</Label>
            <div className="flex gap-2">
              <Input 
                id="default_city" 
                value={tempProfile.default_city || ''} 
                onChange={(e) => handleChange('default_city', e.target.value)}
                placeholder="Enter your default city"
                className="bg-white/80 dark:bg-slate-800/80"
              />
              {tempProfile.default_city && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleChange('default_city', null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This city will be loaded automatically when you open the app
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select 
                value={tempProfile.language} 
                onValueChange={(value) => handleChange('language', value)}
              >
                <SelectTrigger id="language" className="bg-white/80 dark:bg-slate-800/80">
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
            
            <div className="space-y-4 pt-2">
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
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="submit" 
              disabled={isSaving} 
              className="flex-1"
            >
              {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
              {!isAuthenticated ? 'Save Preferences Locally' : 'Save Preferences'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetDefaults}
              className="flex-1"
            >
              Reset to Default
            </Button>
          </div>
          
          <div className="pt-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={clearHistory}
              className="w-full"
            >
              Clear Search History
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-sm text-muted-foreground">
          {isAuthenticated 
            ? "Your preferences are synced across all your devices." 
            : "Sign in to save your preferences across devices."}
        </p>
      </CardFooter>
    </Card>
  );
}
