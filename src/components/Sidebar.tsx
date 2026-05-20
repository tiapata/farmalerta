import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  MessageSquare, 
  Clock
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clientes", href: "/customers" },
  { icon: Calendar, label: "Recompras", href: "/repurchases" },
  { icon: Clock, label: "Inativos", href: "/inactive" },
  { icon: MessageSquare, label: "Campanhas", href: "/campaigns" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar() {
  console.log("Sidebar rendering");
  return (
    <div className="flex flex-col w-64 h-screen border-r bg-card flex-shrink-0">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3 font-bold text-primary">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight text-foreground">FarmAlerta</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href as any}
            activeProps={{ className: "bg-primary text-primary-foreground shadow-md font-medium" }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-accent hover:text-accent-foreground" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center w-full gap-3 px-3 py-2.5 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
}
