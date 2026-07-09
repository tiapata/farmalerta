import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, UserPlus, Search } from "lucide-react";
import { useConversations, type Conversation } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { useCustomers } from "@/hooks/use-customers";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/inbox")({
  component: InboxPage,
});

function initialsOf(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function InboxPage() {
  const { conversations, loading: loadingConversations } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((c) =>
      (c.contact_name ?? "").toLowerCase().includes(term) || c.contact_phone.includes(term),
    );
  }, [conversations, search]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">Conversas do WhatsApp em tempo real</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 flex-1 min-h-0">
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar conversa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {conversations.length === 0 ? "Nenhuma conversa ainda." : "Nenhuma conversa encontrada."}
                </p>
              </div>
            ) : (
              filtered.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  selected={conversation.id === selectedId}
                  onClick={() => setSelectedId(conversation.id)}
                />
              ))
            )}
          </ScrollArea>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          {selected ? (
            <ConversationThread conversation={selected} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageCircle className="h-10 w-10" />
              <p>Selecione uma conversa para começar</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ConversationListItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left border-b hover:bg-muted/50 transition-colors",
        selected && "bg-muted",
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
          {initialsOf(conversation.contact_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">
            {conversation.contact_name || conversation.contact_phone}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {relativeTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {conversation.last_message_preview || "Sem mensagens"}
          </span>
          {conversation.unread_count > 0 && (
            <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

function ConversationThread({ conversation }: { conversation: Conversation }) {
  const { messages, loading, sendMessage, sending } = useMessages(conversation.id);
  const { addCustomer } = useCustomers();
  const [draft, setDraft] = useState("");
  const [linking, setLinking] = useState(false);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      await sendMessage(text);
    } catch (error: any) {
      toast.error("Erro ao enviar mensagem: " + (error.message || "tente novamente"));
    }
  };

  const handleCreateCustomer = async () => {
    setLinking(true);
    try {
      const customer = await addCustomer({
        name: conversation.contact_name || conversation.contact_phone,
        phone: conversation.contact_phone,
      });
      if (customer) {
        await supabase.from("conversations").update({ customer_id: customer.id }).eq("id", conversation.id);
        toast.success("Cliente vinculado à conversa!");
      }
    } catch {
      // addCustomer já mostra o toast de erro
    } finally {
      setLinking(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initialsOf(conversation.contact_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{conversation.contact_name || "Sem nome"}</p>
            <p className="text-xs text-muted-foreground">{conversation.contact_phone}</p>
          </div>
        </div>
        {!conversation.customer_id && (
          <Button size="sm" variant="outline" className="gap-2 shrink-0" onClick={handleCreateCustomer} disabled={linking}>
            {linking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Vincular cliente
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.direction === "outbound" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    message.direction === "outbound"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body || `[${message.content_type}]`}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1 opacity-70",
                      message.direction === "outbound" ? "text-right" : "text-left",
                    )}
                  >
                    {new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {message.status === "pending" && " · enviando..."}
                    {message.status === "failed" && " · falhou"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex items-center gap-2 p-3 border-t">
        <Input
          placeholder="Digite uma mensagem..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button size="icon" onClick={handleSend} disabled={!draft.trim() || sending}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );
}
