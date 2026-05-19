import { createFileRoute } from "@tanstack/react-router";
import { 
  Database, 
  Globe, 
  CheckCircle2,
  Settings as SettingsIcon,
  Bell,
  Users,
  ShieldCheck,
  Save,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

export const Route = createFileRoute("/settings")({
  component: SettingsPageWrapper,
});

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="p-4 border border-destructive bg-destructive/10 rounded-xl">
      <h2 className="text-lg font-bold text-destructive">Erro na página de configurações</h2>
      <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
    </div>
  );
}

function SettingsPageWrapper() {
  return <SettingsPage />;
}

function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Configurações do Sistema</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-lg">Gerencie sua conta, integrações e preferências do sistema</p>
      </header>

      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex w-full md:w-max justify-start h-auto">
          <TabsTrigger value="pharmacy" className="rounded-lg py-2 px-4">Farmácia</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-lg py-2 px-4">Integrações</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg py-2 px-4">Notificações</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg py-2 px-4">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacy" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle>Dados da Farmácia</CardTitle>
              <CardDescription>Informações principais da sua unidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Nome da Farmácia</Label>
                  <Input id="name" defaultValue="Farmácia São João - Filial Centro" className="rounded-xl border-none bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-sm font-semibold">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" className="rounded-xl border-none bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Telefone Comercial</Label>
                  <Input id="phone" defaultValue="(11) 3344-5566" className="rounded-xl border-none bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-semibold">WhatsApp Business</Label>
                  <Input id="whatsapp" defaultValue="(11) 98877-6655" className="rounded-xl border-none bg-muted/30" />
                </div>
              </div>
              <Button className="rounded-xl shadow-lg shadow-primary/20 px-8 gap-2">
                <Save className="h-4 w-4" /> Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-destructive/5 overflow-hidden">
            <CardHeader className="border-b border-destructive/10">
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis na sua conta</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button variant="destructive" className="rounded-xl gap-2">
                <Trash2 className="h-4 w-4" /> Excluir todos os dados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" /> Evolution API (WhatsApp)
              </CardTitle>
              <CardDescription>Conexão para automação de mensagens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-2xl bg-green-50 border border-green-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Conectado com sucesso</p>
                  <p className="text-xs text-green-700 opacity-80">Sua instância do WhatsApp está rodando normalmente</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm font-semibold">API Key</Label>
                <Input id="api-key" type="password" value="••••••••••••••••" readOnly className="rounded-xl border-none bg-muted/30" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl border-none bg-muted/30">Testar Conexão</Button>
                <Button variant="outline" className="rounded-xl border-none bg-muted/30 text-destructive hover:bg-destructive/10">Desconectar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" /> Sincronização de Dados ERP
              </CardTitle>
              <CardDescription>Configure como o sistema recebe dados do seu ERP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
                <div className="space-y-0.5">
                  <p className="font-bold">Importação Automática</p>
                  <p className="text-xs text-muted-foreground">Sincronizar dados a cada 24 horas</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="rounded-xl border-none bg-muted/30 justify-start gap-2 h-12">
                  <Database className="h-4 w-4" /> Baixar Template CSV de Clientes
                </Button>
                <Button variant="outline" className="rounded-xl border-none bg-muted/30 justify-start gap-2 h-12">
                  <Database className="h-4 w-4" /> Baixar Template CSV de Vendas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Preferências de Notificação
              </CardTitle>
              <CardDescription>Configure como você deseja ser alertado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Alertas de Recompra</p>
                    <p className="text-xs text-muted-foreground">Notificar quando um cliente estiver próximo de acabar o remédio</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Relatórios Diários</p>
                    <p className="text-xs text-muted-foreground">Receber um resumo matinal das ações do dia</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Alertas de Clientes em Risco</p>
                    <p className="text-xs text-muted-foreground">Notificar quando um cliente VIP completar 15 dias sem compra</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="rounded-xl shadow-lg shadow-primary/20 px-8">Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Equipe e Acessos
              </CardTitle>
              <CardDescription>Gerencie quem tem acesso ao painel da farmácia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                {[
                  { name: "Admin Geral", email: "admin@saojoao.com.br", role: "Administrador" },
                  { name: "Farmacêutico Chefe", email: "farma@saojoao.com.br", role: "Editor" }
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border-none transition-all hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium bg-background px-2 py-1 rounded-lg shadow-sm">{user.role}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all">
                Convidar novo colaborador
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
