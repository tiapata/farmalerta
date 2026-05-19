import { createFileRoute } from "@tanstack/react-router";
import { 
  Plus, 
  MessageSquare, 
  Users, 
  Target, 
  Send,
  Calendar,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/campaigns")({
  component: Campaigns,
});

function Campaigns() {
  const campaigns = [
    { name: "Recuperação Inativos (Hipertensão)", target: "124 clientes", status: "Ativa", conversion: "15%", date: "15/05/2026" },
    { name: "Aviso VIP - Dia do Diabético", target: "42 clientes", status: "Concluída", conversion: "42%", date: "10/05/2026" },
    { name: "Incentivo Primeira Compra APP", target: "850 clientes", status: "Pausada", conversion: "3%", date: "01/05/2026" },
  ];

  return (
    <div className="flex flex-col gap-6  animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas Inteligentes</h1>
          <p className="text-muted-foreground">Crie e monitore campanhas de relacionamento segmentadas</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Campanha
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.240</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Campanhas</CardTitle>
              <CardDescription>Gerencie suas comunicações passadas e atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/50">
                    <div className="space-y-1">
                      <p className="font-medium">{c.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> {c.target}
                        <Calendar className="h-3 w-3 ml-2" /> {c.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Conversão</p>
                        <p className="text-sm font-bold">{c.conversion}</p>
                      </div>
                      <Badge variant={c.status === "Ativa" ? "default" : c.status === "Concluída" ? "secondary" : "outline"}>
                        {c.status}
                      </Badge>
                      <Button size="icon" variant="ghost">
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segmentações Rápidas</CardTitle>
              <CardDescription>Crie listas automáticas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Badge variant="secondary" className="bg-red-100 text-red-700">Hipertensos</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Diabéticos</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Idosos</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">VIPs</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
