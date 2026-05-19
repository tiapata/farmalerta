import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Clock,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  Bell
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      <div className="flex h-20 items-center px-6">
        <div className={cn("flex items-center gap-3 font-bold text-primary transition-all duration-300", !isOpen && !isMobile && "opacity-0 invisible w-0")}>
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight">FarmAlerta</span>
        </div>
        {!isOpen && !isMobile && (
           <div className="mx-auto h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all duration-300">
            <LayoutDashboard className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="px-4 mb-4">
        <div className={cn("bg-muted/50 rounded-xl p-2 transition-all", !isOpen && !isMobile && "bg-transparent p-0")}>
          {(isOpen || isMobile) && (
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Sistema Ativo</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href as any}
            activeProps={{ className: "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium !opacity-100" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-accent hover:text-accent-foreground" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group"
          >
            <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110")} />
            {(isOpen || isMobile) && <span className="text-sm">{item.label}</span>}
            {!isOpen && !isMobile && (
              <div className="fixed left-20 hidden group-hover:flex bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md border z-50">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4 space-y-4">
        <div className={cn(
          "bg-primary/5 rounded-2xl p-4 transition-all overflow-hidden border border-primary/10",
          !isOpen && !isMobile && "hidden"
        )}>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Dica do Dia</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Clientes VIP tendem a comprar 3x mais com cupons personalizados.
          </p>
        </div>

        <div className="pt-4 border-t flex flex-col gap-2">
          <div className={cn("flex items-center gap-3 px-2 py-2", !isOpen && !isMobile && "justify-center")}>
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">SJ</AvatarFallback>
            </Avatar>
            {(isOpen || isMobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">Farmácia São João</p>
                <p className="text-[10px] text-muted-foreground truncate">Premium Plan</p>
              </div>
            )}
          </div>
          
          <Button variant="ghost" className={cn("w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5", !isOpen && !isMobile && "px-0 justify-center")}>
            <LogOut className="h-5 w-5" />
            {(isOpen || isMobile) && <span className="text-sm">Sair da Conta</span>}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur shadow-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
        <div className="font-bold text-primary tracking-tight">FarmAlerta</div>
      </div>

      <div className={cn(
        "hidden md:flex flex-col border-r transition-all duration-300 ease-in-out sticky top-0 h-screen bg-card z-40",
        isOpen ? "w-64" : "w-20"
      )}>
        <SidebarContent />
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors z-50"
        >
          {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>
    </>
  );
}