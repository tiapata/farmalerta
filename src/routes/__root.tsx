import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Instância única fora do componente — recriar a cada render descartaria o
// cache. `QueryClientProvider` estava importado mas nunca de fato montado
// (confirmado antes de usar hooks React Query pela primeira vez no Inbox).
const queryClient = new QueryClient();
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  useNavigate
} from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { PharmacyOnboarding } from "@/components/PharmacyOnboarding";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePharmacy } from "@/hooks/use-pharmacy";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FarmAlerta - Gestão Farmacêutica" },
      { name: "description", content: "Sistema inteligente de gestão para farmácias" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { pharmacy, loading: loadingPharmacy, createPharmacy } = usePharmacy();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const isPublicPath = ["/login", "/auth-confirmation"].includes(location.pathname);
      if (!session && !isPublicPath) {
        navigate({ to: "/login" });
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  // Redirect if not logged in and not on login page
  useEffect(() => {
    const isPublicPath = ["/login", "/auth-confirmation"].includes(location.pathname);
    if (!loading && !session && !isPublicPath) {
      navigate({ to: "/login" });
    }
  }, [loading, session, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If on login page, just show the outlet
  if (["/login", "/auth-confirmation"].includes(location.pathname)) {
    return (
      <QueryClientProvider client={queryClient}>
        <HeadContent />
        <Outlet />
        <Toaster />
        <Scripts />
      </QueryClientProvider>
    );
  }

  if (loadingPharmacy) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Usuário autenticado mas ainda sem farmácia (perfil recém-criado pelo
  // trigger handle_new_user, que deliberadamente não atribui nenhuma).
  if (!pharmacy) {
    return (
      <QueryClientProvider client={queryClient}>
        <HeadContent />
        <PharmacyOnboarding onCreate={createPharmacy} />
        <Toaster />
        <Scripts />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background/50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
      <Scripts />
    </QueryClientProvider>
  );
}
