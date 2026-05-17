import { createFileRoute } from "@tanstack/react-router";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Phone, 
  MessageCircle,
  TrendingUp,
  UserCheck,
  UserMinus,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/customers")({
  component: Customers,
});

function Customers() {
  const customers = [
    { id: 1, name: "Maria Oliveira", status: "VIP", lastBuy: "2 dias atrás", ticket: "R$ 150", phone: "(11) 98765-4321", frequency: "Mensal" },
    { id: 2, name: "João Santos", status: "Em risco", lastBuy: "15 dias atrás", ticket: "R$ 80", phone: "(11) 98888-7777", frequency: "Quinzenal" },
    { id: 3, name: "Ana Costa", status: "Ativo", lastBuy: "5 dias atrás", ticket: "R$ 220", phone: "(11) 97777-6666", frequency: "Mensal" },
    { id: 4, name: "Carlos Pereira", status: "Inativo", lastBuy: "60 dias atrás", ticket: "R$ 45", phone: "(11) 96666-5555", frequency: "Ocasional" },
    { id: 5, name: "Beatriz Silva", status: "Recuperável", lastBuy: "35 dias atrás", ticket: "R$ 110", phone: "(11) 95555-4444", frequency: "Mensal" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VIP": return <Badge className="bg-yellow-500 hover:bg-yellow-600">VIP</Badge>;
      case "Em risco": return <Badge variant="destructive">Em risco</Badge>;
      case "Ativo": return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "Inativo": return <Badge variant="secondary">Inativo</Badge>;
      case "Recuperável": return <Badge variant="outline" className="border-orange-500 text-orange-500">Recuperável</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-10 animate-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Visualize e gerencie sua base de clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF ou telefone..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Button variant="outline">Exportar</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Última Compra</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ticket Médio</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Frequência</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{getStatusBadge(customer.status)}</td>
                    <td className="p-4 align-middle text-muted-foreground">{customer.lastBuy}</td>
                    <td className="p-4 align-middle font-medium">{customer.ticket}</td>
                    <td className="p-4 align-middle">
                       <Badge variant="secondary" className="font-normal">{customer.frequency}</Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
