import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Bell, Shield, Users, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p>Esta é uma página de teste simplificada.</p>
    </div>
  );
}
