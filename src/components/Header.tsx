
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import UnitToggle from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onUnitChange?: () => void;
}

export const Header = ({ onUnitChange }: HeaderProps) => {
  const { user } = useAuth();
  
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
          <Button variant="outline" size="sm" disabled>
            <UserRound className="h-4 w-4 mr-2" />
            {user.email?.split('@')[0]}
          </Button>
        )}
      </div>
    </header>
  );
};
