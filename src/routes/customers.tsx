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
  AlertTriangle,
  Download,
  Mail,
  History
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/customers")({
  component: Customers,
});

function Customers() {
  const customers = [
    { id: 1, name: "Maria Oliveira", status: "VIP", lastBuy: "2 dias atrás", ticket: "R$ 150", phone: "(11) 98765-4321", frequency: "Mensal", initials: "MO" },
    { id: 2, name: "João Santos", status: "Em risco", lastBuy: "15 dias atrás", ticket: "R$ 80", phone: "(11) 98888-7777", frequency: "Quinzenal", initials: "JS" },
    { id: 3, name: "Ana Costa", status: "Ativo", lastBuy: "5 dias atrás", ticket: "R$ 220", phone: "(11) 97777-6666", frequency: "Mensal", initials: "AC" },
    { id: 4, name: "Carlos Pereira", status: "Inativo", lastBuy: "60 dias atrás", ticket: "R$ 45", phone: "(11) 96666-5555", frequency: "Ocasional", initials: "CP" },
    { id: 5, name: "Beatriz Silva", status: "Recuperável", lastBuy: "35 dias atrás", ticket: "R$ 110", phone: "(11) 95555-4444", frequency: "Mensal", initials: "BS" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VIP": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px]">VIP</Badge>;
      case "Em risco": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px]">EM RISCO</Badge>;
      case "Ativo": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px]">ATIVO</Badge>;
      case "Inativo": return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px]">INATIVO</Badge>;
      case "Recuperável": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px]">RECUPERÁVEL</Badge>;
      default: return <Badge variant="outline" className="rounded-lg text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Base de Dados</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground text-lg">Administre e analise o comportamento dos seus <span className="text-foreground font-semibold">1,240 clientes</span>.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-none bg-card shadow-sm gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-2xl shadow-sm border-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF, telefone ou medicamento..." className="pl-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-none bg-muted/30 gap-2">
            <Filter className="h-4 w-4" /> Filtros Avançados
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <UserCheck className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">Ativos</Badge>
            </div>
            <div className="text-2xl font-bold">842</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes que compraram nos últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50">Atenção</Badge>
            </div>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes em risco de inatividade</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-yellow-500/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-200 bg-yellow-50">Crescimento</Badge>
            </div>
            <div className="text-2xl font-bold">R$ 142</div>
            <p className="text-xs text-muted-foreground mt-1">Ticket médio da base (aumento de 12%)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/10">
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Cliente</th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Última Compra</th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Ticket Médio</th>
                  <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Frequência</th>
                  <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr key={customer.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{customer.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground/90">{customer.name}</span>
                          <span className="text-[10px] text-muted-foreground">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">{getStatusBadge(customer.status)}</td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <History className="h-3 w-3" />
                        <span>{customer.lastBuy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle font-bold text-foreground/80">{customer.ticket}</td>
                    <td className="px-6 py-4 align-middle">
                       <Badge variant="secondary" className="font-medium bg-muted text-muted-foreground border-none rounded-lg text-[10px]">{customer.frequency}</Badge>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-green-600 hover:bg-green-50">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="gap-2"><Users className="h-4 w-4" /> Perfil Completo</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><History className="h-4 w-4" /> Histórico de Compras</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive"><UserMinus className="h-4 w-4" /> Desativar Cliente</DropdownMenuItem>
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
