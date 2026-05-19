import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart3, 
  Settings, 
  Database, 
  Globe, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6  animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta, integrações e preferências do sistema</p>
      </header>

      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="pharmacy">Farmácia</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Farmácia</CardTitle>
              <CardDescription>Informações principais da sua unidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Farmácia</Label>
                  <Input id="name" defaultValue="Farmácia São João - Filial Centro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone Comercial</Label>
                  <Input id="phone" defaultValue="(11) 3344-5566" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Business</Label>
                  <Input id="whatsapp" defaultValue="(11) 98877-6655" />
                </div>
              </div>
              <Button>Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis na sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">Excluir todos os dados</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" /> Evolution API (WhatsApp)
              </CardTitle>
              <CardDescription>Conexão para automação de mensagens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-100 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Conectado com sucesso</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" value="••••••••••••••••" readOnly />
              </div>
              <Button variant="outline">Testar Conexão</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" /> Importação de Dados ERP
              </CardTitle>
              <CardDescription>Configure como o sistema recebe dados do seu ERP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Importação Automática</p>
                  <p className="text-xs text-muted-foreground">Sincronizar a cada 24 horas</p>
                </div>
                <Switch />
              </div>
              <Button variant="outline">Baixar Template CSV</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
