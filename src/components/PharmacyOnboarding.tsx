import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Store } from "lucide-react";

interface PharmacyOnboardingProps {
  onCreate: (name: string) => Promise<unknown>;
}

export function PharmacyOnboarding({ onCreate }: PharmacyOnboardingProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Store className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Vamos criar sua farmácia</CardTitle>
          <CardDescription>
            Sua conta ainda não está associada a nenhuma farmácia. Dê um nome pra começar — você poderá completar os
            outros dados depois em Configurações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacy-name">Nome da farmácia</Label>
              <Input
                id="pharmacy-name"
                placeholder="Farmácia São João"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar farmácia e continuar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          Você será o administrador desta farmácia.
        </CardFooter>
      </Card>
    </div>
  );
}
