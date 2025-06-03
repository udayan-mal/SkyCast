
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import UnitToggle from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";
import { UserRound, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface HeaderProps {
  onUnitChange?: () => void;
}

export const Header = ({ onUnitChange }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error("Error signing out");
    }
  };
  
  return (
    <header className="flex justify-between items-center mb-8">
      <Logo />
      <div className="flex items-center gap-2">
        <UnitToggle onUnitChange={onUnitChange} />
        <ThemeToggle />
        {!user ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">
              <UserRound className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user.email?.split('@')[0]}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
