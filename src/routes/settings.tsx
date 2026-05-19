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


export const Route = createFileRoute("/settings")({
  component: SettingsPageWrapper,
});


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

      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 bg-muted/50 p-1 rounded-xl w-fit">
          <Button variant="ghost" className="rounded-lg bg-background shadow-sm">Farmácia</Button>
          <Button variant="ghost" className="rounded-lg opacity-50 cursor-not-allowed">Integrações</Button>
          <Button variant="ghost" className="rounded-lg opacity-50 cursor-not-allowed">Notificações</Button>
          <Button variant="ghost" className="rounded-lg opacity-50 cursor-not-allowed">Usuários</Button>
        </div>

        <div className="space-y-6">

        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}
