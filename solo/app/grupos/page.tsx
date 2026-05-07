"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isCompatComplete } from "@/lib/types";
import { Navbar } from "@/components/Navbar";

type EventType = "balada" | "bar" | "rooftop" | "show";

const EVENTO_META: Record<string, { tipo: EventType; emoji: string }> = {
  "Club Noir":    { tipo: "balada",   emoji: "🎉" },
  "Bar Caju":     { tipo: "bar",      emoji: "🍹" },
  "Terraço 360":  { tipo: "rooftop",  emoji: "🌆" },
  "Audio Club":   { tipo: "show",     emoji: "🎸" },
};

const TIPO_CONFIG: Record<EventType, { label: string; color: string; bg: string; bar: string }> = {
  balada:  { label: "Balada",        color: "text-purple-600",  bg: "bg-purple-50 border-purple-200",  bar: "bg-purple-500"  },
  bar:     { label: "Bar descolado", color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",    bar: "bg-amber-500"   },
  rooftop: { label: "Rooftop",       color: "text-sky-600",     bg: "bg-sky-50 border-sky-200",        bar: "bg-sky-500"     },
  show:    { label: "Show ao vivo",  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200",bar: "bg-emerald-500" },
};

const AVATAR_GRADIENTS = [
  "from-violet-500 to-violet-600",
  "from-purple-500 to-purple-600",
  "from-sky-500 to-sky-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
];

function avatarGradient(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  return name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";
}

interface Participant {
  participant_id: string;
  participant_name: string;
}

interface GrupoCard {
  evento_nome: string;
  evento_local: string;
  participants: Participant[];
}

function ParticipantAvatar({ name, id }: { name: string; id: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-14">
      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(id)} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}>
        {getInitials(name)}
      </div>
      <span className="text-xs text-zinc-500 text-center leading-tight w-full truncate">{name.split(" ")[0]}</span>
    </div>
  );
}

function GrupoCardItem({ grupo }: { grupo: GrupoCard }) {
  const meta = EVENTO_META[grupo.evento_nome];
  const tipo = meta ? TIPO_CONFIG[meta.tipo] : null;
  const total = grupo.participants.length;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      {tipo && <div className={`h-1 w-full ${tipo.bar}`} />}

      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {meta && tipo && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tipo.bg} ${tipo.color}`}>
                  {meta.emoji} {tipo.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-50 border border-zinc-200 text-zinc-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {grupo.evento_local}
              </span>
            </div>
            <h2 className="text-lg font-black text-zinc-900">{grupo.evento_nome}</h2>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200">
            <span className="text-xl font-black text-violet-500 leading-none">{total}</span>
            <span className="text-[10px] text-zinc-400 font-medium mt-0.5 leading-tight text-center">
              {total === 1 ? "pessoa" : "pessoas"}
            </span>
          </div>
        </div>

        <div className="h-px bg-zinc-100" />

        {total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-zinc-900 font-semibold text-sm">Você é o primeiro inscrito!</p>
            <p className="text-zinc-400 text-xs">Compartilhe o evento para reunir pessoas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide">Quem também vai</p>
            <div className="flex flex-wrap gap-3">
              {grupo.participants.map((p) => (
                <ParticipantAvatar key={p.participant_id} name={p.participant_name} id={p.participant_id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoCard[]>([]);
  const [ready, setReady] = useState(false);
  const [semEventos, setSemEventos] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior").eq("user_id", user.id).maybeSingle();
      if (profile?.onboarding_completed && !isCompatComplete(profile)) { router.replace("/onboarding-compat"); return; }

      const { data: minhasInscricoes } = await supabase
        .from("inscricoes")
        .select("evento_nome, evento_local")
        .eq("user_id", user.id);

      if (!minhasInscricoes || minhasInscricoes.length === 0) {
        setSemEventos(true);
        setReady(true);
        return;
      }

      const { data: coParticipants } = await supabase
        .rpc("get_grupos", { p_user_id: user.id });

      const gruposMap: Record<string, GrupoCard> = {};
      for (const ins of minhasInscricoes) {
        gruposMap[ins.evento_nome] = {
          evento_nome: ins.evento_nome,
          evento_local: ins.evento_local,
          participants: [],
        };
      }

      if (coParticipants) {
        for (const row of coParticipants) {
          if (gruposMap[row.evento_nome]) {
            gruposMap[row.evento_nome].participants.push({
              participant_id: row.participant_id,
              participant_name: row.participant_name,
            });
          }
        }
      }

      setGrupos(Object.values(gruposMap));
      setReady(true);
    }
    init();
  }, [router]);

  const totalPessoas = grupos.reduce((acc, g) => acc + g.participants.length, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">Sua rede</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
            Seus <span className="text-violet-500">Grupos</span>
          </h1>
          <p className="text-zinc-500 text-base max-w-md">
            Pessoas que se inscreveram nos mesmos eventos que você. Quebra o gelo antes da noite!
          </p>
        </div>

        {!ready ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>

        ) : semEventos ? (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-900 font-semibold text-lg">Nenhum evento ainda</p>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                Inscreva-se em eventos para ver quem mais vai aparecer.
              </p>
            </div>
            <Link
              href="/eventos"
              className="mt-2 px-6 py-3 bg-violet-500 hover:bg-violet-400 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
            >
              Ver eventos disponíveis →
            </Link>
          </div>

        ) : (
          <>
            {totalPessoas > 0 && (
              <div className="flex items-center gap-3 mb-8 px-5 py-4 bg-violet-50 border border-violet-200 rounded-2xl">
                <div className="flex -space-x-2">
                  {grupos.flatMap((g) => g.participants).slice(0, 4).map((p) => (
                    <div
                      key={p.participant_id}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient(p.participant_id)} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {getInitials(p.participant_name)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-violet-700">
                  <span className="font-bold text-violet-600">{totalPessoas}</span>{" "}
                  pessoa{totalPessoas > 1 ? "s" : ""} vai{totalPessoas > 1 ? "o" : ""} aos mesmos eventos que você
                </p>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {grupos.map((grupo) => (
                <GrupoCardItem key={grupo.evento_nome} grupo={grupo} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
