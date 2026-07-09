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
  History,
  Loader2
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
import { cn } from "@/lib/utils";
import { useCustomers, Customer } from "@/hooks/use-customers";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/customers")({
  component: Customers,
});

function Customers() {
  const { customers, loading, addCustomer } = useCustomers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: ""
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return;
    await addCustomer(newCustomer);
    setIsDialogOpen(false);
    setNewCustomer({ name: "", phone: "", email: "", cpf: "" });
  };

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

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.cpf && customer.cpf.includes(searchTerm)) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || (customer.status && customer.status.toLowerCase() === statusFilter.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);


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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2">
                <Plus className="h-4 w-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados básicos para cadastrar um novo cliente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={newCustomer.name} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input 
                    id="phone" 
                    value={newCustomer.phone} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail (Opcional)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newCustomer.email} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF (Opcional)</Label>
                  <Input 
                    id="cpf" 
                    value={newCustomer.cpf} 
                    onChange={(e) => setNewCustomer({ ...newCustomer, cpf: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCustomer} className="w-full">Cadastrar Cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex flex-col gap-4 bg-card p-4 rounded-2xl shadow-sm border-none">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, CPF, telefone..." 
              className="pl-10 bg-muted/30 border-none rounded-xl focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className={cn("rounded-xl border-none bg-muted/30 gap-2", showAdvancedFilters && "bg-primary/10 text-primary")}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4" /> Filtros Avançados
            </Button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Filtrar por Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-muted/30 border-none rounded-xl h-10">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Recuperável">Recuperável</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Em risco">Em risco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Nenhum cliente encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const initials = customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <tr key={customer.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground/90">{customer.name}</span>
                              <span className="text-[10px] text-muted-foreground">{customer.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">{getStatusBadge(customer.status || "Ativo")}</td>
                        <td className="px-6 py-4 align-middle">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <History className="h-3 w-3" />
                            <span>{customer.last_purchase_at ? new Date(customer.last_purchase_at).toLocaleDateString() : '---'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle font-bold text-foreground/80">
                          {customer.total_spent ? `R$ ${customer.total_spent.toFixed(2)}` : 'R$ 0,00'}
                        </td>
                        <td className="px-6 py-4 align-middle">
                           <Badge variant="secondary" className="font-medium bg-muted text-muted-foreground border-none rounded-lg text-[10px]">
                             {customer.orders_count || 0} pedidos
                           </Badge>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
