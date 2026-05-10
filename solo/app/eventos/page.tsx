"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isCompatComplete } from "@/lib/types";
import type { Ambiente, Intencao } from "@/lib/types";
import { calcularMatch } from "@/lib/match";
import { tentarFormarGrupo } from "@/lib/groups";
import { Navbar } from "@/components/Navbar";

type EventType = "balada" | "bar";
type Ticket = "baixo" | "médio" | "alto";

interface Evento {
  id: string;
  nome: string;
  estabelecimento: string;
  bairro: string;
  tipo: EventType;
  tag: string;
  descricao: string;
  dia: string;
  horario: string;
  vagas: number;
  vibe: string;
  ticket: Ticket;
  beneficio: string;
}

const EVENTOS: Evento[] = [
  {
    id: "giro-bar",
    nome: "Happy hour no Giro",
    estabelecimento: "Giro Bar",
    bairro: "Pinheiros",
    tipo: "bar",
    tag: "Happy hour",
    descricao: "Bar em Pinheiros com drinks, aperitivos e clima descontraído para conhecer gente nova.",
    dia: "Quinta-feira",
    horario: "20h00",
    vagas: 10,
    vibe: "descontraído",
    ticket: "médio",
    beneficio: "Lista SOLO com entrada facilitada e grupo organizado por compatibilidade.",
  },
  {
    id: "piraja",
    nome: "Mesa SOLO no Pirajá",
    estabelecimento: "Pirajá",
    bairro: "Jardins",
    tipo: "bar",
    tag: "Bar casual",
    descricao: "Bar casual com comida, drinks e mesas perfeitas para socializar em grupo.",
    dia: "Sexta-feira",
    horario: "20h30",
    vagas: 8,
    vibe: "conversa",
    ticket: "médio",
    beneficio: "Reserva de mesa para grupo SOLO e curadoria de pessoas com interesses parecidos.",
  },
  {
    id: "villa-jk",
    nome: "Noite SOLO na Villa JK",
    estabelecimento: "Villa JK",
    bairro: "Itaim Bibi",
    tipo: "balada",
    tag: "Balada premium",
    descricao: "Balada premium no Itaim para quem busca uma noite mais intensa e exclusiva.",
    dia: "Sábado",
    horario: "23h00",
    vagas: 6,
    vibe: "alta energia",
    ticket: "alto",
    beneficio: "Lista SOLO, benefícios de entrada e organização de grupo antes da chegada.",
  },
];

