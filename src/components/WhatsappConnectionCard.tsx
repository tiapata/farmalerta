import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Smartphone } from "lucide-react";
import { useWhatsappInstance } from "@/hooks/use-whatsapp-instance";
import { toast } from "sonner";

const STATUS_LABEL: Record<string, string> = {
  not_configured: "Não configurado",
  connecting: "Conectando...",
  qr_pending: "Aguardando leitura do QR",
  connected: "Conectado",
  disconnected: "Desconectado",
  error: "Erro",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  connected: "default",
  error: "destructive",
};

export function WhatsappConnectionCard() {
  const { instance, loading, runAction, running, refresh } = useWhatsappInstance();

  // Enquanto aguarda pareamento, consulta o status periodicamente — cobre o
  // caso do webhook de conexão ainda não ter chegado.
  useEffect(() => {
    if (!instance || !["connecting", "qr_pending"].includes(instance.status)) return;
    const interval = setInterval(() => {
      runAction("status").catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [instance, runAction]);

  const handleConnect = async () => {
    try {
      await runAction("create");
    } catch (error: any) {
      toast.error("Erro ao conectar WhatsApp: " + (error.message || "tente novamente"));
    }
  };

  const handleRefreshQr = async () => {
    try {
      await runAction("qr");
    } catch (error: any) {
      toast.error("Erro ao buscar QR code: " + (error.message || "tente novamente"));
    }
  };

  const handleDisconnect = async () => {
    try {
      await runAction("disconnect");
      toast.success("WhatsApp desconectado.");
    } catch (error: any) {
      toast.error("Erro ao desconectar: " + (error.message || "tente novamente"));
    }
  };

  const qrSrc = instance?.qr_code_data
    ? instance.qr_code_data.startsWith("data:")
      ? instance.qr_code_data
      : `data:image/png;base64,${instance.qr_code_data}`
    : null;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <CardTitle>Conexão WhatsApp</CardTitle>
          </div>
          {instance && (
            <Badge variant={STATUS_VARIANT[instance.status] ?? "secondary"}>
              {STATUS_LABEL[instance.status] ?? instance.status}
            </Badge>
          )}
        </div>
        <CardDescription>
          Conecte o WhatsApp da farmácia para que mensagens recebidas caiam direto no Inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : !instance ? (
          <Button onClick={handleConnect} disabled={running} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            Conectar WhatsApp
          </Button>
        ) : instance.status === "connected" ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Número conectado: <span className="font-medium text-foreground">{instance.phone_number || "—"}</span>
            </p>
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={running}>
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            {qrSrc ? (
              <img src={qrSrc} alt="QR Code do WhatsApp" className="w-48 h-48 rounded-lg border" />
            ) : (
              <p className="text-sm text-muted-foreground">Gerando QR code...</p>
            )}
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Abra o WhatsApp no celular da farmácia → Aparelhos conectados → Conectar um aparelho, e leia o código acima.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshQr} disabled={running}>
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar QR"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => refresh()}>
                Verificar status
              </Button>
            </div>
          </div>
        )}
        {instance?.last_error && <p className="text-xs text-destructive">{instance.last_error}</p>}
      </CardContent>
    </Card>
  );
}
