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
  balada:  { label: "Balada",        color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",  bar: "bg-purple-500"  },
  bar:     { label: "Bar descolado", color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",    bar: "bg-amber-500"   },
  rooftop: { label: "Rooftop",       color: "text-sky-600",     bg: "bg-sky-50 border-sky-200",        bar: "bg-sky-500"     },
  show:    { label: "Show ao vivo",  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" },
};

// Absolute event datetimes — São Paulo (UTC-3)
const EVENT_DATETIMES: Record<string, Date> = {
  "club-noir":   new Date("2026-05-08T23:00:00-03:00"),
  "bar-caju":    new Date("2026-05-09T20:00:00-03:00"),
  "terraco-360": new Date("2026-05-09T21:00:00-03:00"),
  "audio-club":  new Date("2026-05-09T22:00:00-03:00"),
};

const AMBIENTE_LABELS: Record<Ambiente, string> = {
  bar:    "bar tranquilo",
  happy:  "happy hour",
  balada: "balada",
  evento: "eventos especiais",
};

const INTENCAO_TEXT: Record<Intencao, string> = {
  amizade:     "novas amizades",
  social:      "ampliar o círculo social",
  romantico:   "algo romântico",
  experiencia: "novas experiências",
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-violet-600", "from-purple-500 to-purple-600",
  "from-sky-500 to-sky-600",       "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",     "from-amber-500 to-amber-600",
  "from-pink-500 to-pink-600",     "from-teal-500 to-teal-600",
];

const QUICK_ACTIONS = ["Estou indo 🚀", "Cheguei! 📍", "Vamos nos encontrar na entrada? 🚪"];

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
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setLabel("Já começou!"); return; }

      const totalMins = Math.floor(diff / 60000);
      const days  = Math.floor(totalMins / 1440);
      const hours = Math.floor((totalMins % 1440) / 60);
      const mins  = totalMins % 60;
      const timeStr = target.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const isToday = now.toDateString() === target.toDateString();

      if (days === 0 && isToday) {
        if (hours > 0) setLabel(`É hoje — faltam ${hours}h${mins > 0 ? `${mins}m` : ""}`);
        else setLabel(`É hoje — faltam ${mins}m`);
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
  id: string;
  name: string;
  isMe: boolean;
}

interface MessageData {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

type DisplayStatus = "forming" | "almost" | "waiting" | "partial" | "full";

interface GrupoData {
  group_id: string;
  event_id: string;
  status: "forming" | "complete";
  members: MemberData[];
  avgCompat: number;
  confirmations: string[];
  messages: MessageData[];
}

// ─── Display status ───────────────────────────────────────────────────────────

function getDisplayStatus(grupo: GrupoData): DisplayStatus {
  if (grupo.status === "forming") {
    return grupo.members.length >= 4 ? "almost" : "forming";
  }
  const c = grupo.confirmations.length;
  const m = grupo.members.length;
  if (c === 0) return "waiting";
  if (c >= m)  return "full";
  return "partial";
}

const STATUS_CONFIG: Record<DisplayStatus, { label: string; dot: string; badge: string }> = {
  forming:  { label: "Formando",              dot: "bg-amber-500 animate-pulse",  badge: "bg-amber-50 border-amber-200 text-amber-700"    },
  almost:   { label: "Quase completo",         dot: "bg-orange-500 animate-pulse", badge: "bg-orange-50 border-orange-200 text-orange-700" },
  waiting:  { label: "Aguardando confirmação", dot: "bg-blue-400",                 badge: "bg-blue-50 border-blue-200 text-blue-700"       },
  partial:  { label: "Confirmado",             dot: "bg-green-500",                badge: "bg-green-50 border-green-200 text-green-700"    },
  full:     { label: "Confirmado ✓",           dot: "bg-green-500",                badge: "bg-green-50 border-green-200 text-green-700"    },
};

// ─── Group explanation ────────────────────────────────────────────────────────

function gerarExplicacaoGrupo(members: MemberData[], avgCompat: number): string {
  const viable = members.filter((m) => isCompatComplete(m));
  if (viable.length < 2) {
    return "Grupo em formação — compatibilidade será calculada em breve.";
  }
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

// ─── Components ───────────────────────────────────────────────────────────────

function MemberAvatar({ member, confirmed }: { member: MemberData; confirmed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-14">
      <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(member.id)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 transition-all ${confirmed ? "ring-2 ring-green-400 ring-offset-1" : ""}`}>
        {getInitials(member.name)}
        {member.isMe ? (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 border-2 border-white flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" />
            </svg>
          </span>
        ) : confirmed ? (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
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

function ChatSection({
  grupo,
  currentUserId,
  nameMap,
  onSend,
}: {
  grupo: GrupoData;
  currentUserId: string;
  nameMap: Map<string, string>;
  onSend: (groupId: string, body: string) => Promise<void>;
}) {
  const [input, setInput]     = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [grupo.messages.length]);

  async function send(body: string) {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    await onSend(grupo.group_id, trimmed);
    setSending(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="border-t border-zinc-100">
      {/* Message list */}
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto px-5 py-4 scroll-smooth">
        {grupo.messages.length === 0 ? (
          <p className="text-center text-xs text-zinc-400 py-4">
            Nenhuma mensagem ainda. Seja o primeiro a falar!
          </p>
        ) : (
          grupo.messages.map((msg) => {
            const isMe = msg.user_id === currentUserId;
            const senderName = nameMap.get(msg.user_id) ?? "Usuário";
            return (
              <div key={msg.id} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="text-[10px] text-zinc-400 px-1">{senderName.split(" ")[0]}</span>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-violet-500 text-white rounded-tr-sm" : "bg-zinc-100 text-zinc-900 rounded-tl-sm"}`}>
                  {msg.body}
                </div>
                <span className="text-[10px] text-zinc-400 px-1">{formatTime(msg.created_at)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa}
            onClick={() => send(qa)}
            disabled={sending}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-violet-50 hover:text-violet-700 text-zinc-600 border border-zinc-200 hover:border-violet-200 transition-colors disabled:opacity-50"
          >
            {qa}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-5 pb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Mensagem..."
          maxLength={500}
          disabled={sending}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-violet-300 focus:bg-white transition-colors placeholder:text-zinc-400 disabled:opacity-60"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:bg-zinc-200 flex items-center justify-center transition-colors flex-shrink-0"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className={`w-4 h-4 ${input.trim() ? "text-white" : "text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function GrupoCard({
  grupo,
  currentUserId,
  nameMap,
  onToggleConfirm,
  onSendMessage,
}: {
  grupo: GrupoData;
  currentUserId: string;
  nameMap: Map<string, string>;
  onToggleConfirm: (groupId: string) => Promise<void>;
  onSendMessage: (groupId: string, body: string) => Promise<void>;
}) {
  const [chatOpen,   setChatOpen]   = useState(false);
  const [confirming, setConfirming] = useState(false);

  const meta          = EVENTO_META[grupo.event_id];
  const tipo          = meta ? TIPO_CONFIG[meta.tipo] : null;
  const displayStatus = getDisplayStatus(grupo);
  const statusCfg     = STATUS_CONFIG[displayStatus];
  const pct           = grupo.avgCompat;
  const isHigh        = pct >= 75;
  const isMid         = pct >= 55;
  const compatColor   = isHigh ? "text-violet-600" : isMid ? "text-emerald-600" : "text-amber-500";
  const compatBg      = isHigh ? "bg-violet-50 border-violet-200" : isMid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200";

  const sortedMembers  = [...grupo.members].sort((a) => (a.isMe ? -1 : 1));
  const isMeConfirmed  = grupo.confirmations.includes(currentUserId);
  const confirmCount   = grupo.confirmations.length;
  const memberCount    = grupo.members.length;
  const countdown      = useCountdown(grupo.event_id);
  const isComplete     = grupo.status === "complete";

  async function handleConfirm() {
    setConfirming(true);
    await onToggleConfirm(grupo.group_id);
    setConfirming(false);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
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
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>

            <h2 className="text-lg font-black text-zinc-900 truncate">{meta?.nome ?? grupo.event_id}</h2>

            <div className="flex items-center gap-3 flex-wrap">
              {meta && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {meta.local}
                </span>
              )}
              {countdown && (
                <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
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
              <span className="text-[10px] text-zinc-400 font-medium leading-tight">compat.</span>
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-100" />

        {/* Members */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {memberCount} membro{memberCount !== 1 ? "s" : ""}
            </p>
            {isComplete && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {confirmCount}/{memberCount} confirmado{confirmCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {sortedMembers.map((m) => (
              <MemberAvatar
                key={m.id}
                member={m}
                confirmed={grupo.confirmations.includes(m.id)}
              />
            ))}
          </div>
        </div>

        {/* Explanation */}
        <p className="text-zinc-500 text-xs leading-relaxed bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
          {gerarExplicacaoGrupo(grupo.members, pct)}
        </p>

        {/* Actions (only for complete groups) */}
        {isComplete && (
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                isMeConfirmed
                  ? "bg-green-50 border border-green-200 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  : "bg-violet-500 hover:bg-violet-400 text-white shadow-md shadow-violet-500/20 hover:-translate-y-0.5"
              }`}
            >
              {confirming ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isMeConfirmed ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirmar presença
                </>
              )}
            </button>

            <button
              onClick={() => setChatOpen((v) => !v)}
              className={`relative flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                chatOpen
                  ? "bg-zinc-900 border-zinc-900 text-white"
                  : "bg-white border-zinc-200 text-zinc-700 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
              {grupo.messages.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {grupo.messages.length > 9 ? "9+" : grupo.messages.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Chat */}
      {chatOpen && isComplete && (
        <ChatSection
          grupo={grupo}
          currentUserId={currentUserId}
          nameMap={nameMap}
          onSend={onSendMessage}
        />
      )}
    </div>
  );
}

function EmptyGruposState() {
  return (
    <div className="flex flex-col items-center gap-6 py-14 px-6 text-center bg-white border border-zinc-200 rounded-2xl">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <div>
        <p className="text-zinc-900 font-bold text-lg">Você ainda não está em nenhum grupo</p>
        <p className="text-zinc-500 text-sm mt-1.5 max-w-xs leading-relaxed">
          Quando você clicar em &quot;Quero ir em grupo&quot; nos eventos, o SOLO forma um grupo compatível para você.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-left">
          <span className="text-base mt-0.5 flex-shrink-0">1️⃣</span>
          <p className="text-zinc-600 text-xs leading-relaxed">Acesse eventos e clique em <strong>&quot;Quero ir em grupo&quot;</strong></p>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-left">
          <span className="text-base mt-0.5 flex-shrink-0">2️⃣</span>
          <p className="text-zinc-600 text-xs leading-relaxed">O SOLO encontra pessoas compatíveis no mesmo evento</p>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-left">
          <span className="text-base mt-0.5 flex-shrink-0">3️⃣</span>
          <p className="text-violet-700 text-xs leading-relaxed">Seu grupo aparece aqui para confirmar e coordenar o encontro</p>
        </div>
      </div>
      <Link
        href="/eventos"
        className="mt-1 px-6 py-3 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
      >
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [nameMap,       setNameMap]       = useState<Map<string, string>>(new Map());
  const groupIdsRef = useRef<string[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.onboarding_completed && !isCompatComplete(profile)) {
        router.replace("/onboarding-compat"); return;
      }

      setCurrentUserId(user.id);

      const { data: myMemberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (!myMemberships || myMemberships.length === 0) { setReady(true); return; }

      const groupIds = myMemberships.map((m: { group_id: string }) => m.group_id);
      groupIdsRef.current = groupIds;

      const [
        { data: groupsData },
        { data: allMembers },
        { data: confirmationsData },
        { data: messagesData },
      ] = await Promise.all([
        supabase.from("groups").select("id, event_id, status").in("id", groupIds),
        supabase.from("group_members").select("group_id, user_id").in("group_id", groupIds),
        supabase.from("group_confirmations").select("group_id, user_id").in("group_id", groupIds),
        supabase.from("group_messages")
          .select("id, group_id, user_id, body, created_at")
          .in("group_id", groupIds)
          .order("created_at", { ascending: true })
          .limit(100),
      ]);

      if (!groupsData || groupsData.length === 0) { setReady(true); return; }

      const allMemberIds = [...new Set((allMembers ?? []).map((m: { user_id: string }) => m.user_id))];

      const { data: rawProfiles } = await supabase
        .from("profiles")
        .select("user_id, vibe, energia, grupo, ambiente, intencao, social_behavior")
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

      const result: GrupoData[] = (groupsData as { id: string; event_id: string; status: string }[]).map((g) => {
        const memberRows = (allMembers ?? []).filter((m: { group_id: string }) => m.group_id === g.id);
        const members: MemberData[] = memberRows.map((m: { group_id: string; user_id: string }) => {
          const p = profileMap.get(m.user_id);
          return {
            user_id: m.user_id, id: m.user_id,
            name: nm.get(m.user_id) ?? "Usuário",
            isMe: m.user_id === user.id,
            vibe: p?.vibe ?? null, energia: p?.energia ?? null,
            grupo: p?.grupo ?? null, ambiente: p?.ambiente ?? null,
            intencao: p?.intencao ?? null, social_behavior: p?.social_behavior ?? null,
          };
        });

        return {
          group_id: g.id,
          event_id: g.event_id,
          status: g.status as "forming" | "complete",
          members,
          avgCompat: calcGroupAvgCompat(members.filter(isCompatComplete) as CompatUser[]),
          confirmations: (confirmationsData ?? [])
            .filter((c: { group_id: string }) => c.group_id === g.id)
            .map((c: { user_id: string }) => c.user_id),
          messages: ((messagesData ?? []) as MessageData[])
            .filter((msg) => (msg as unknown as { group_id: string }).group_id === g.id),
        };
      });

      setGrupos(result);
      setReady(true);
    }
    init();
  }, [router]);

  // Realtime: subscribe to new messages after data is loaded
  useEffect(() => {
    if (!currentUserId || groupIdsRef.current.length === 0) return;

    const channel = supabase
      .channel("grupos-messages-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages" },
        (payload) => {
          const msg = payload.new as MessageData & { group_id: string };
          if (!groupIdsRef.current.includes(msg.group_id)) return;
          setGrupos((prev) =>
            prev.map((g) =>
              g.group_id === msg.group_id
                ? { ...g, messages: [...g.messages.filter((m) => m.id !== msg.id), { id: msg.id, user_id: msg.user_id, body: msg.body, created_at: msg.created_at }] }
                : g
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, ready]);

  const handleToggleConfirm = useCallback(async (groupId: string) => {
    if (!currentUserId) return;
    setGrupos((prev) => {
      const grupo = prev.find((g) => g.group_id === groupId);
      if (!grupo) return prev;
      const isMeConfirmed = grupo.confirmations.includes(currentUserId);
      // Optimistic update
      return prev.map((g) =>
        g.group_id !== groupId ? g : {
          ...g,
          confirmations: isMeConfirmed
            ? g.confirmations.filter((id) => id !== currentUserId)
            : [...g.confirmations, currentUserId],
        }
      );
    });
    // Persist
    const grupo = grupos.find((g) => g.group_id === groupId);
    if (!grupo) return;
    if (grupo.confirmations.includes(currentUserId)) {
      await supabase.from("group_confirmations").delete().eq("group_id", groupId).eq("user_id", currentUserId);
    } else {
      await supabase.from("group_confirmations").insert({ group_id: groupId, user_id: currentUserId });
    }
  }, [currentUserId, grupos]);

  const handleSendMessage = useCallback(async (groupId: string, body: string) => {
    if (!currentUserId) return;
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: MessageData = { id: optimisticId, user_id: currentUserId, body, created_at: new Date().toISOString() };
    setGrupos((prev) =>
      prev.map((g) => g.group_id === groupId ? { ...g, messages: [...g.messages, optimistic] } : g)
    );
    const { data } = await supabase
      .from("group_messages")
      .insert({ group_id: groupId, user_id: currentUserId, body })
      .select()
      .single();
    if (data) {
      setGrupos((prev) =>
        prev.map((g) =>
          g.group_id === groupId
            ? { ...g, messages: g.messages.map((m) => m.id === optimisticId ? (data as MessageData) : m) }
            : g
        )
      );
    }
  }, [currentUserId]);

  const totalMembros = grupos.reduce((acc, g) => acc + g.members.filter((m) => !m.isMe).length, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">Sua rede</span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 mt-3 mb-3" style={{ letterSpacing: "-0.02em" }}>
            Seus <span className="text-violet-500">Grupos</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-md">
            Acompanhe, confirme presença e converse antes de ir.
          </p>
        </div>

        {!ready ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-400">Carregando seus grupos...</p>
          </div>
        ) : grupos.length === 0 ? (
          <EmptyGruposState />
        ) : (
          <>
            {totalMembros > 0 && (
              <div className="flex items-center gap-3 mb-8 px-4 py-3.5 bg-violet-50 border border-violet-200 rounded-2xl">
                <div className="flex -space-x-2">
                  {grupos.flatMap((g) => g.members.filter((m) => !m.isMe)).slice(0, 4).map((m) => (
                    <div key={`${m.id}-stack`} className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(m.id)} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(m.name)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-violet-700">
                  <span className="font-bold text-violet-600">{totalMembros}</span>{" "}
                  pessoa{totalMembros !== 1 ? "s" : ""} em{" "}
                  <span className="font-bold">{grupos.length}</span> grupo{grupos.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {grupos.map((g) => (
                <GrupoCard
                  key={g.group_id}
                  grupo={g}
                  currentUserId={currentUserId!}
                  nameMap={nameMap}
                  onToggleConfirm={handleToggleConfirm}
                  onSendMessage={handleSendMessage}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
