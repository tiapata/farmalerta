import { createFileRoute } from "@tanstack/react-router";
import { useCustomers } from "@/hooks/use-customers";
import { usePharmacy } from "@/hooks/use-pharmacy";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar, 
  Search, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Stethoscope,
  Pill,
  Timer,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/repurchases")({
  component: Repurchases,
});

function Repurchases() {
  const { customers, loading } = useCustomers();
  const { pharmacy } = usePharmacy();

  // Filtrar clientes que têm histórico e simular previsões
  const predictions = customers
    .filter(c => (c.orders_count || 0) > 0)
    .map((c, i) => {
      const daysSinceLast = c.last_purchase_at 
        ? Math.ceil(Math.abs(new Date().getTime() - new Date(c.last_purchase_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      
      const cycle = 30; // Assumindo ciclo de 30 dias para simplificar
      let daysLeft = Math.max(0, cycle - (daysSinceLast % cycle));
      
      // Ajuste para quando o estoque está exatamente no fim (múltiplo do ciclo)
      if (daysSinceLast >= cycle && daysSinceLast % cycle === 0) {
        daysLeft = 0;
      }
      
      const progress = Math.min(100, Math.round(((cycle - daysLeft) / cycle) * 100));
      const priority = daysLeft <= 2 ? "Alta" : daysLeft <= 7 ? "Média" : "Baixa";
      
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysLeft);

      // Mapeamento específico solicitado pelo usuário
      let medication = "Losartana 50mg";
      if (c.name === "Helena Matos") medication = "Losartana 50mg";
      else if (c.name === "Carlos Pereira") {
        medication = progress >= 90 ? "Metformina 850mg" : "Losartana 50mg";
      } else if (c.name === "Fernando Costa") {
        medication = progress >= 78 ? "Losartana 50mg" : "Metformina 850mg";
      } else {
        medication = i % 2 === 0 ? "Losartana 50mg" : "Metformina 850mg";
      }

      return {
        id: c.id,
        customer: c.name,
        phone: c.phone,
        medication,
        daysLeft,
        progress,
        date: nextDate.toLocaleDateString('pt-BR'),
        priority,
        initials: c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
    })
    .filter(p => p.progress >= 75) // Apenas clientes com status igual ou superior a 75%
    .sort((a, b) => b.progress - a.progress);

  const handleNotify = async (prediction: any) => {
    try {
      const pharmacyName = pharmacy?.name || "Nossa Farmácia";
      const messageText = prediction.daysLeft === 0
        ? `Olá ${prediction.customer}, notamos que seu medicamento ${prediction.medication} acabou hoje. Gostaria de solicitar a recompra na ${pharmacyName}? Podemos separar para você.`
        : `Olá ${prediction.customer}, seu medicamento ${prediction.medication} está chegando ao fim (restam ${prediction.daysLeft} dias). Gostaria de garantir sua próxima caixa na ${pharmacyName}?`;

      if (pharmacy?.id) {
        await supabase.from("messages").insert([{
          pharmacy_id: pharmacy.id,
          customer_id: prediction.id,
          content: messageText,
          status: 'Enviado',
          sent_at: new Date().toISOString()
        }]);
      }

      const encodedMessage = encodeURIComponent(messageText);
      const phone = prediction.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      toast.success("Mensagem de lembrete preparada!");
    } catch (error) {
      console.error("Erro ao notificar:", error);
      toast.error("Erro ao processar notificação");
    }
  };


  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Ciclo de Tratamento</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Previsão de Recompra</h1>
          <p className="text-muted-foreground text-lg">Antecipe as necessidades dos seus clientes de <span className="text-foreground font-semibold">uso contínuo</span>.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Recompras para hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">8</div>
            <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
              <ArrowUpRight className="h-3 w-3" />
              <span>+2 em relação a ontem</span>
            </div>
          </CardContent>
          <Timer className="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 rotate-12 transition-transform group-hover:scale-110" />
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversão de Recompra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">Média dos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Projetada (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1.840</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado no histórico de compras</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-muted/5">
          <CardTitle>Cronograma de Recompras</CardTitle>
          <CardDescription>Clientes com medicamentos próximos do fim</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : predictions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                Nenhum dado de recompra disponível. Popule o banco de dados primeiro.
              </div>
            ) : (
              predictions.map((p) => (
                <div key={p.id} className="flex flex-col gap-6 p-6 transition-all hover:bg-muted/30 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{p.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-foreground/90">{p.customer}</span>
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Pill className="h-3 w-3" />
                        {p.medication}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground uppercase tracking-tighter">Status do Estoque</span>
                      <span className={cn(p.priority === "Alta" ? "text-destructive" : "text-primary")}>
                        {p.progress}% utilizado
                      </span>
                    </div>
                    <Progress value={p.progress} className={cn("h-2.5", p.priority === "Alta" ? "[&>div]:bg-destructive" : "")} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Acaba em <span className="text-foreground">{p.daysLeft} dias</span> ({p.date})
                      </div>
                      <Badge variant={p.priority === "Alta" ? "destructive" : p.priority === "Média" ? "secondary" : "outline"} className="text-[9px] rounded-lg">
                        {p.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl gap-2 h-10 px-4 border-primary/20 text-primary hover:bg-primary/5"
                      onClick={() => handleNotify(p)}
                    >
                      <MessageCircle className="h-4 w-4" /> Notificar
                    </Button>
                    <Button size="sm" className="rounded-xl gap-2 h-10 px-4 shadow-md shadow-primary/10">
                      Registrar Recompra <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-secondary/30 rounded-3xl p-6 border border-secondary flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Deseja automatizar esses avisos?</h4>
            <p className="text-sm text-muted-foreground">Ative o envio automático via WhatsApp 48h antes do medicamento acabar.</p>
          </div>
        </div>
        <Button variant="secondary" className="bg-white hover:bg-white/90 shadow-sm rounded-xl font-bold">Configurar Automação</Button>
      </div>
    </div>
  );
}
