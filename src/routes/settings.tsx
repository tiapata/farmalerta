import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Bell, Shield, Users, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("farmacia");

  const tabs = [
    { id: "farmacia", label: "Farmácia", icon: SettingsIcon },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "usuarios", label: "Usuários", icon: Users },
    { id: "seguranca", label: "Segurança", icon: Shield },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        </div>
        <p className="text-muted-foreground">Gerencie as preferências da sua farmácia e do sistema.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-2xl border p-6 shadow-sm">
          {activeTab === "farmacia" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Dados da Farmácia</h2>
                <p className="text-sm text-muted-foreground">Informações públicas e de contato da unidade.</p>
              </div>
              
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nome da Farmácia</label>
                  <input 
                    type="text" 
                    defaultValue="Farmácia São João - Filial Centro"
                    className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">CNPJ</label>
                  <input 
                    type="text" 
                    defaultValue="12.345.678/0001-90"
                    className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Telefone</label>
                    <input 
                      type="text" 
                      defaultValue="(11) 3344-5566"
                      className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input 
                      type="text" 
                      defaultValue="(11) 98877-6655"
                      className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab !== "farmacia" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <SettingsIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Em desenvolvimento</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Esta seção de configurações estará disponível em breve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
