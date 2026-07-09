import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageCircle } from "lucide-react";
import { usePipelines, usePipelineStages } from "@/hooks/use-pipelines";
import { usePipelineCards, type PipelineCard } from "@/hooks/use-pipeline-cards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({
  component: PipelinePage,
});

function initialsOf(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function cardLabel(card: PipelineCard): string {
  return card.title || card.conversations?.contact_name || card.customers?.name || card.conversations?.contact_phone || card.customers?.phone || "Sem título";
}

function cardSubtitle(card: PipelineCard): string | null {
  return card.conversations?.last_message_preview ?? null;
}

function PipelinePage() {
  const { pipelines, loading: loadingPipelines } = usePipelines();
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const pipelineId = activePipelineId ?? pipelines[0]?.id ?? null;

  const { stages, loading: loadingStages } = usePipelineStages(pipelineId);
  const { cards, loading: loadingCards, moveCard } = usePipelineCards(pipelineId);

  const [draggingCard, setDraggingCard] = useState<PipelineCard | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const cardsByStage = useMemo(() => {
    const map = new Map<string, PipelineCard[]>();
    for (const card of cards) {
      const list = map.get(card.stage_id) ?? [];
      list.push(card);
      map.set(card.stage_id, list);
    }
    return map;
  }, [cards]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setDraggingCard(card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingCard(null);
    const { active, over } = event;
    if (!over) return;

    const card = cards.find((c) => c.id === active.id);
    const targetStageId = String(over.id);
    if (!card || card.stage_id === targetStageId) return;

    const stageCards = cardsByStage.get(targetStageId) ?? [];
    const maxPosition = stageCards.reduce((max, c) => Math.max(max, c.position), 0);

    moveCard({ cardId: card.id, stageId: targetStageId, position: maxPosition + 1 });
  };

  const loading = loadingPipelines || loadingStages || loadingCards;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">Acompanhe conversas e oportunidades em quadro Kanban</p>
        </div>
        {pipelines.length > 0 && (
          <Select value={pipelineId ?? undefined} onValueChange={setActivePipelineId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Selecione um pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : stages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Nenhum pipeline configurado ainda.
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 flex-1 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <StageColumn key={stage.id} stage={stage} cards={cardsByStage.get(stage.id) ?? []} />
            ))}
          </div>
          <DragOverlay>{draggingCard && <KanbanCard card={draggingCard} overlay />}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function StageColumn({ stage, cards }: { stage: { id: string; name: string; color: string | null }; cards: PipelineCard[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <Card ref={setNodeRef} className={cn("flex flex-col w-72 shrink-0 transition-colors", isOver && "ring-2 ring-primary")}>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color ?? "#94a3b8" }} />
          {stage.name}
        </CardTitle>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-[120px]">
        {cards.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sem cards</p>
        ) : (
          cards.map((card) => <KanbanCard key={card.id} card={card} />)
        )}
      </CardContent>
    </Card>
  );
}

function KanbanCard({ card, overlay }: { card: PipelineCard; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });
  const style = transform && !overlay
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const content = (
    <div className="flex items-start gap-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
          {initialsOf(card.conversations?.contact_name ?? card.customers?.name ?? null)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-xs font-semibold truncate">{cardLabel(card)}</p>
        {cardSubtitle(card) && <p className="text-[11px] text-muted-foreground truncate">{cardSubtitle(card)}</p>}
        {card.conversation_id && (
          <Link to="/inbox" className="text-[10px] text-primary inline-flex items-center gap-1 mt-1">
            <MessageCircle className="h-3 w-3" /> Ver conversa
          </Link>
        )}
      </div>
    </div>
  );

  if (overlay) {
    return <div className="rounded-lg border bg-card p-3 shadow-lg">{content}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors touch-none"
    >
      {content}
    </div>
  );
}
