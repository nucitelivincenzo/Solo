"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isCompatComplete } from "@/lib/types";
import type { Ambiente, Intencao } from "@/lib/types";
import { calcularMatch } from "@/lib/match";
import { tentarFormarGrupo } from "@/lib/groups";
import { Navbar } from "@/components/Navbar";

type EventType = "balada" | "bar" | "rooftop" | "show";

interface Evento {
  id: string; nome: string; bairro: string; tipo: EventType;
  descricao: string; dia: string; horario: string; vagas: number;
}

const EVENTOS: Evento[] = [
  { id: "club-noir",   nome: "Club Noir",   bairro: "Pinheiros",     tipo: "balada",  descricao: "A noite underground mais autêntica de SP. Música eletrônica de verdade, ambiente intimista e pista que não para.", dia: "Sexta-feira", horario: "23h00", vagas: 12 },
  { id: "bar-caju",    nome: "Bar Caju",    bairro: "Vila Madalena", tipo: "bar",     descricao: "O boteco mais descolado da Vila. Drinks autorais, petiscos incríveis e aquela vibe de quem quer conversa boa.", dia: "Sábado",      horario: "20h00", vagas: 8  },
  { id: "terraco-360", nome: "Terraço 360", bairro: "Itaim Bibi",    tipo: "rooftop", descricao: "Vista panorâmica de São Paulo com cocktails premiados. O lugar perfeito para quebrar o gelo com a cidade ao redor.", dia: "Sábado",      horario: "21h00", vagas: 6  },
  { id: "audio-club",  nome: "Audio Club",  bairro: "Barra Funda",   tipo: "show",    descricao: "Uma das maiores casas de shows de SP. Artistas nacionais e internacionais em experiência ao vivo inesquecível.", dia: "Sábado",      horario: "22h00", vagas: 10 },
];

