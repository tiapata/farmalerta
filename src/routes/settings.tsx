import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Bell, Users, Save, Plus, Webhook, Database, FileCode, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { usePharmacy } from "@/hooks/use-pharmacy";
import { useProfiles } from "@/hooks/use-profiles";
import { useIntegrations } from "@/hooks/use-integrations";
import { uploadErpExport } from "@/lib/middleware-client";
import { WhatsappConnectionCard } from "@/components/WhatsappConnectionCard";
import { lazy, Suspense } from "react";

// xlsx (~400kB) só é necessário quando o usuário efetivamente abre o mapeamento
// de colunas, então carrega sob demanda em vez de inchar o bundle principal.
const ColumnMappingDialog = lazy(() =>
  import("@/components/ColumnMappingDialog").then((m) => ({ default: m.ColumnMappingDialog })),
);
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { pharmacy, loading: loadingPharmacy, updatePharmacy } = usePharmacy();
  const { profiles, loading: loadingProfiles, refresh: refreshProfiles } = useProfiles();
  const { integrationConfig, syncRuns, loading: loadingIntegrations, refresh: refreshIntegrations } = useIntegrations();
  const [importing, setImporting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPendingFile(file);
    setMappingDialogOpen(true);
  };

  const handleConfirmImport = async (columnMapping: Record<string, string>) => {
    if (!pendingFile) return;

    setImporting(true);
    try {
      const summary = await uploadErpExport(pendingFile, columnMapping);
      if (summary.recordsFailed > 0) {
        toast.warning(`Importação concluída com ${summary.recordsFailed} erro(s) de ${summary.recordsProcessed + summary.recordsFailed} vendas.`);
      } else {
        toast.success(`${summary.recordsProcessed} venda(s) importada(s) com sucesso!`);
      }
      await refreshIntegrations();
      setMappingDialogOpen(false);
      setPendingFile(null);
    } catch (error: any) {
      console.error("Erro ao importar arquivo:", error);
      toast.error("Erro ao importar arquivo: " + (error.message || "tente novamente"));
    } finally {
      setImporting(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    whatsapp: ""
  });

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    role: "user"
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

  const handleAddUser = async () => {
    try {
      if (!newUser.full_name || !newUser.email) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      // Since we don't have a backend to create Auth users, we'll just insert into profiles for now
      // This is for demonstration, normally this would be an Edge Function or specialized hook
      const { data, error } = await supabase
        .from("profiles")
        .insert([{
          id: crypto.randomUUID(), // Mock ID for demonstration
          full_name: newUser.full_name,
          role: newUser.role,
          pharmacy_id: pharmacy?.id
        } as any]);

      if (error) throw error;
      
      toast.success("Usuário cadastrado com sucesso!");
      setIsUserDialogOpen(false);
      setNewUser({ full_name: "", email: "", role: "user" });
      refreshProfiles();
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error("Erro ao cadastrar usuário");
    }
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
        <TabsList className="grid w-full grid-cols-4 lg:w-[620px]">
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
              <CardTitle>Middleware Universal</CardTitle>
              <CardDescription>
                Conecte o ERP da sua farmácia. A cadeia de prioridade tenta cada método na ordem abaixo — hoje só o Tier 2 (Exportação Automática) está implementado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Exportação Automática (ERP)</CardTitle>
                      </div>
                      {integrationConfig && (
                        <Badge variant={integrationConfig.status === "active" ? "default" : integrationConfig.status === "error" ? "destructive" : "secondary"}>
                          {integrationConfig.status === "active" ? "Ativo" : integrationConfig.status === "error" ? "Erro" : "Não configurado"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Envie um arquivo CSV ou XLSX exportado do seu ERP para sincronizar clientes, produtos e vendas.
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      disabled={importing}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                      {importing ? "Importando..." : "Selecionar arquivo (CSV/XLSX)"}
                    </Button>
                    {integrationConfig?.last_error && (
                      <p className="text-xs text-destructive">{integrationConfig.last_error}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-dashed opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">API Oficial</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Tier 1 da cadeia de prioridade — em breve, para ERPs com API própria.
                    <Button variant="outline" size="sm" className="w-full mt-2" disabled>Em breve</Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">Banco de Dados (leitura)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Tier 3 da cadeia de prioridade — conexão somente leitura ao banco do ERP.
                    <Button variant="outline" size="sm" className="w-full mt-2" disabled>Em breve</Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">XML da NFC-e</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    Tier 4 da cadeia de prioridade — leitura dos XMLs fiscais já emitidos.
                    <Button variant="outline" size="sm" className="w-full mt-2" disabled>Em breve</Button>
                  </CardContent>
                </Card>
              </div>

              {integrationConfig && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Histórico de sincronizações</h3>
                  {loadingIntegrations ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : syncRuns.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma importação ainda.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Processados</TableHead>
                          <TableHead>Falhas</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {syncRuns.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell className="font-medium">{run.source_file_name || "—"}</TableCell>
                            <TableCell>
                              <Badge variant={run.status === "success" ? "default" : run.status === "failed" ? "destructive" : "secondary"}>
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{run.records_processed}</TableCell>
                            <TableCell>{run.records_failed}</TableCell>
                            <TableCell>{new Date(run.started_at).toLocaleString('pt-BR')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <WhatsappConnectionCard />
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
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo membro para sua equipe.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user-name">Nome Completo</Label>
                      <Input 
                        id="user-name" 
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                        placeholder="Ex: João da Silva"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="user-email">E-mail</Label>
                      <Input 
                        id="user-email" 
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="user-role">Perfil de Acesso</Label>
                      <Select 
                        value={newUser.role} 
                        onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                      >
                        <SelectTrigger id="user-role">
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="user">Usuário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddUser} className="w-full">Cadastrar Usuário</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

      {pendingFile && (
        <Suspense fallback={null}>
          <ColumnMappingDialog
            file={pendingFile}
            open={mappingDialogOpen}
            onOpenChange={(open) => {
              setMappingDialogOpen(open);
              if (!open) setPendingFile(null);
            }}
            onConfirm={handleConfirmImport}
            importing={importing}
          />
        </Suspense>
      )}
    </div>
  );
}
