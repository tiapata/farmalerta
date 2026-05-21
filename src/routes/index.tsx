import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Star, 
  MessageSquare, 
  UserMinus, 
  BarChart3,
  ArrowRight,
  Plus,
  ArrowUpRight,
  Search,
  Bell,
  Filter,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePharmacy } from "@/hooks/use-pharmacy";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { pharmacy, loading } = usePharmacy();
  const stats = [
    { title: "Receita Recuperável", value: "R$ 12.450", trend: "+12.5%", description: "Potencial de inativos", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { title: "Clientes em Risco", value: "24", trend: "-2", description: "30+ dias sem compra", icon: UserMinus, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Recompras Previstas", value: "18", trend: "+4 hoje", description: "Próximos 3 dias", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Clientes VIP", value: "42", trend: "Top 5%", description: "Clientes recorrentes", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  const actionsToday = [
    { name: "Maria Oliveira", reason: "Tratamento acabando (Losartana)", priority: "Alta", status: "Recompra", initials: "MO", lastVisit: "Há 28 dias" },
    { name: "João Santos", reason: "Cliente VIP inativo há 15 dias", priority: "Média", status: "VIP", initials: "JS", lastVisit: "Há 15 dias" },
    { name: "Ana Costa", reason: "Previsão de recompra amanhã", priority: "Baixa", status: "Recompra", initials: "AC", lastVisit: "Há 29 dias" },
    { name: "Carlos Pereira", reason: "Cliente recuperável (60 dias)", priority: "Alta", status: "Recuperação", initials: "CP", lastVisit: "Há 62 dias" },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-medium">Dashboard v2.0</Badge>
            <span className="text-xs text-muted-foreground">• Atualizado agora</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground/90">
            Olá, <span className="text-primary">{loading ? "..." : (pharmacy?.name || "Farmácia")}</span> 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Você tem <span className="text-foreground font-semibold">12 ações prioritárias</span> para hoje.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-64 bg-card border-none shadow-sm rounded-xl focus-visible:ring-primary" placeholder="Buscar cliente ou medicamento..." />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl bg-card border-none shadow-sm relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2 px-5">
            <Plus className="h-4 w-4" /> Novo Atendimento
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-md flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
            <div>
              <CardTitle className="text-xl">Clientes para ação hoje</CardTitle>
              <CardDescription>
                IA identificou necessidades críticas para sua farmácia
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/10">
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Cliente</th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Motivo da Ação</th>
                    <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {actionsToday.map((action, i) => (
                    <tr key={i} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{action.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground/90">{action.name}</span>
                            <span className="text-[10px] text-muted-foreground">{action.lastVisit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-muted-foreground font-medium">{action.reason}</span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <Badge 
                          className="rounded-lg px-2.5 py-0.5 border-none font-semibold text-[10px]"
                          variant={action.priority === "Alta" ? "destructive" : action.priority === "Média" ? "secondary" : "outline"}
                        >
                          {action.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <Button size="icon" variant="ghost" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-muted/5 text-center">
              <Button variant="link" className="text-primary font-semibold text-xs h-auto p-0">
                Ver todos os clientes (142)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm flex flex-col h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Central de WhatsApp</CardTitle>
              <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
            </div>
            <CardDescription>Envie avisos automáticos e recupere vendas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { title: "Lembrete de Losartana", user: "Maria Oliveira", time: "Há 2min" },
              { title: "Boas-vindas", user: "Novo Cliente", time: "Agendado" },
              { title: "Recuperação de Inativo", user: "Carlos Pereira", time: "Pendente" }
            ].map((msg, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4 hover:border-primary/30 transition-colors group cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-bold leading-tight">{msg.title}</p>
                  <p className="text-[11px] text-muted-foreground">{msg.user} • {msg.time}</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground">
                  Enviar
                </Button>
              </div>
            ))}
            <Button className="w-full mt-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold">
              <Link to="/campaigns">
                Ir para Campanhas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 border border-primary/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-bold mb-2">Maximize suas vendas com IA</h3>
          <p className="text-muted-foreground mb-6">
            Nossa inteligência artificial identificou que clientes que compram Vitaminas junto com remédios de uso contínuo têm uma taxa de fidelidade 40% maior.
          </p>
          <Button className="rounded-xl gap-2 shadow-lg shadow-primary/10">
            Ver Insights Recomendados <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <TrendingUp className="absolute -right-10 -bottom-10 h-64 w-64 text-primary/5 -rotate-12" />
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

