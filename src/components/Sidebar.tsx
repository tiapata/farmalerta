import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Clock,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clientes", href: "/customers" },
    { icon: Calendar, label: "Recompras", href: "/repurchases" },
    { icon: Clock, label: "Inativos", href: "/inactive" },
    { icon: MessageSquare, label: "Campanhas", href: "/campaigns" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300 ease-in-out md:relative",
        isOpen ? "w-64" : "w-20"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className={cn("flex items-center gap-2 font-bold text-primary", !isOpen && "hidden")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              FA
            </div>
            <span>FarmAlerta</span>
          </div>
          {!isOpen && (
             <div className="mx-auto h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              FA
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className={cn("w-full justify-start gap-3", !isOpen && "px-0 justify-center")}>
            <LogOut className="h-5 w-5" />
            {isOpen && <span>Sair</span>}
          </Button>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 hidden md:flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm"
        >
          {isOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 rotate-45" />}
        </button>
      </div>
    </>
  );
}