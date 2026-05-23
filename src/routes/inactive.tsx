import { createFileRoute } from "@tanstack/react-router";
import { 
  UserMinus, 
  TrendingDown, 
  AlertCircle, 
  MessageCircle, 
  RotateCcw,
  DollarSign,
  ChevronDown
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

export const Route = createFileRoute("/inactive")({
  component: InactiveCustomers,
});

function InactiveCustomers() {
  const groups = [
    { 
      label: "Ausentes há 30 dias", 
      color: "border-yellow-500", 
      icon: "🟡", 
      value: "R$ 4.200",
      customers: [
        { name: "Sérgio Mendes", lastBuy: "32 dias atrás", totalSpend: "R$ 450", frequency: "Alta" },
        { name: "Marta Rocha", lastBuy: "35 dias atrás", totalSpend: "R$ 1.200", frequency: "VIP" },
      ]
    },
    { 
      label: "Ausentes há 60 dias", 
      color: "border-orange-500", 
      icon: "🟠", 
      value: "R$ 5.800",
      customers: [
        { name: "Paulo Amaral", lastBuy: "62 dias atrás", totalSpend: "R$ 210", frequency: "Média" },
        { name: "Júlia Ferreira", lastBuy: "68 dias atrás", totalSpend: "R$ 890", frequency: "Alta" },
      ]
    },
    { 
      label: "Ausentes há 90+ dias", 
      color: "border-red-500", 
      icon: "🔴", 
      value: "R$ 12.400",
      customers: [
        { name: "Fernando Costa", lastBuy: "120 dias atrás", totalSpend: "R$ 3.400", frequency: "VIP" },
        { name: "Helena Matos", lastBuy: "95 dias atrás", totalSpend: "R$ 120", frequency: "Baixa" },
      ]
    },
  ];

  return (
    <div className="flex flex-col gap-6  animate-in fade-in duration-500">
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
            <div className="text-2xl font-bold">R$ 22.400</div>
            <p className="text-xs text-muted-foreground">Baseado no ticket médio dos inativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Perda (Churn)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">12.4%</div>
            <p className="text-xs text-muted-foreground">+1.2% este mês</p>
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

      <Accordion type="multiple" defaultValue={["item-0"]} className="w-full space-y-4">
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
                  <span className="font-medium text-destructive">{group.value} em risco</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pt-4">
                {group.customers.map((customer, j) => (
                  <div key={j} className="flex flex-col gap-4 rounded-lg border bg-background/50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">Última compra: {customer.lastBuy}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Ticket Histórico</p>
                        <p className="text-sm font-bold">{customer.totalSpend}</p>
                      </div>
                      <Badge variant={customer.frequency === "VIP" ? "default" : "secondary"}>
                        {customer.frequency}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </Button>
                        <Button size="sm" className="gap-2">
                          <RotateCcw className="h-4 w-4" /> Reativar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
