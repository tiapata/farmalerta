import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Configurações</h1>
      <p className="text-muted-foreground">Esta é a nova página de configurações, reconstruída do zero.</p>
      
      <div className="grid gap-6 mt-8">
        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Perfil da Farmácia</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input className="w-full p-2 border rounded-lg bg-background" defaultValue="Farmácia São João" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input className="w-full p-2 border rounded-lg bg-background" defaultValue="contato@saojoao.com.br" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-xl font-semibold mb-4">Notificações</h2>
          <p className="text-sm text-muted-foreground">Configure como você deseja receber alertas.</p>
          <div className="mt-4 flex items-center gap-2">
            <input type="checkbox" id="email-notif" defaultChecked />
            <label htmlFor="email-notif">Receber por E-mail</label>
          </div>
        </div>
      </div>
    </div>
  );
}
