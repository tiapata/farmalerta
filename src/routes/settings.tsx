import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: () => {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Configurações</h1>
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <p className="text-muted-foreground mb-6">Página de configurações em modo de segurança para evitar travamentos.</p>
          
          <div className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome da Farmácia</label>
              <input 
                type="text" 
                defaultValue="Farmácia São João"
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">WhatsApp de Notificações</label>
              <input 
                type="text" 
                defaultValue="(11) 98877-6655"
                className="w-full px-4 py-2 rounded-lg bg-muted/50 border-none outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    );
  },
});
