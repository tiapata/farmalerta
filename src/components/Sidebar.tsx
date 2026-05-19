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
import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Clientes", href: "/customers" },
    { icon: Calendar, label: "Recompras", href: "/repurchases" },
    { icon: Clock, label: "Inativos", href: "/inactive" },
    { icon: MessageSquare, label: "Campanhas", href: "/campaigns" },
    { icon: Settings, label: "Configurações", href: "/settings" },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className={cn("flex items-center gap-2 font-bold text-primary", !isOpen && !isMobile && "hidden")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            FA
          </div>
          <span>FarmAlerta</span>
        </div>
        {!isOpen && !isMobile && (
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
            {(isOpen || isMobile) && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className={cn("w-full justify-start gap-3", !isOpen && !isMobile && "px-0 justify-center")}>
          <LogOut className="h-5 w-5" />
          {(isOpen || isMobile) && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out sticky top-0 h-screen bg-card",
        isOpen ? "w-64" : "w-20"
      )}>
        <SidebarContent />
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm"
        >
          {isOpen ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 rotate-45" />}
        </button>
      </div>
    </>
  );
}