const TIPO_CONFIG: Record<EventType, { label: string; emoji: string; color: string; bg: string; bar: string }> = {
  balada:  { label: "Balada",        emoji: "🎉", color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",  bar: "bg-purple-500"  },
  bar:     { label: "Bar descolado", emoji: "🍹", color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",    bar: "bg-amber-500"   },
  rooftop: { label: "Rooftop",       emoji: "🌆", color: "text-sky-600",     bg: "bg-sky-50 border-sky-200",        bar: "bg-sky-500"     },
  show:    { label: "Show ao vivo",  emoji: "🎸", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" },
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

  const pctColor   = isHigh ? "text-violet-600"  : isMid ? "text-emerald-600" : "text-amber-500";
  const cardBorder = isHigh ? "border-violet-200 hover:border-violet-300" : "border-zinc-200 hover:border-zinc-300";
  const badgeCls   = isHigh
    ? "bg-violet-50 border-violet-200 text-violet-700"
    : isMid
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-amber-50 border-amber-200 text-amber-700";
  const levelLabel = isHigh ? "Alta compatibilidade" : isMid ? "Boa conexão" : "Compatibilidade moderada";

  const badges: string[] = [];
  if (user.sameAmbiente && user.ambiente)       badges.push(AMBIENTE_LABELS[user.ambiente]);
  if (user.sameIntencao && user.intencao)       badges.push(INTENCAO_BADGE[user.intencao]);
  if (user.vibeClose)                           badges.push("Vibe parecida");
  if (user.energiaClose)                        badges.push("Mesma energia");
  if (user.sbClose && badges.length < 3)        badges.push("Estilo social próximo");

  return (
    <div className={`bg-white border rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-zinc-100 hover:-translate-y-0.5 ${cardBorder}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${matchGradient(user.id)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
          {matchInitials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-900 font-bold text-base truncate">{user.name.split(" ")[0]}</p>
          <p className="text-zinc-400 text-xs mt-0.5 truncate">{user.eventoNome}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-2xl font-black leading-none tabular-nums ${pctColor}`}>{pct}%</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeCls}`}>{levelLabel}</span>
        </div>
      </div>

      {/* Shared dimensions */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-50 border border-zinc-200 text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Human explanation */}
      <p className="text-zinc-500 text-xs leading-relaxed bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
        {gerarExplicacao(user)}
      </p>
    </div>
  );
}

function EmptyMatchState() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 px-6 text-center bg-white border border-zinc-200 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <div>
        <p className="text-zinc-900 font-bold text-base">Ainda sem matches</p>
        <p className="text-zinc-500 text-sm mt-1.5 max-w-xs leading-relaxed">
          Quando outros participantes confirmados tiverem perfil compatível com o seu, eles aparecem aqui.
        </p>
      </div>
      <div className="flex items-start gap-3 w-full max-w-xs px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-left">
        <span className="text-base mt-0.5 flex-shrink-0">✨</span>
        <p className="text-violet-700 text-xs leading-relaxed">Inscreva-se em mais eventos para aumentar suas chances de match</p>
      </div>
    </div>
  );
}

// ─── EventoCard ────────────────────────────────────────────────────────────────

function EventoCard({ evento, inscrito, saving, onQueroIr, interesseGrupo, savingGrupo, onQueroGrupo }: {
  evento: Evento; inscrito: boolean; saving: boolean; onQueroIr: (id: string) => void;
  interesseGrupo: boolean; savingGrupo: boolean; onQueroGrupo: (id: string) => void;
}) {
  const tipo   = TIPO_CONFIG[evento.tipo];
  const urgente = evento.vagas <= 6;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md hover:shadow-zinc-200
      ${inscrito ? "border-violet-300" : "border-zinc-200 hover:border-zinc-300"}`}>
      <div className={`h-1 w-full ${tipo.bar}`} />
      <div className="p-6 flex flex-col gap-5 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tipo.bg} ${tipo.color}`}>
            {tipo.emoji} {tipo.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-50 border border-zinc-200 text-zinc-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {evento.bairro}
          </span>
          {inscrito && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 border border-violet-200 text-violet-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Você vai!
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-black text-zinc-900 group-hover:text-violet-600 transition-colors">{evento.nome}</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">{evento.descricao}</p>
        </div>

        <div className="flex items-center gap-4">
          {[
            { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", text: evento.dia },
            { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: evento.horario },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-zinc-600 text-sm">
              <div className="w-6 h-6 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-zinc-100" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${urgente ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
            <span className="text-sm font-semibold text-zinc-900">{evento.vagas} vagas <span className="text-zinc-400 font-normal">SOLO</span></span>
          </div>
          {inscrito ? (
            <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 border border-zinc-200 text-zinc-500 text-sm font-semibold rounded-xl cursor-default select-none">
              <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Inscrito
            </div>
          ) : (
            <button onClick={() => onQueroIr(evento.id)} disabled={saving}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:bg-violet-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0">
              {saving
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Quero ir <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
              }
            </button>
          )}
        </div>

        {interesseGrupo ? (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-xl text-violet-600 text-sm font-semibold select-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Na fila para grupo!
          </div>
        ) : (
          <button
            onClick={() => onQueroGrupo(evento.id)}
            disabled={savingGrupo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-violet-400 active:bg-violet-600 disabled:bg-violet-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0"
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
      </div>
    </div>
  );
}

function Toast({ nome, onClose }: { nome: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-zinc-200/80">
      <div className="w-8 h-8 rounded-full bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      </div>
      <div>
        <p className="text-zinc-900 text-sm font-semibold">Inscrição confirmada!</p>
        <p className="text-zinc-500 text-xs mt-0.5">Você está na lista de <span className="text-violet-500 font-medium">{nome}</span>.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-zinc-300 hover:text-zinc-500 transition-colors">
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
  const [loadingPage, setLoadingPage] = useState(true);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [matchAttempted, setMatchAttempted] = useState(false);
  const [grupoInteresses, setGrupoInteresses] = useState<Set<string>>(new Set());
  const [savingGrupoId, setSavingGrupoId] = useState<string | null>(null);

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
    } catch (e) {
      console.error("❌ Erro ao inscrever:", e);
    } finally {
      setSavingId(null);
    }
  }

  async function handleQueroGrupo(id: string) {
    if (!userId) return;
    setSavingGrupoId(id);
    try {
      const { error } = await supabase
        .from("event_group_interest")
        .insert({ user_id: userId, event_id: id });
      if (error) throw error;
      setGrupoInteresses((prev) => new Set([...prev, id]));
      tentarFormarGrupo(id);
    } catch (e) {
      console.error("❌ Erro ao registrar interesse em grupo:", e);
    } finally {
      setSavingGrupoId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">São Paulo</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Esta semana</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
            Eventos <span className="text-violet-500">SOLO</span>
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg max-w-xl">
            Estabelecimentos parceiros com vagas reservadas para curtir com pessoas novas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-xs text-zinc-400">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Vagas disponíveis</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Últimas vagas</span>
          {inscritos.size > 0 && (
            <span className="flex items-center gap-2 text-violet-500 font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {inscritos.size} inscri{inscritos.size > 1 ? "ções" : "ção"} confirmada{inscritos.size > 1 ? "s" : ""}
            </span>
          )}
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
                inscrito={inscritos.has(evento.id)}
                saving={savingId === evento.id}
                onQueroIr={handleQueroIr}
                interesseGrupo={grupoInteresses.has(evento.id)}
                savingGrupo={savingGrupoId === evento.id}
                onQueroGrupo={handleQueroGrupo}
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
              <h2 className="text-2xl font-black text-zinc-900" style={{ letterSpacing: "-0.02em" }}>
                Pessoas que <span className="text-violet-500">combinam</span> com você
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
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

        <p className="text-center text-zinc-400 text-sm mt-12">
          Novos eventos toda semana. Parceiro?{" "}
          <span className="text-violet-500 cursor-pointer hover:text-violet-600 transition-colors">Cadastre seu estabelecimento →</span>
        </p>
      </main>
      {toast && <Toast nome={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
