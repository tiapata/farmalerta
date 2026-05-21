import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clientes", href: "/customers" },
  { icon: Calendar, label: "Recompras", href: "/repurchases" },
  { icon: Clock, label: "Inativos", href: "/inactive" },
  { icon: MessageSquare, label: "Campanhas", href: "/campaigns" },
  { icon: Settings, label: "Configurações", href: "/settings" },
] as const;

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // On mobile, we might want it collapsed by default or something
  // But for now, let's just make it a toggleable sidebar as requested

  return (
    <div 
      className={cn(
        "flex flex-col h-screen border-r bg-card flex-shrink-0 z-50 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "flex h-20 items-center px-4",
        isCollapsed ? "justify-center" : "px-6"
      )}>
        <div className="flex items-center gap-3 font-bold text-primary overflow-hidden">
          <div className="h-9 w-9 min-w-[36px] rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-xl tracking-tight text-foreground whitespace-nowrap animate-in fade-in duration-300">
              FarmAlerta
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group text-muted-foreground hover:bg-muted hover:text-foreground [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-lg [&.active]:shadow-primary/20 [&.active]:font-medium",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => {
              // On mobile, it might be good to auto-collapse on navigation if it's currently expanded
              // but the user said "ao clicar em uma das abas ele deve recolher a esquerda e exibir o seu conteudo a direita"
              // which implies it should collapse after clicking.
              if (window.innerWidth < 768) {
                setIsCollapsed(true);
              }
            }}
          >
            <item.icon className="h-5 w-5 min-w-[20px]" />
            {!isCollapsed && (
              <span className="text-sm whitespace-nowrap animate-in fade-in duration-300">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          className={cn(
            "flex items-center w-full gap-3 px-3 py-2.5 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/5",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 min-w-[20px]" />
          {!isCollapsed && (
            <span className="text-sm whitespace-nowrap animate-in fade-in duration-300">
              Sair
            </span>
          )}
        </button>
      </div>

      {/* Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute -right-3 top-24 h-6 w-6 rounded-full border shadow-md z-[60] bg-background hover:bg-accent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
