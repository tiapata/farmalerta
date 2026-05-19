import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  console.log("SettingsPage rendered");
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p>Esta é uma versão de teste para diagnosticar o travamento.</p>
    </div>
  );
}
