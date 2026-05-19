import { createFileRoute } from "@tanstack/react-router";
import { 
  Calendar, 
  Search, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/repurchases")({
  component: Repurchases,
});

function Repurchases() {
  const predictions = [
    { id: 1, customer: "Maria Oliveira", medication: "Losartana 50mg", daysLeft: 2, progress: 90, date: "20/05/2026", priority: "Alta" },
    { id: 2, customer: "Antônio Ferreira", medication: "Metformina 850mg", daysLeft: 5, progress: 80, date: "23/05/2026", priority: "Média" },
    { id: 3, customer: "Lúcia Souza", medication: "Sinvastatina 20mg", daysLeft: 1, progress: 95, date: "19/05/2026", priority: "Alta" },
    { id: 4, customer: "Ricardo Lima", medication: "Atenolol 25mg", daysLeft: 12, progress: 60, date: "30/05/2026", priority: "Baixa" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Previsão de Recompra</h1>
        <p className="text-muted-foreground">Antecipe as necessidades dos seus clientes de uso contínuo</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Recompras para hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs opacity-80">+2 em relação a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversão de Recompra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket de Recompra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1.840</div>
            <p className="text-xs text-muted-foreground">Projetado para esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Recompras</CardTitle>
          <CardDescription>Clientes com medicamentos próximos do fim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {predictions.map((p) => (
              <div key={p.id} className="flex flex-col gap-4 rounded-xl border p-4 transition-all hover:bg-muted/50 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    p.priority === "Alta" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  )}>
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{p.customer}</span>
                    <span className="text-sm text-muted-foreground">{p.medication}</span>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso do tratamento</span>
                    <span className="font-medium">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Acaba em {p.daysLeft} dias ({p.date})
                  </div>
                </div>

                <div className="flex items-center gap-2 md:ml-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" /> Notificar
                  </Button>
                  <Button size="sm" className="gap-2">
                    Recomprou <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
