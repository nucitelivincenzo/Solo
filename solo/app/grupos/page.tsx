"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isCompatComplete } from "@/lib/types";
import type { Ambiente, Intencao } from "@/lib/types";
import { calcGroupAvgCompat, type CompatUser } from "@/lib/groups";
import { Navbar } from "@/components/Navbar";

// ─── Static data ──────────────────────────────────────────────────────────────

type EventType = "balada" | "bar" | "rooftop" | "show";

const EVENTO_META: Record<string, { tipo: EventType; emoji: string; nome: string; local: string }> = {
  "club-noir":   { tipo: "balada",  emoji: "🎉", nome: "Club Noir",   local: "Pinheiros"     },
  "bar-caju":    { tipo: "bar",     emoji: "🍹", nome: "Bar Caju",    local: "Vila Madalena" },
  "terraco-360": { tipo: "rooftop", emoji: "🌆", nome: "Terraço 360", local: "Itaim Bibi"    },
  "audio-club":  { tipo: "show",    emoji: "🎸", nome: "Audio Club",  local: "Barra Funda"   },
};

const TIPO_CONFIG: Record<EventType, { label: string; color: string; bg: string; bar: string }> = {
  balada:  { label: "Balada",        color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",      bar: "bg-rose-500"    },
  bar:     { label: "Bar descolado", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",    bar: "bg-amber-500"   },
  rooftop: { label: "Rooftop",       color: "text-sky-400",     bg: "bg-sky-500/10 border-sky-500/20",        bar: "bg-sky-500"     },
  show:    { label: "Show ao vivo",  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-500" },
};

// Absolute datetimes São Paulo (UTC-3)
const EVENT_DATETIMES: Record<string, Date> = {
  "club-noir":   new Date("2026-05-08T23:00:00-03:00"),
  "bar-caju":    new Date("2026-05-09T20:00:00-03:00"),
  "terraco-360": new Date("2026-05-09T21:00:00-03:00"),
  "audio-club":  new Date("2026-05-09T22:00:00-03:00"),
};

const EVENT_DURATION_MS = 4 * 3600 * 1000;

const AMBIENTE_LABELS: Record<Ambiente, string> = {
  bar:    "bar tranquilo", happy:  "happy hour",
  balada: "balada",        evento: "eventos especiais",
};

const INTENCAO_TEXT: Record<Intencao, string> = {
  amizade:     "novas amizades",   social:      "ampliar o círculo social",
  romantico:   "algo romântico",   experiencia: "novas experiências",
};

const AVATAR_GRADIENTS = [
  "from-amber-600 to-amber-700",   "from-orange-600 to-orange-700",
  "from-sky-500 to-sky-600",       "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",     "from-zinc-500 to-zinc-600",
  "from-pink-500 to-pink-600",     "from-teal-500 to-teal-600",
];

const QUICK_ACTIONS = ["Estou indo 🚀", "Cheguei! 📍", "Nos encontramos na entrada? 🚪"];

function avatarGradient(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  return name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(eventId: string): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const target = EVENT_DATETIMES[eventId];
    if (!target) { setLabel(""); return; }
    function compute() {
      const now  = new Date();
      const diff = target.getTime() - now.getTime();
      const end  = new Date(target.getTime() + EVENT_DURATION_MS);
      if (now >= end)    { setLabel("Evento encerrado"); return; }
      if (diff <= 0)     { setLabel("Em andamento agora"); return; }
      const totalMins = Math.floor(diff / 60000);
      const days  = Math.floor(totalMins / 1440);
      const hours = Math.floor((totalMins % 1440) / 60);
      const mins  = totalMins % 60;
      const timeStr = target.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const isToday = now.toDateString() === target.toDateString();
      if (days === 0 && isToday) {
        setLabel(hours > 0 ? `É hoje — faltam ${hours}h${mins > 0 ? `${mins}m` : ""}` : `É hoje — faltam ${mins}m`);
      } else if (days <= 1) {
        setLabel(`Amanhã às ${timeStr}`);
      } else {
        setLabel(`Em ${days} dias`);
      }
    }
    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, [eventId]);
  return label;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberData extends CompatUser {
  id: string; name: string; isMe: boolean;
}

interface MessageData {
  id: string; user_id: string; body: string; created_at: string;
}

interface ConfirmationEntry {
  user_id: string; confirmed_at: string;
}

interface CheckinEntry {
  user_id: string; checked_in_at: string;
}

type LiveStatus = "forming" | "almost" | "waiting" | "confirmed" | "live" | "ended";

interface GrupoData {
  group_id: string;
  event_id: string;
  status: "forming" | "complete";
  members: MemberData[];
  avgCompat: number;
  confirmations: ConfirmationEntry[];
  checkins: CheckinEntry[];
  messages: MessageData[];
  myFeedback: { rating: number; comment: string | null } | null;
}

// ─── Live status ──────────────────────────────────────────────────────────────

function getLiveStatus(grupo: GrupoData): LiveStatus {
  const eventDate = EVENT_DATETIMES[grupo.event_id];
  const now = new Date();
  if (eventDate) {
    const end = new Date(eventDate.getTime() + EVENT_DURATION_MS);
    if (now >= end)        return "ended";
    if (now >= eventDate)  return "live";
  }
  if (grupo.status === "forming") return grupo.members.length >= 4 ? "almost" : "forming";
  if (grupo.confirmations.length === 0) return "waiting";
  return "confirmed";
}

const LIVE_STATUS_CONFIG: Record<LiveStatus, { label: string; dot: string; badge: string; cardRing?: string }> = {
  forming:   { label: "Formando",              dot: "bg-amber-500",   badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",    cardRing: "" },
  almost:    { label: "Quase completo",         dot: "bg-orange-500",  badge: "bg-orange-500/10 border-orange-500/20 text-orange-400", cardRing: "" },
  waiting:   { label: "Aguardando confirmação", dot: "bg-zinc-400",    badge: "bg-white/5 border-white/10 text-zinc-400",              cardRing: "" },
  confirmed: { label: "Confirmado",             dot: "bg-green-500",   badge: "bg-green-500/10 border-green-500/20 text-green-400",    cardRing: "" },
  live:      { label: "Em andamento",           dot: "bg-amber-400",   badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",    cardRing: "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10" },
  ended:     { label: "Finalizado",             dot: "bg-zinc-500",    badge: "bg-white/5 border-white/10 text-zinc-500",              cardRing: "" },
};

// ─── Group explanation ────────────────────────────────────────────────────────

function gerarExplicacaoGrupo(members: MemberData[], avgCompat: number): string {
  const viable = members.filter(isCompatComplete);
  if (viable.length < 2) return "Grupo em formação — compatibilidade será calculada em breve.";
  const ambientes = viable.map((m) => m.ambiente);
  const intencoes = viable.map((m) => m.intencao);
  const allSameAmbiente = ambientes.every((a) => a && a === ambientes[0]);
  const allSameIntencao = intencoes.every((i) => i && i === intencoes[0]);
  if (allSameAmbiente && allSameIntencao && ambientes[0] && intencoes[0]) {
    return `Todos preferem ${AMBIENTE_LABELS[ambientes[0] as Ambiente]} e buscam ${INTENCAO_TEXT[intencoes[0] as Intencao]}.`;
  }
  if (allSameIntencao && intencoes[0]) return `Todos buscam ${INTENCAO_TEXT[intencoes[0] as Intencao]}.`;
  if (allSameAmbiente && ambientes[0]) return `Todos preferem ${AMBIENTE_LABELS[ambientes[0] as Ambiente]}.`;
  if (avgCompat >= 75) return "Alta afinidade social e objetivos alinhados.";
  if (avgCompat >= 60) return "Boa compatibilidade de perfil e estilo de noite.";
  return "Grupo formado por complementaridade social.";
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineEvent = {
  type: "confirmed" | "checkin" | "event_start" | "event_end";
  user_id?: string;
  at: string;
};

function buildTimeline(grupo: GrupoData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  grupo.confirmations.forEach((c) => events.push({ type: "confirmed", user_id: c.user_id, at: c.confirmed_at }));
  grupo.checkins.forEach((c) => events.push({ type: "checkin", user_id: c.user_id, at: c.checked_in_at }));
  const eventDate = EVENT_DATETIMES[grupo.event_id];
  const now = new Date();
  if (eventDate && now >= eventDate) events.push({ type: "event_start", at: eventDate.toISOString() });
  const endDate = eventDate ? new Date(eventDate.getTime() + EVENT_DURATION_MS) : null;
  if (endDate && now >= endDate) events.push({ type: "event_end", at: endDate.toISOString() });
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()).slice(-8);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Components ───────────────────────────────────────────────────────────────

function MemberAvatar({ member, confirmed, checkedIn }: { member: MemberData; confirmed: boolean; checkedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-14">
      <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(member.id)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 transition-all duration-300 ${checkedIn ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#050506]" : confirmed ? "ring-2 ring-green-400 ring-offset-1 ring-offset-[#050506]" : ""}`}>
        {getInitials(member.name)}
        {member.isMe ? (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-600 border-2 border-[#050506] flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
            </svg>
          </span>
        ) : checkedIn ? (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050506] flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
        ) : confirmed ? (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#050506] flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : null}
      </div>
      <span className="text-xs text-zinc-500 text-center leading-tight w-full truncate">
        {member.isMe ? "Você" : member.name.split(" ")[0]}
      </span>
    </div>
  );
}

function TimelineSection({ grupo, nameMap }: { grupo: GrupoData; nameMap: Map<string, string> }) {
  const events = buildTimeline(grupo);
  if (events.length === 0) return null;

  const CFG = {
    confirmed:   { icon: "✓", bg: "bg-green-500/15 text-green-400",    getLabel: (uid: string) => `${nameMap.get(uid)?.split(" ")[0] ?? "Alguém"} confirmou presença` },
    checkin:     { icon: "📍", bg: "bg-emerald-500/15 text-emerald-400", getLabel: (uid: string) => `${nameMap.get(uid)?.split(" ")[0] ?? "Alguém"} chegou ao local` },
    event_start: { icon: "✦", bg: "bg-amber-500/15 text-amber-400",     getLabel: () => "Evento iniciado" },
    event_end:   { icon: "◼", bg: "bg-white/10 text-zinc-500",          getLabel: () => "Evento encerrado" },
  };

  return (
    <div>
      <p className="text-zinc-500 uppercase mb-3" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>Atividade</p>
      <div className="flex flex-col">
        {events.map((ev, i) => {
          const cfg = CFG[ev.type];
          return (
            <div key={i} className="flex items-center gap-3 relative">
              {i < events.length - 1 && <div className="absolute left-3.5 top-7 bottom-0 w-px bg-white/10" />}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 ${cfg.bg}`}>
                {cfg.icon}
              </div>
              <div className="flex items-center justify-between flex-1 py-2 min-w-0">
                <span className="text-xs text-zinc-400 truncate">{cfg.getLabel(ev.user_id ?? "")}</span>
                <span className="text-[10px] text-zinc-500 flex-shrink-0 ml-2">{fmtTime(ev.at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatSection({
  grupo, currentUserId, nameMap, onSend, readOnly,
}: {
  grupo: GrupoData; currentUserId: string; nameMap: Map<string, string>;
  onSend: (groupId: string, body: string) => Promise<void>; readOnly: boolean;
}) {
  const [input, setInput]     = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [grupo.messages.length]);

  async function send(body: string) {
    const trimmed = body.trim();
    if (!trimmed || sending || readOnly) return;
    setSending(true); setInput("");
    await onSend(grupo.group_id, trimmed);
    setSending(false);
  }

  return (
    <div className="border-t border-white/10">
      {readOnly && (
        <div className="flex items-center gap-2 px-5 py-3 bg-white/5 border-b border-white/5">
          <svg className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs text-zinc-500">Chat encerrado — somente leitura</span>
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto px-5 py-4">
        {grupo.messages.length === 0 ? (
          <p className="text-center text-xs text-zinc-500 py-4">
            {readOnly ? "Nenhuma mensagem foi enviada." : "Nenhuma mensagem ainda. Seja o primeiro!"}
          </p>
        ) : grupo.messages.map((msg) => {
          const isMe = msg.user_id === currentUserId;
          const senderName = nameMap.get(msg.user_id) ?? "Usuário";
          return (
            <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && <span className="text-[10px] text-zinc-500 px-1">{senderName.split(" ")[0]}</span>}
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-gradient-to-br from-[#C94A1E] to-[#7A2540] text-white rounded-tr-sm" : "bg-white/10 text-[#FAFAFA] rounded-tl-sm"}`}>
                {msg.body}
              </div>
              <span className="text-[10px] text-zinc-500 px-1">{fmtTime(msg.created_at)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!readOnly && (
        <>
          <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
            {QUICK_ACTIONS.map((qa) => (
              <button key={qa} onClick={() => send(qa)} disabled={sending}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/[0.09] hover:text-zinc-200 text-zinc-400 border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50 active:scale-95">
                {qa}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-5 pb-5">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Mensagem..." maxLength={500} disabled={sending}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[#FAFAFA] focus:outline-none focus:border-white/25 focus:bg-white/[0.08] transition-colors placeholder:text-zinc-600 disabled:opacity-60" />
            <button onClick={() => send(input)} disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] disabled:opacity-40 disabled:bg-none disabled:bg-white/10 flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0">
              {sending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <svg className={`w-4 h-4 ${input.trim() ? "text-white" : "text-zinc-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FeedbackSection({ grupo, onSubmit }: {
  grupo: GrupoData; onSubmit: (groupId: string, rating: number, comment: string) => Promise<void>;
}) {
  const [rating,     setRating]     = useState(0);
  const [hovered,    setHovered]    = useState(0);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (grupo.myFeedback) {
    return (
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-green-400">Avaliação enviada</p>
            <p className="text-xs text-green-400/70 mt-0.5">
              {"★".repeat(grupo.myFeedback.rating)}{"☆".repeat(5 - grupo.myFeedback.rating)}
              {grupo.myFeedback.comment && ` · ${grupo.myFeedback.comment}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    await onSubmit(grupo.group_id, rating, comment);
    setSubmitting(false);
  }

  const display = hovered || rating;

  return (
    <div className="border-t border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent px-5 py-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold text-[#FAFAFA]">Como foi sua experiência?</p>
        <p className="text-xs text-[#A1A1AA] mt-0.5">Avalie o encontro com seu grupo</p>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
            className="transition-all duration-100 active:scale-90 hover:scale-110 touch-manipulation">
            <svg className={`w-9 h-9 transition-colors duration-100 ${display >= star ? "text-amber-400" : "text-white/15"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <input value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Deixe um comentário (opcional)..." maxLength={200}
          className="text-sm px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[#FAFAFA] focus:outline-none focus:border-white/25 transition-colors placeholder:text-zinc-600" />
      )}
      {rating > 0 && (
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-md shadow-black/20 solo-shimmer-btn">
          {submitting
            ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enviando...</span>
            : "Enviar avaliação"}
        </button>
      )}
    </div>
  );
}

function EndedSummary({ grupo }: { grupo: GrupoData }) {
  const checkinCount = grupo.checkins.length;
  const memberCount  = grupo.members.length;
  const pct          = grupo.avgCompat;
  return (
    <div className="mx-5 mb-5 bg-white/5 border border-white/5 rounded-xl px-4 py-4 flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resumo do encontro</p>
      <div className="flex gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-black text-[#FAFAFA] tabular-nums">{checkinCount}/{memberCount}</span>
          <span className="text-xs text-zinc-500">compareceram</span>
        </div>
        {pct > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl font-black text-amber-400 tabular-nums">{pct}%</span>
            <span className="text-xs text-zinc-500">compatibilidade</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GrupoCard({
  grupo, currentUserId, nameMap, onToggleConfirm, onCheckin, onSendMessage, onFeedback,
}: {
  grupo: GrupoData; currentUserId: string; nameMap: Map<string, string>;
  onToggleConfirm: (groupId: string) => Promise<void>;
  onCheckin: (groupId: string) => Promise<void>;
  onSendMessage: (groupId: string, body: string) => Promise<void>;
  onFeedback: (groupId: string, rating: number, comment: string) => Promise<void>;
}) {
  const [chatOpen,      setChatOpen]      = useState(false);
  const [confirming,    setConfirming]    = useState(false);
  const [checkingIn,    setCheckingIn]    = useState(false);
  const [showTimeline,  setShowTimeline]  = useState(false);

  const meta          = EVENTO_META[grupo.event_id];
  const tipo          = meta ? TIPO_CONFIG[meta.tipo] : null;
  const liveStatus    = getLiveStatus(grupo);
  const statusCfg     = LIVE_STATUS_CONFIG[liveStatus];
  const pct           = grupo.avgCompat;
  const compatColor   = pct >= 75 ? "text-amber-400" : pct >= 55 ? "text-emerald-400" : "text-zinc-300";
  const compatBg      = pct >= 75 ? "bg-amber-500/10 border-amber-500/20" : pct >= 55 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/[0.06] border-white/[0.10]";

  const sortedMembers  = [...grupo.members].sort((a, b) => (a.isMe ? -1 : b.isMe ? 1 : 0));
  const isMeConfirmed  = grupo.confirmations.some((c) => c.user_id === currentUserId);
  const isMeCheckedIn  = grupo.checkins.some((c) => c.user_id === currentUserId);
  const confirmCount   = grupo.confirmations.length;
  const checkinCount   = grupo.checkins.length;
  const memberCount    = grupo.members.length;
  const countdown      = useCountdown(grupo.event_id);
  const isComplete     = grupo.status === "complete";
  const isLive         = liveStatus === "live";
  const isEnded        = liveStatus === "ended";
  const hasTimeline    = buildTimeline(grupo).length > 0;

  async function handleConfirm() { setConfirming(true); await onToggleConfirm(grupo.group_id); setConfirming(false); }
  async function handleCheckin()  { if (isMeCheckedIn) return; setCheckingIn(true); await onCheckin(grupo.group_id); setCheckingIn(false); }

  return (
    <div className={`border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 ${statusCfg.cardRing}`} style={{ background: "rgba(255,255,255,0.04)" }}>
      {tipo && <div className={`h-1 w-full ${tipo.bar}`} />}

      <div className="p-5 sm:p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {meta && tipo && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tipo.bg} ${tipo.color}`}>
                  {meta.emoji} {tipo.label}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}>
                {isLive ? (
                  <span className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot} ${liveStatus === "forming" || liveStatus === "almost" ? "animate-pulse" : ""}`} />
                )}
                {statusCfg.label}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#FAFAFA] truncate">{meta?.nome ?? grupo.event_id}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {meta && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {meta.local}
                </span>
              )}
              {countdown && !isEnded && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${isLive ? "text-amber-400" : "text-zinc-500"}`}>
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {countdown}
                </span>
              )}
            </div>
          </div>
          {pct > 0 && (
            <div className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl border ${compatBg}`}>
              <span className={`text-xl font-black leading-none tabular-nums ${compatColor}`}>{pct}%</span>
              <span className="text-[10px] text-zinc-500 font-medium leading-tight">compat.</span>
            </div>
          )}
        </div>

        <div className="h-px bg-white/10" />

        {/* Members */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-y-1">
            <p className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>
              {memberCount} membro{memberCount !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-3">
              {isComplete && confirmCount > 0 && (
                <span className="text-[10px] text-zinc-500">{confirmCount}/{memberCount} confirmado{confirmCount !== 1 ? "s" : ""}</span>
              )}
              {checkinCount > 0 && (
                <span className="text-[10px] font-semibold text-emerald-400">{checkinCount} chegou{checkinCount !== 1 ? "ram" : ""}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {sortedMembers.map((m) => (
              <MemberAvatar key={m.id} member={m}
                confirmed={grupo.confirmations.some((c) => c.user_id === m.id)}
                checkedIn={grupo.checkins.some((c) => c.user_id === m.id)} />
            ))}
          </div>
        </div>

        {/* Explanation */}
        {!isEnded && (
          <p className="text-[#A1A1AA] text-xs leading-relaxed bg-white/5 border border-white/5 rounded-xl px-3 py-2.5">
            {gerarExplicacaoGrupo(grupo.members, pct)}
          </p>
        )}

        {/* Timeline toggle */}
        {hasTimeline && (
          <button onClick={() => setShowTimeline((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit active:scale-95">
            <svg className={`w-3 h-3 transition-transform duration-200 ${showTimeline ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showTimeline ? "Ocultar atividade" : "Ver atividade"}
          </button>
        )}

        {showTimeline && <TimelineSection grupo={grupo} nameMap={nameMap} />}

        {/* Action buttons — active groups */}
        {isComplete && !isEnded && (
          <div className="flex gap-2.5 flex-wrap">
            {/* Check-in */}
            <button onClick={handleCheckin} disabled={isMeCheckedIn || checkingIn}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isMeCheckedIn
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-md shadow-emerald-500/20 hover:-translate-y-0.5 disabled:opacity-60"
              }`}>
              {checkingIn
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isMeCheckedIn
                  ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>No local</>
                  : <>📍 Cheguei</>}
            </button>

            {/* Confirm */}
            <button onClick={handleConfirm} disabled={confirming}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                isMeConfirmed
                  ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                  : "bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] text-white shadow-md shadow-black/20 hover:-translate-y-0.5"
              }`}>
              {confirming
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isMeConfirmed
                  ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Confirmado</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmar presença</>}
            </button>

            {/* Chat */}
            <button onClick={() => setChatOpen((v) => !v)}
              className={`relative flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95 ${chatOpen ? "bg-white/15 border-white/15 text-[#FAFAFA]" : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-300"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
              {grupo.messages.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {grupo.messages.length > 9 ? "9+" : grupo.messages.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Ended — just chat button */}
        {isEnded && (
          <button onClick={() => setChatOpen((v) => !v)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95 w-fit ${chatOpen ? "bg-white/15 border-white/15 text-[#FAFAFA]" : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ver mensagens
          </button>
        )}
      </div>

      {isEnded && <EndedSummary grupo={grupo} />}

      {chatOpen && (
        <ChatSection grupo={grupo} currentUserId={currentUserId} nameMap={nameMap}
          onSend={onSendMessage} readOnly={isEnded} />
      )}

      {isEnded && <FeedbackSection grupo={grupo} onSubmit={onFeedback} />}
    </div>
  );
}

function EmptyGruposState() {
  return (
    <div className="flex flex-col items-center gap-6 py-14 px-6 text-center border border-white/[0.08] rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.10] flex items-center justify-center">
        <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <div>
        <p className="text-[#FAFAFA] font-bold text-lg">Você ainda não está em nenhum grupo</p>
        <p className="text-[#A1A1AA] text-sm mt-1.5 max-w-xs leading-relaxed">
          Quando você clicar em &quot;Quero ir em grupo&quot; nos eventos, o SOLO forma um grupo compatível para você.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {[
          { icon: "1️⃣", text: <>Acesse eventos e clique em <strong>&quot;Quero ir em grupo&quot;</strong></>, violet: false },
          { icon: "2️⃣", text: <>O SOLO encontra pessoas compatíveis no mesmo evento</>, violet: false },
          { icon: "3️⃣", text: <>Confirme presença, faça check-in e avalie o encontro</>, violet: true },
        ].map(({ icon, text, violet }) => (
          <div key={icon} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-left border ${violet ? "bg-amber-500/[0.07] border-amber-500/20" : "bg-white/5 border-white/10"}`}>
            <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
            <p className={`text-xs leading-relaxed ${violet ? "text-amber-300" : "text-zinc-400"}`}>{text}</p>
          </div>
        ))}
      </div>
      <Link href="/eventos" className="mt-1 px-6 py-3 bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-black/20 hover:-translate-y-0.5 active:scale-95 solo-shimmer-btn">
        Ver eventos disponíveis →
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GruposPage() {
  const router = useRouter();
  const [grupos,        setGrupos]        = useState<GrupoData[]>([]);
  const [ready,         setReady]         = useState(false);
  const [initError,     setInitError]     = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [nameMap,       setNameMap]       = useState<Map<string, string>>(new Map());
  const groupIdsRef = useRef<string[]>([]);
  const gruposRef   = useRef<GrupoData[]>([]);

  useEffect(() => { gruposRef.current = grupos; }, [grupos]);

  useEffect(() => {
    async function init() {
      try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior")
        .eq("user_id", user.id).maybeSingle();

      if (profile?.onboarding_completed && !isCompatComplete(profile)) {
        router.replace("/onboarding-compat"); return;
      }

      setCurrentUserId(user.id);

      const { data: myMemberships } = await supabase
        .from("group_members").select("group_id").eq("user_id", user.id);

      if (!myMemberships || myMemberships.length === 0) { setReady(true); return; }

      const groupIds = myMemberships.map((m: { group_id: string }) => m.group_id);
      groupIdsRef.current = groupIds;

      const [
        { data: groupsData },
        { data: allMembers },
        { data: confirmationsData },
        { data: checkinsData },
        { data: messagesData },
        { data: feedbackData },
      ] = await Promise.all([
        supabase.from("groups").select("id, event_id, status").in("id", groupIds),
        supabase.from("group_members").select("group_id, user_id").in("group_id", groupIds),
        supabase.from("group_confirmations").select("group_id, user_id, confirmed_at").in("group_id", groupIds),
        supabase.from("group_checkins").select("group_id, user_id, checked_in_at").in("group_id", groupIds),
        supabase.from("group_messages").select("id, group_id, user_id, body, created_at").in("group_id", groupIds).order("created_at", { ascending: true }).limit(100),
        supabase.from("group_feedback").select("group_id, rating, comment").eq("user_id", user.id).in("group_id", groupIds),
      ]);

      if (!groupsData || groupsData.length === 0) { setReady(true); return; }

      const allMemberIds = [...new Set((allMembers ?? []).map((m: { user_id: string }) => m.user_id))];

      const { data: rawProfiles } = await supabase
        .from("profiles").select("user_id, vibe, energia, grupo, ambiente, intencao, social_behavior")
        .in("user_id", allMemberIds);

      const profileMap = new Map(
        ((rawProfiles as unknown as CompatUser[]) ?? []).map((p) => [p.user_id, p])
      );

      const nm = new Map<string, string>();
      nm.set(user.id, user.user_metadata?.name || user.email || "Você");
      try {
        const { data: names } = await supabase.rpc("get_user_names", { p_user_ids: allMemberIds });
        names?.forEach((n: { user_id: string; display_name: string }) => nm.set(n.user_id, n.display_name));
      } catch { /* RPC fallback */ }
      setNameMap(nm);

      type ConfRow   = { group_id: string; user_id: string; confirmed_at: string };
      type CkRow     = { group_id: string; user_id: string; checked_in_at: string };
      type MsgRow    = MessageData & { group_id: string };
      type FbRow     = { group_id: string; rating: number; comment: string | null };

      const result: GrupoData[] = (groupsData as { id: string; event_id: string; status: string }[]).map((g) => {
        const memberRows = (allMembers ?? []).filter((m: { group_id: string }) => m.group_id === g.id);
        const members: MemberData[] = memberRows.map((m: { group_id: string; user_id: string }) => {
          const p = profileMap.get(m.user_id);
          return {
            user_id: m.user_id, id: m.user_id, name: nm.get(m.user_id) ?? "Usuário",
            isMe: m.user_id === user.id,
            vibe: p?.vibe ?? null, energia: p?.energia ?? null, grupo: p?.grupo ?? null,
            ambiente: p?.ambiente ?? null, intencao: p?.intencao ?? null, social_behavior: p?.social_behavior ?? null,
          };
        });
        const fb = ((feedbackData ?? []) as FbRow[]).find((f) => f.group_id === g.id);
        return {
          group_id: g.id, event_id: g.event_id, status: g.status as "forming" | "complete",
          members,
          avgCompat: calcGroupAvgCompat(members.filter(isCompatComplete) as CompatUser[]),
          confirmations: ((confirmationsData ?? []) as ConfRow[])
            .filter((c) => c.group_id === g.id).map((c) => ({ user_id: c.user_id, confirmed_at: c.confirmed_at })),
          checkins: ((checkinsData ?? []) as CkRow[])
            .filter((c) => c.group_id === g.id).map((c) => ({ user_id: c.user_id, checked_in_at: c.checked_in_at })),
          messages: ((messagesData ?? []) as MsgRow[])
            .filter((m) => m.group_id === g.id).map(({ id, user_id, body, created_at }) => ({ id, user_id, body, created_at })),
          myFeedback: fb ? { rating: fb.rating, comment: fb.comment } : null,
        };
      });

      setGrupos(result);
      setReady(true);
      } catch (e: unknown) {
        setInitError(e instanceof Error ? e.message : "Erro ao carregar seus grupos.");
        setReady(true);
      }
    }
    init();
  }, [router]);

  // Realtime
  useEffect(() => {
    if (!currentUserId || !ready || groupIdsRef.current.length === 0) return;
    const channel = supabase.channel("grupos-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages" }, (payload) => {
        const msg = payload.new as MessageData & { group_id: string };
        if (!groupIdsRef.current.includes(msg.group_id)) return;
        setGrupos((prev) => prev.map((g) => g.group_id !== msg.group_id ? g : {
          ...g,
          messages: [...g.messages.filter((m) => m.id !== msg.id), { id: msg.id, user_id: msg.user_id, body: msg.body, created_at: msg.created_at }],
        }));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_checkins" }, (payload) => {
        const row = payload.new as CheckinEntry & { group_id: string };
        if (!groupIdsRef.current.includes(row.group_id)) return;
        setGrupos((prev) => prev.map((g) => g.group_id !== row.group_id ? g : {
          ...g,
          checkins: [...g.checkins.filter((c) => c.user_id !== row.user_id), { user_id: row.user_id, checked_in_at: row.checked_in_at }],
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, ready]);

  const handleToggleConfirm = useCallback(async (groupId: string) => {
    if (!currentUserId) return;
    const grupo = gruposRef.current.find((g) => g.group_id === groupId);
    if (!grupo) return;
    const isMeConfirmed = grupo.confirmations.some((c) => c.user_id === currentUserId);
    setGrupos((prev) => prev.map((g) => g.group_id !== groupId ? g : {
      ...g,
      confirmations: isMeConfirmed
        ? g.confirmations.filter((c) => c.user_id !== currentUserId)
        : [...g.confirmations, { user_id: currentUserId, confirmed_at: new Date().toISOString() }],
    }));
    if (isMeConfirmed) {
      await supabase.from("group_confirmations").delete().eq("group_id", groupId).eq("user_id", currentUserId);
    } else {
      await supabase.from("group_confirmations").insert({ group_id: groupId, user_id: currentUserId });
    }
  }, [currentUserId]);

  const handleCheckin = useCallback(async (groupId: string) => {
    if (!currentUserId) return;
    const now = new Date().toISOString();
    setGrupos((prev) => prev.map((g) => g.group_id !== groupId ? g : {
      ...g,
      checkins: [...g.checkins.filter((c) => c.user_id !== currentUserId), { user_id: currentUserId, checked_in_at: now }],
    }));
    await supabase.from("group_checkins").upsert(
      { group_id: groupId, user_id: currentUserId, checked_in_at: now },
      { onConflict: "group_id,user_id" }
    );
  }, [currentUserId]);

  const handleSendMessage = useCallback(async (groupId: string, body: string) => {
    if (!currentUserId) return;
    const optId = `opt-${Date.now()}`;
    setGrupos((prev) => prev.map((g) => g.group_id === groupId
      ? { ...g, messages: [...g.messages, { id: optId, user_id: currentUserId, body, created_at: new Date().toISOString() }] }
      : g
    ));
    const { data } = await supabase.from("group_messages").insert({ group_id: groupId, user_id: currentUserId, body }).select().single();
    if (data) {
      setGrupos((prev) => prev.map((g) => g.group_id === groupId
        ? { ...g, messages: g.messages.map((m) => m.id === optId ? (data as MessageData) : m) }
        : g
      ));
    }
  }, [currentUserId]);

  const handleFeedback = useCallback(async (groupId: string, rating: number, comment: string) => {
    if (!currentUserId) return;
    await supabase.from("group_feedback").upsert(
      { group_id: groupId, user_id: currentUserId, rating, comment: comment || null },
      { onConflict: "group_id,user_id" }
    );
    setGrupos((prev) => prev.map((g) => g.group_id === groupId ? { ...g, myFeedback: { rating, comment: comment || null } } : g));
  }, [currentUserId]);

  const totalMembros = grupos.reduce((acc, g) => acc + g.members.filter((m) => !m.isMe).length, 0);

  return (
    <div className="min-h-screen bg-[#050506] text-[#FAFAFA]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-10">
          <span className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>Sua rede</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#FAFAFA] mt-3 mb-3" style={{ letterSpacing: "-0.02em" }}>
            Seus{" "}
            <span className="text-[#F8FAFC]" style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic" }}>Grupos</span>
          </h1>
          <p className="text-[#A1A1AA] text-base max-w-md">Confirme, chegue, converse e avalie o encontro.</p>
        </div>

        {!ready ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-8 h-8 border-2 border-amber-500/40 border-t-[#C94A1E] rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Carregando seus grupos...</p>
          </div>
        ) : initError ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-[#FAFAFA] font-semibold text-sm">Algo deu errado</p>
            <p className="text-[#A1A1AA] text-xs max-w-xs">{initError}</p>
            <button onClick={() => window.location.reload()}
              className="mt-1 px-5 py-2.5 bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] text-white text-sm font-semibold rounded-xl transition-all duration-200 solo-shimmer-btn">
              Tentar novamente
            </button>
          </div>
        ) : grupos.length === 0 ? (
          <EmptyGruposState />
        ) : (
          <>
            {totalMembros > 0 && (
              <div className="flex items-center gap-3 mb-8 px-4 py-3.5 border border-white/[0.08] rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="flex -space-x-2">
                  {grupos.flatMap((g) => g.members.filter((m) => !m.isMe)).slice(0, 4).map((m) => (
                    <div key={`${m.id}-stack`} className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(m.id)} border-2 border-[#050506] flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(m.name)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-zinc-300">
                  <span className="font-bold">{totalMembros}</span>{" "}
                  pessoa{totalMembros !== 1 ? "s" : ""} em{" "}
                  <span className="font-bold">{grupos.length}</span> grupo{grupos.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-5">
              {grupos.map((g) => (
                <GrupoCard key={g.group_id} grupo={g} currentUserId={currentUserId!}
                  nameMap={nameMap} onToggleConfirm={handleToggleConfirm}
                  onCheckin={handleCheckin} onSendMessage={handleSendMessage}
                  onFeedback={handleFeedback} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
