import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth-confirmation")({
  component: AuthConfirmationPage,
});

function AuthConfirmationPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta mudanças na autenticação para capturar o login assim que o token for processado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || session) {
        toast.success("Login automático realizado com sucesso!");
        const timer = setTimeout(() => {
          navigate({ to: "/" });
        }, 3000);
        return () => clearTimeout(timer);
      }
    });

    // Verificação inicial caso a sessão já tenha sido carregada
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast.success("Bem-vindo de volta!");
        const timer = setTimeout(() => {
          navigate({ to: "/" });
        }, 2000);
        return () => clearTimeout(timer);
      }
    };
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl text-center">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">Confirmação de E-mail Realizada!</CardTitle>
          <CardDescription className="text-base">
            Sua conta foi verificada com sucesso. Agora você já pode acessar todos os recursos do FarmAlerta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Obrigado por confirmar seu e-mail. A segurança dos seus dados é nossa prioridade.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="w-full group">
            <Link to="/login">
              Ir para o Login
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
