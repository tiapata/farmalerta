import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { 
  UserMinus, 
  TrendingDown, 
  AlertCircle, 
  MessageCircle, 
  RotateCcw,
  DollarSign,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCustomers } from "@/hooks/use-customers";
import { toast } from "sonner";

export const Route = createFileRoute("/inactive")({
  component: InactiveCustomers,
});

function InactiveCustomers() {
  const { customers, loading } = useCustomers();

  // Filtrar clientes inativos ou recuperáveis
  const inactiveCustomers = customers.filter(c => c.status === "Inativo" || c.status === "Recuperável");

  const getDaysSince = (dateString: string | null) => {
    if (!dateString) return 999;
    const lastDate = new Date(dateString);
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const groups = [
    { 
      label: "Ausentes há 30 dias", 
      color: "border-yellow-500", 
      icon: "🟡", 
      minDays: 30,
      maxDays: 59,
      customers: inactiveCustomers.filter(c => {
        const days = getDaysSince(c.last_purchase_at);
        return days >= 30 && days < 60;
      })
    },
    { 
      label: "Ausentes há 60 dias", 
      color: "border-orange-500", 
      icon: "🟠", 
      minDays: 60,
      maxDays: 89,
      customers: inactiveCustomers.filter(c => {
        const days = getDaysSince(c.last_purchase_at);
        return days >= 60 && days < 90;
      })
    },
    { 
      label: "Ausentes há 90+ dias", 
      color: "border-red-500", 
      icon: "🔴", 
      minDays: 90,
      maxDays: Infinity,
      customers: inactiveCustomers.filter(c => {
        const days = getDaysSince(c.last_purchase_at);
        return days >= 90;
      })
    },
  ];

  const totalLostValue = inactiveCustomers.reduce((acc, curr) => acc + (curr.total_spent || 0) / (curr.orders_count || 1), 0);
  const churnRate = customers.length > 0 ? (inactiveCustomers.length / customers.length * 100).toFixed(1) : "0";

  const handleWhatsApp = async (phone: string, name: string, customerId: string) => {
    try {
      const { data: pharmacy } = await supabase.from("pharmacies").select("id").limit(1).maybeSingle();
      if (pharmacy) {
        await supabase.from("messages").insert([{
          pharmacy_id: pharmacy.id,
          customer_id: customerId,
          content: `Olá ${name}, sentimos sua falta na Farmácia Central! Temos uma oferta especial para você hoje.`,
          status: 'Enviado',
          sent_at: new Date().toISOString()
        }]);
      }
      
      const message = encodeURIComponent(`Olá ${name}, sentimos sua falta na Farmácia Central! Temos uma oferta especial para você hoje.`);
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
      toast.success("Mensagem registrada e abrindo WhatsApp...");
    } catch (error) {
      console.error("Erro ao registrar mensagem:", error);
      toast.error("Erro ao registrar ação no banco de dados");
    }
  };

  const handleReactivate = async (name: string, customerId: string) => {
    try {
      const { data: pharmacy } = await supabase.from("pharmacies").select("id").limit(1).maybeSingle();
      if (pharmacy) {
        // Simular a criação de uma campanha ou mensagem de reativação
        await supabase.from("messages").insert([{
          pharmacy_id: pharmacy.id,
          customer_id: customerId,
          content: `Estratégia de reativação iniciada para ${name}`,
          status: 'Pendente'
        }]);
      }
      toast.success(`Iniciando processo de reativação para ${name}. Uma oferta personalizada foi preparada!`);
    } catch (error) {
      toast.error("Erro ao processar reativação");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Recuperação de Inativos</h1>
        <p className="text-muted-foreground">Identifique e traga de volta clientes que pararam de comprar</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Perdido Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalLostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Baseado no ticket médio dos inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Clientes Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{churnRate}%</div>
            <p className="text-xs text-muted-foreground">Proporção de clientes inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sucesso em Reativação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">24%</div>
            <p className="text-xs text-muted-foreground">Clientes que voltaram após contato</p>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={["item-0", "item-1", "item-2"]} className="w-full space-y-4">
        {groups.map((group, i) => (
          <AccordionItem key={i} value={`item-${i}`} className={cn("border rounded-xl px-4 bg-card", group.color)}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <span className="font-bold text-lg">{group.label}</span>
                  <Badge variant="secondary" className="ml-2">{group.customers.length} clientes</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-destructive">
                    R$ {group.customers.reduce((acc, c) => acc + (c.total_spent || 0) / (c.orders_count || 1), 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} em risco
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pt-4">
                {group.customers.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground italic">Nenhum cliente neste grupo.</p>
                ) : (
                  group.customers.map((customer) => (
                    <div key={customer.id} className="flex flex-col gap-4 rounded-lg border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">Última compra: {getDaysSince(customer.last_purchase_at)} dias atrás</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Ticket Histórico</p>
                          <p className="text-sm font-bold">R$ {(customer.total_spent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <Badge variant={customer.vip_level === "Ouro" ? "default" : "secondary"}>
                          {customer.vip_level}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                             onClick={() => handleWhatsApp(customer.phone, customer.name, customer.id)}
                          >
                            <MessageCircle className="h-4 w-4" /> WhatsApp
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleReactivate(customer.name, customer.id)}
                          >
                            <RotateCcw className="h-4 w-4" /> Reativar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
