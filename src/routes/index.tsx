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
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { title: "Receita Recuperável", value: "R$ 12.450", description: "Potencial de inativos", icon: TrendingUp, color: "text-green-600" },
    { title: "Clientes em Risco", value: "24", description: "30+ dias sem compra", icon: UserMinus, color: "text-orange-600" },
    { title: "Recompras Previstas", value: "18", description: "Para os próximos 3 dias", icon: Calendar, color: "text-green-600" },
    { title: "Clientes VIP", value: "42", description: "Clientes recorrentes", icon: Star, color: "text-yellow-600" },
  ];

  const actionsToday = [
    { name: "Maria Oliveira", reason: "Tratamento acabando (Losartana)", priority: "Alta", status: "Recompra" },
    { name: "João Santos", reason: "Cliente VIP inativo há 15 dias", priority: "Média", status: "VIP" },
    { name: "Ana Costa", reason: "Previsão de recompra amanhã", priority: "Baixa", status: "Recompra" },
    { name: "Carlos Pereira", reason: "Cliente recuperável (60 dias)", priority: "Alta", status: "Recuperação" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FarmAlerta</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, Farmácia São João</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <BarChart3 className="mr-2 h-4 w-4" /> Relatórios
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Clientes para ação hoje</CardTitle>
            <CardDescription>
              Prioridades identificadas pelo CRM inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Motivo</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Prioridade</th>
                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {actionsToday.map((action, i) => (
                    <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{action.name}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{action.reason}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={action.priority === "Alta" ? "destructive" : action.priority === "Média" ? "secondary" : "outline"}>
                          {action.priority}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button size="icon" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Resumo de Mensagens</CardTitle>
            <CardDescription>Mensagens pendentes para WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Aviso de Recompra</p>
                  <p className="text-xs text-muted-foreground">Mensagem pronta para enviar</p>
                </div>
                <Button size="sm" variant="ghost">Ver</Button>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">Ver todas as mensagens</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
