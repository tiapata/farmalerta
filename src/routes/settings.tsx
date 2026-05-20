import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Building2, 
  Bell, 
  Users, 
  Shield, 
  Save,
  Info,
  Smartphone,
  Globe
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Geral", icon: Building2 },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "users", label: "Usuários", icon: Users },
    { id: "security", label: "Segurança", icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        </div>
        <p className="text-muted-foreground">Gerencie as preferências da sua plataforma.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navegação Lateral de Configurações */}
        <div className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Área de Conteúdo */}
        <div className="flex-1 bg-card rounded-2xl border p-6 md:p-8 shadow-sm min-h-[500px]">
          {activeTab === "general" && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Informações da Farmácia</h2>
                <p className="text-sm text-muted-foreground">Estes dados serão usados em faturas e comunicações.</p>
              </div>

              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Fantasia</label>
                    <input 
                      type="text" 
                      placeholder="Nome da sua farmácia"
                      className="w-full h-11 px-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                      defaultValue="Farmácia São João"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CNPJ</label>
                    <input 
                      type="text" 
                      placeholder="00.000.000/0000-00"
                      className="w-full h-11 px-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                      defaultValue="12.345.678/0001-90"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Endereço Completo</label>
                  <input 
                    type="text" 
                    placeholder="Rua, número, bairro..."
                    className="w-full h-11 px-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                    defaultValue="Av. Principal, 1000 - Centro"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="(00) 0000-0000"
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                        defaultValue="(11) 3344-5566"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="url" 
                        placeholder="www.suafarmacia.com.br"
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                        defaultValue="www.farmaciasaojoao.com.br"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="contato@exemplo.com"
                      className="w-full h-11 px-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
                      defaultValue="contato@saojoao.com.br"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <button className="bg-primary text-primary-foreground h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab !== "general" && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Info className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Em Breve</h3>
                <p className="text-muted-foreground max-w-sm">Esta seção das configurações está sendo preparada para você. Volte em alguns dias!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
