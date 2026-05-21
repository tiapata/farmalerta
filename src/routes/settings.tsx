import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: () => {
    console.log("SettingsPage rendering - minimal version");
    return <div>Settings Page Minimal</div>;
  },
});
