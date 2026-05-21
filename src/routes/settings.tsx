import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Bell, Users, Save, Plus, Webhook, Database, FileCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePharmacy } from "@/hooks/use-pharmacy";
import { useProfiles } from "@/hooks/use-profiles";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { pharmacy, loading: loadingPharmacy, updatePharmacy } = usePharmacy();
  const { profiles, loading: loadingProfiles } = useProfiles();
  
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    whatsapp: ""
  });

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || "",
        cnpj: pharmacy.cnpj || "",
        email: pharmacy.email || "",
        phone: pharmacy.phone || "",
        whatsapp: pharmacy.whatsapp || ""
      });
    }
  }, [pharmacy]);

  const handleSave = async () => {
    await updatePharmacy(formData);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua farmácia, usuários e integrações.
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="perfil" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil da Farmácia</CardTitle>
              <CardDescription>
                Informações cadastrais e de contato da sua unidade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmacia-nome">Nome da Farmácia</Label>
                  <Input 
                    id="farmacia-nome" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    value={formData.cnpj} 
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Comercial</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone Comercial</Label>
                  <Input 
                    id="telefone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 0000-0000" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Business</Label>
                  <Input 
                    id="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2" disabled={loadingPharmacy}>
                  {loadingPharmacy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações do Sistema</CardTitle>
              <CardDescription>
                Conecte sua farmácia a serviços externos e automatize processos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Webhooks / API</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Configure endpoints para receber atualizações de pedidos em tempo real.
                    <Button variant="outline" size="sm" className="w-full mt-2">Configurar API</Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-lg">n8n Automation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Conecte fluxos de trabalho do n8n para automação de marketing e estoque.
                    <Button variant="outline" size="sm" className="w-full mt-2">Conectar n8n</Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">Importar XML ERP</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Importe arquivos XML das notas fiscais e estoque diretamente do seu ERP.
                    <Button variant="outline" size="sm" className="w-full mt-2 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100">Selecionar arquivo XML</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Escolha como e quando você deseja ser notificado sobre alertas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">Receba resumos diários e alertas críticos no seu e-mail.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Alertas de WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Receba alertas de temperatura e validade no celular.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">Exibir notificações no navegador e dispositivo móvel.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Usuários e Permissões</CardTitle>
                <CardDescription>
                  Gerencie quem tem acesso ao painel da sua farmácia.
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProfiles ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.full_name || "Sem nome"}</TableCell>
                        <TableCell>{profile.email || "---"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{profile.role === "admin" ? "Administrador" : "Usuário"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativo</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
