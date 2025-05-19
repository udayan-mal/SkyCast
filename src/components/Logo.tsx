
import { Cloud, Sun } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <div className="relative">
        <Sun className="h-8 w-8 text-amber-400" />
        <Cloud className="h-6 w-6 text-blue-400 absolute -bottom-1 -right-1" />
      </div>
      <h1 className="font-bold text-xl bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
        SkyView
      </h1>
    </div>
  );
}