const TIPO_CONFIG: Record<EventType, { emoji: string; color: string; bg: string; bar: string }> = {
  balada: { emoji: "🎉", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", bar: "bg-purple-500" },
  bar:    { emoji: "🍹", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20",   bar: "bg-amber-500"  },
};

const TICKET_CONFIG: Record<Ticket, { label: string; color: string; bg: string }> = {
  baixo: { label: "Ticket baixo", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  médio: { label: "Ticket médio", color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"     },
  alto:  { label: "Ticket alto",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"         },
};

// ─── Match ─────────────────────────────────────────────────────────────────────

interface MatchedUser {
  id: string;
  name: string;
  eventoNome: string;
  score: number;
  percentage: number;
  sameAmbiente: boolean;
  sameIntencao: boolean;
  vibeClose: boolean;
  energiaClose: boolean;
  grupoClose: boolean;
  sbClose: boolean;
  ambiente: Ambiente | null;
  intencao: Intencao | null;
}

type RawCompatRow = {
  user_id: string;
  vibe: number | null;
  energia: number | null;
  grupo: number | null;
  ambiente: Ambiente | null;
  intencao: Intencao | null;
  social_behavior: number | null;
};

function toCompat(p: RawCompatRow) {
  return {
    vibe: p.vibe, energia: p.energia, grupo: p.grupo,
    ambiente: p.ambiente, intencao: p.intencao, social_behavior: p.social_behavior,
  };
}

const AMBIENTE_LABELS: Record<Ambiente, string> = {
  bar:    "Bar tranquilo",
  happy:  "Happy hour",
  balada: "Balada",
  evento: "Evento especial",
};

const INTENCAO_BADGE: Record<Intencao, string> = {
  amizade:     "Amizades",
  social:      "Círculo social",
  romantico:   "Conexão romântica",
  experiencia: "Experiências",
};

const INTENCAO_TEXT: Record<Intencao, string> = {
  amizade:     "novas amizades",
  social:      "ampliar o círculo social",
  romantico:   "algo romântico",
  experiencia: "novas experiências",
};

const MATCH_GRADIENTS = [
  "from-violet-500 to-violet-600", "from-purple-500 to-purple-600",
  "from-sky-500 to-sky-600",       "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",     "from-amber-500 to-amber-600",
  "from-pink-500 to-pink-600",     "from-teal-500 to-teal-600",
];

function matchGradient(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return MATCH_GRADIENTS[sum % MATCH_GRADIENTS.length];
}

function matchInitials(name: string) {
  return name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";
}

function gerarExplicacao(user: MatchedUser): string {
  if (user.sameAmbiente && user.sameIntencao && user.ambiente && user.intencao) {
    return `Curtem ${AMBIENTE_LABELS[user.ambiente].toLowerCase()} e buscam ${INTENCAO_TEXT[user.intencao]} — uma combinação forte.`;
  }
  const partes: string[] = [];
  if (user.sameIntencao && user.intencao) partes.push(`buscam ${INTENCAO_TEXT[user.intencao]}`);
  if (user.sameAmbiente && user.ambiente)  partes.push(`curtem ${AMBIENTE_LABELS[user.ambiente].toLowerCase()}`);
  if (user.vibeClose && user.energiaClose) partes.push("têm vibe e energia compatíveis para a noite");
  else if (user.vibeClose)                 partes.push("têm uma vibe social bem parecida");
  else if (user.energiaClose)              partes.push("combinam no ritmo da noite");
  if (user.sbClose && partes.length < 2)   partes.push("se comportam de forma parecida em grupos");
  if (partes.length === 0) return "Têm alguns pontos em comum no estilo de noite.";
  if (partes.length === 1) return `Vocês ${partes[0]}.`;
  return `Vocês ${partes[0]} e ${partes[1]}.`;
}

function MatchCard({ user }: { user: MatchedUser }) {
  const pct = user.percentage;
  const isHigh = pct >= 80;
  const isMid  = pct >= 60;
  const pctColor   = isHigh ? "text-violet-400"  : isMid ? "text-emerald-400" : "text-amber-400";
  const cardBorder = isHigh ? "border-violet-500/20 hover:border-violet-500/40" : "border-white/10 hover:border-white/20";
  const badgeCls   = isHigh
    ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
    : isMid
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    : "bg-amber-500/10 border-amber-500/20 text-amber-400";
  const levelLabel = isHigh ? "Alta compatibilidade" : isMid ? "Boa conexão" : "Compatibilidade moderada";
  const badges: string[] = [];
  if (user.sameAmbiente && user.ambiente)  badges.push(AMBIENTE_LABELS[user.ambiente]);
  if (user.sameIntencao && user.intencao)  badges.push(INTENCAO_BADGE[user.intencao]);
  if (user.vibeClose)                      badges.push("Vibe parecida");
  if (user.energiaClose)                   badges.push("Mesma energia");
  if (user.sbClose && badges.length < 3)   badges.push("Estilo social próximo");

  return (
    <div className={`bg-[#18181B] border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 ${cardBorder}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${matchGradient(user.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
          {matchInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#FAFAFA] font-bold text-base truncate">{user.name.split(" ")[0]}</p>
          <p className="text-zinc-500 text-xs mt-0.5 truncate">{user.eventoNome}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-2xl font-black leading-none tabular-nums ${pctColor}`}>{pct}%</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeCls}`}>{levelLabel}</span>
        </div>
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              {b}
            </span>
          ))}
        </div>
      )}
      <p className="text-[#A1A1AA] text-xs leading-relaxed bg-white/5 border border-white/5 rounded-xl px-3 py-2.5">
        {gerarExplicacao(user)}
      </p>
    </div>
  );
}

function EmptyMatchState() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 px-6 text-center bg-[#18181B] border border-white/10 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
        <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <div>
        <p className="text-[#FAFAFA] font-bold text-base">Ainda sem matches</p>
        <p className="text-[#A1A1AA] text-sm mt-1.5 max-w-xs leading-relaxed">
          Quando outros participantes confirmados tiverem perfil compatível com o seu, eles aparecem aqui.
        </p>
      </div>
      <div className="flex items-start gap-3 w-full max-w-xs px-4 py-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-left">
        <span className="text-base mt-0.5 flex-shrink-0">✨</span>
        <p className="text-violet-400 text-xs leading-relaxed">Inscreva-se em mais eventos para aumentar suas chances de match</p>
      </div>
    </div>
  );
}

// ─── Free plan helpers ────────────────────────────────────────────────────────
// Tracks 1 active group inscription at a time. Cancelling liberates it.

interface FreeActiveGroup { eventId: string; eventNome: string; }

function getFreeActiveGroup(): FreeActiveGroup | null {
  try {
    const raw = localStorage.getItem("solo_free_active_group");
    return raw ? (JSON.parse(raw) as FreeActiveGroup) : null;
  } catch { return null; }
}

function setFreeActiveGroupLS(eventId: string, eventNome: string): void {
  localStorage.setItem("solo_free_active_group", JSON.stringify({ eventId, eventNome }));
}

function clearFreeActiveGroupLS(): void {
  localStorage.removeItem("solo_free_active_group");
}

// ─── FreeLimitModal ───────────────────────────────────────────────────────────

function FreeLimitModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm bg-[#18181B] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#FAFAFA] mb-1.5">
          Você já tem uma inscrição de grupo ativa.
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          Cancele sua inscrição atual para escolher outro rolê, ou conheça o Plus para entrar em até 3 grupos por semana.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/planos"
            className="w-full flex items-center justify-center py-3 rounded-xl bg-violet-500 hover:bg-violet-400 active:bg-violet-600 transition-colors text-white text-sm font-semibold"
            style={{ boxShadow: "0 0 20px rgba(139,92,246,0.25)" }}
          >
            Conhecer Plus →
          </Link>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-zinc-400 hover:text-zinc-300 text-sm font-medium"
          >
            Continuar no Free
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VillaJkModal ─────────────────────────────────────────────────────────────

function VillaJkModal({ onContinue, onClose }: { onContinue: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm bg-[#18181B] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#FAFAFA] mb-1.5">
          Villa JK é uma experiência mais disputada.
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          Usuários Plus e Black têm prioridade neste rolê. No plano Free, sua posição na fila pode ser mais baixa.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/planos"
            className="w-full flex items-center justify-center py-3 rounded-xl bg-violet-500 hover:bg-violet-400 active:bg-violet-600 transition-colors text-white text-sm font-semibold"
            style={{ boxShadow: "0 0 20px rgba(139,92,246,0.25)" }}
          >
            Conhecer Plus →
          </Link>
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-zinc-400 hover:text-zinc-300 text-sm font-medium"
          >
            Continuar no Free mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EventoCard ────────────────────────────────────────────────────────────────

function EventoCard({
  evento, interesseSimples, savingSimples, onQueroIr,
  interesseGrupo, savingGrupo, onQueroGrupo, onCancelarGrupo, cancelingGrupo,
}: {
  evento: Evento;
  interesseSimples: boolean;
  savingSimples: boolean;
  onQueroIr: (id: string) => void;
  interesseGrupo: boolean;
  savingGrupo: boolean;
  onQueroGrupo: (id: string) => void;
  onCancelarGrupo: (id: string) => void;
  cancelingGrupo: boolean;
}) {
  const tipo    = TIPO_CONFIG[evento.tipo];
  const tkt     = TICKET_CONFIG[evento.ticket];
  const urgente = evento.vagas <= 6;

  return (
    <div className={`bg-[#18181B] border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/20
      ${interesseGrupo ? "border-violet-500/40" : "border-white/10 hover:border-white/20"}`}>
      <div className={`h-1 w-full ${tipo.bar}`} />
      <div className="p-6 flex flex-col gap-5 flex-1">

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tipo.bg} ${tipo.color}`}>
            {tipo.emoji} {evento.tag}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {evento.estabelecimento} · {evento.bairro}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${tkt.bg} ${tkt.color}`}>
            {tkt.label}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-500">
            Vibe: {evento.vibe}
          </span>
          {interesseGrupo && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Você vai!
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-black text-[#FAFAFA] group-hover:text-violet-400 transition-colors">{evento.nome}</h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{evento.descricao}</p>
        </div>

        {/* Benefício SOLO */}
        <div className="flex items-start gap-2.5 px-3 py-2.5 bg-violet-500/5 border border-violet-500/15 rounded-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
          <p className="text-xs text-violet-300/80 leading-relaxed">{evento.beneficio}</p>
        </div>

        {/* Day + time */}
        <div className="flex items-center gap-4">
          {[
            { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", text: evento.dia },
            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: evento.horario },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-400 text-sm">
              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/10" />

        {/* Vagas + "Quero ir" (simple interest — no invite consumed) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${urgente ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
            <span className="text-sm font-semibold text-[#FAFAFA]">{evento.vagas} vagas <span className="text-zinc-500 font-normal">SOLO</span></span>
          </div>
          {interesseSimples ? (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium rounded-xl select-none">
              <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Demonstrei interesse
            </div>
          ) : (
            <button
              onClick={() => onQueroIr(evento.id)}
              disabled={savingSimples}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 hover:border-violet-500/30 hover:text-violet-400 text-zinc-300 text-xs font-medium rounded-xl transition-all duration-200"
            >
              {savingSimples ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Quero ir <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
              )}
            </button>
          )}
        </div>

        {/* "Quero ir em grupo" — uses 1 invite / grupo status + cancel */}
        {interesseGrupo ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-sm font-semibold select-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Na fila do grupo!
            </div>
            <button
              onClick={() => onCancelarGrupo(evento.id)}
              disabled={cancelingGrupo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 disabled:opacity-50 text-xs font-medium rounded-xl transition-all duration-200"
            >
              {cancelingGrupo ? (
                <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : "Sair deste rolê"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onQueroGrupo(evento.id)}
            disabled={savingGrupo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 active:bg-violet-600 disabled:bg-violet-500/40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {savingGrupo ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Quero ir em grupo
              </>
            )}
          </button>
        )}

        <p className="text-center text-[11px] text-zinc-600 leading-relaxed">
          Plus e Black aumentam sua prioridade em experiências mais disputadas.{" "}
          <Link href="/planos" className="text-violet-500/70 hover:text-violet-400 transition-colors">
            Ver planos →
          </Link>
        </p>
      </div>
    </div>
  );
}

function Toast({ nome, onClose }: { nome: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-[#18181B] border border-white/10 rounded-2xl shadow-xl shadow-black/40">
      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <p className="text-[#FAFAFA] text-sm font-semibold">Inscrição confirmada!</p>
        <p className="text-[#A1A1AA] text-xs mt-0.5">Você está na lista de <span className="text-violet-400 font-medium">{nome}</span>.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

function CancelToast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-[#18181B] border border-white/10 rounded-2xl shadow-xl shadow-black/40">
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <p className="text-[#FAFAFA] text-sm font-semibold">Inscrição cancelada.</p>
        <p className="text-[#A1A1AA] text-xs mt-0.5">Seu convite gratuito foi liberado para outro rolê.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EventosPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [inscritos, setInscritos] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cancelToast, setCancelToast] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [matchAttempted, setMatchAttempted] = useState(false);
  const [grupoInteresses, setGrupoInteresses] = useState<Set<string>>(new Set());
  const [savingGrupoId, setSavingGrupoId] = useState<string | null>(null);
  const [cancelingGrupoId, setCancelingGrupoId] = useState<string | null>(null);
  const [grupoFormadoToast, setGrupoFormadoToast] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showFreeLimit, setShowFreeLimit] = useState(false);
  const [freeActiveGroup, setFreeActiveGroupState] = useState<FreeActiveGroup | null>(null);
  const [showVillaJkWarning, setShowVillaJkWarning] = useState(false);
  const [pendingGrupoId, setPendingGrupoId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingPage(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.onboarding_completed && !isCompatComplete(profile)) {
        router.replace("/onboarding-compat");
        return;
      }

      setUserId(user.id);

      // Load free active group from localStorage
      const activeGroup = getFreeActiveGroup();
      setFreeActiveGroupState(activeGroup);

      const { data: inscricoes } = await supabase
        .from("inscricoes")
        .select("evento_nome")
        .eq("user_id", user.id);

      if (inscricoes) {
        const nomes = new Set(inscricoes.map((r) => r.evento_nome));
        setInscritos(new Set(EVENTOS.filter((e) => nomes.has(e.nome)).map((e) => e.id)));
      }

      const { data: interesses } = await supabase
        .from("event_group_interest")
        .select("event_id")
        .eq("user_id", user.id);
      if (interesses) {
        setGrupoInteresses(new Set(interesses.map((r: { event_id: string }) => r.event_id)));
      }

      if (profile && isCompatComplete(profile) && inscricoes && inscricoes.length > 0) {
        setMatchAttempted(true);
        try {
          type CoRow = { evento_nome: string; participant_id: string; participant_name: string };
          const { data: coParticipants } = await supabase.rpc("get_grupos", { p_user_id: user.id });

          if (coParticipants && coParticipants.length > 0) {
            const rows = coParticipants as CoRow[];
            const ids = [...new Set(rows.map((r) => r.participant_id))];

            const { data: coProfiles } = await supabase
              .from("profiles")
              .select("user_id, vibe, energia, grupo, ambiente, intencao, social_behavior")
              .in("user_id", ids);

            if (coProfiles) {
              const profMap = new Map((coProfiles as unknown as RawCompatRow[]).map((p) => [p.user_id, p]));
              const myCompat = toCompat(profile as unknown as RawCompatRow);
              const seen = new Set<string>();
              const matches: MatchedUser[] = [];

              for (const row of rows) {
                if (seen.has(row.participant_id)) continue;
                seen.add(row.participant_id);
                const cp = profMap.get(row.participant_id);
                if (!cp || !isCompatComplete(cp)) continue;
                const theirCompat = toCompat(cp);
                const { score, percentage } = calcularMatch(myCompat, theirCompat);
                matches.push({
                  id: row.participant_id,
                  name: row.participant_name,
                  eventoNome: row.evento_nome,
                  score,
                  percentage,
                  sameAmbiente:  myCompat.ambiente       === theirCompat.ambiente,
                  sameIntencao:  myCompat.intencao        === theirCompat.intencao,
                  vibeClose:     Math.abs((myCompat.vibe            ?? 0) - (theirCompat.vibe            ?? 0)) <= 1,
                  energiaClose:  Math.abs((myCompat.energia         ?? 0) - (theirCompat.energia         ?? 0)) <= 1,
                  grupoClose:    Math.abs((myCompat.grupo            ?? 0) - (theirCompat.grupo            ?? 0)) <= 1,
                  sbClose:       Math.abs((myCompat.social_behavior ?? 0) - (theirCompat.social_behavior ?? 0)) <= 1,
                  ambiente:  theirCompat.ambiente,
                  intencao:  theirCompat.intencao,
                });
              }

              setMatchedUsers(matches.sort((a, b) => b.percentage - a.percentage));
            }
          }
        } catch {
          // match section is additive — skip silently on error
        }
      }

      setLoadingPage(false);
    }
    init();
  }, [router]);

  async function handleQueroIr(id: string) {
    const evento = EVENTOS.find((e) => e.id === id)!;
    if (!userId) return;
    setSavingId(id);
    try {
      const { error } = await supabase.from("inscricoes").insert({ user_id: userId, evento_nome: evento.nome, evento_local: evento.bairro });
      if (error) throw error;
      setInscritos((prev) => new Set([...prev, id]));
      setToast(evento.nome);
      setTimeout(() => setToast(null), 4000);
    } catch {
      setActionError("Erro ao confirmar interesse. Tente novamente.");
      setTimeout(() => setActionError(""), 4000);
    } finally {
      setSavingId(null);
    }
  }

  async function doQueroGrupo(id: string) {
    if (!userId) return;
    setSavingGrupoId(id);
    try {
      const { error } = await supabase
        .from("event_group_interest")
        .insert({ user_id: userId, event_id: id });
      if (error) throw error;
      const evento = EVENTOS.find((e) => e.id === id)!;
      setFreeActiveGroupLS(id, evento.nome);
      setFreeActiveGroupState({ eventId: id, eventNome: evento.nome });
      setGrupoInteresses((prev) => new Set([...prev, id]));
      const formed = await tentarFormarGrupo(id);
      if (formed) {
        setGrupoFormadoToast(true);
        setTimeout(() => setGrupoFormadoToast(false), 5000);
      }
    } catch {
      setActionError("Erro ao entrar na fila de grupo. Tente novamente.");
      setTimeout(() => setActionError(""), 4000);
    } finally {
      setSavingGrupoId(null);
    }
  }

  async function handleQueroGrupo(id: string) {
    if (!userId) return;
    // Free limit: only 1 active group at a time
    if (getFreeActiveGroup()) {
      setShowFreeLimit(true);
      return;
    }
    // Villa JK priority warning for Free users
    if (id === "villa-jk") {
      setPendingGrupoId(id);
      setShowVillaJkWarning(true);
      return;
    }
    await doQueroGrupo(id);
  }

  async function handleCancelarGrupo(id: string) {
    if (!userId) return;
    setCancelingGrupoId(id);
    try {
      await supabase
        .from("event_group_interest")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", id);
      clearFreeActiveGroupLS();
      setFreeActiveGroupState(null);
      setGrupoInteresses((prev) => { const s = new Set(prev); s.delete(id); return s; });
      setCancelToast(true);
      setTimeout(() => setCancelToast(false), 4000);
    } catch {
      setActionError("Erro ao cancelar inscrição. Tente novamente.");
      setTimeout(() => setActionError(""), 4000);
    } finally {
      setCancelingGrupoId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#FAFAFA]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">São Paulo</span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">Esta semana</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#FAFAFA] mb-3" style={{ letterSpacing: "-0.02em" }}>
            Eventos <span className="text-violet-500">SOLO</span>
          </h1>
          <p className="text-[#A1A1AA] text-base sm:text-lg max-w-xl">
            Experiências parceiras com grupos organizados pela SOLO por compatibilidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-xs text-zinc-500">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Vagas disponíveis</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Últimas vagas</span>
          {inscritos.size > 0 && (
            <span className="flex items-center gap-2 text-violet-400 font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {inscritos.size} inscri{inscritos.size > 1 ? "ções" : "ção"} confirmada{inscritos.size > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Plan indicator */}
        <div className="mb-4 bg-[#18181B] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Plano atual</span>
              <span className="text-xs font-semibold text-[#FAFAFA]">SOLO Free</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">1 grupo/semana</span>
            </div>
            <Link href="/planos" className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium flex-shrink-0">
              Conhecer Plus →
            </Link>
          </div>
          <div className="px-4 pb-3">
            {freeActiveGroup ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-400 font-medium">
                  Convite usado · Inscrito em: {freeActiveGroup.eventNome}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-xs text-green-400 font-medium">Convite disponível</span>
              </div>
            )}
          </div>
        </div>

        {/* How invites work */}
        <div className="mb-8 flex items-start gap-2.5 px-4 py-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
          <svg className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-xs text-zinc-500 leading-relaxed">
            <span className="text-zinc-400 font-medium">Quero ir</span> = demonstra interesse no rolê sem usar convite.{" "}
            <span className="text-zinc-400 font-medium">Quero ir em grupo</span> = usa 1 convite para entrar na fila do grupo organizado pela SOLO.
          </p>
        </div>

        {loadingPage ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {EVENTOS.map((evento) => (
              <EventoCard
                key={evento.id}
                evento={evento}
                interesseSimples={inscritos.has(evento.id)}
                savingSimples={savingId === evento.id}
                onQueroIr={handleQueroIr}
                interesseGrupo={grupoInteresses.has(evento.id)}
                savingGrupo={savingGrupoId === evento.id}
                onQueroGrupo={handleQueroGrupo}
                onCancelarGrupo={handleCancelarGrupo}
                cancelingGrupo={cancelingGrupoId === evento.id}
              />
            ))}
          </div>
        )}

        {!loadingPage && matchAttempted && (
          <section className="mt-14">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Compatibilidade</span>
              </div>
              <h2 className="text-2xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>
                Pessoas que <span className="text-violet-500">combinam</span> com você
              </h2>
              <p className="text-[#A1A1AA] text-sm mt-1">
                {matchedUsers.length > 0
                  ? `${matchedUsers.length} pessoa${matchedUsers.length !== 1 ? "s" : ""} nos seus eventos com perfil compatível`
                  : "Baseado no seu perfil social nos eventos confirmados"}
              </p>
            </div>

            {matchedUsers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {matchedUsers.map((u) => <MatchCard key={u.id} user={u} />)}
              </div>
            ) : (
              <EmptyMatchState />
            )}
          </section>
        )}

        <p className="text-center text-zinc-500 text-sm mt-12">
          Novos eventos toda semana. Parceiro?{" "}
          <span className="text-violet-400 hover:text-violet-300 transition-colors">Cadastre seu estabelecimento →</span>
        </p>
      </main>

      {toast && <Toast nome={toast} onClose={() => setToast(null)} />}
      {cancelToast && <CancelToast onClose={() => setCancelToast(false)} />}

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-[#18181B] border border-red-500/20 rounded-2xl shadow-xl shadow-black/40">
          <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-[#FAFAFA] text-sm font-medium">{actionError}</p>
          <button onClick={() => setActionError("")} className="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {showFreeLimit && <FreeLimitModal onClose={() => setShowFreeLimit(false)} />}

      {showVillaJkWarning && (
        <VillaJkModal
          onContinue={() => {
            setShowVillaJkWarning(false);
            const id = pendingGrupoId;
            setPendingGrupoId(null);
            if (id) doQueroGrupo(id);
          }}
          onClose={() => {
            setShowVillaJkWarning(false);
            setPendingGrupoId(null);
          }}
        />
      )}

      {grupoFormadoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-[#18181B] border border-violet-500/20 rounded-2xl shadow-xl shadow-violet-500/20">
          <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#FAFAFA] text-sm font-semibold">Grupo formado! ✨</p>
            <p className="text-[#A1A1AA] text-xs mt-0.5">
              Veja seu grupo em{" "}
              <Link href="/grupos" className="text-violet-400 font-medium hover:text-violet-300">
                /grupos →
              </Link>
            </p>
          </div>
          <button onClick={() => setGrupoFormadoToast(false)} className="ml-2 text-zinc-600 hover:text-zinc-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
