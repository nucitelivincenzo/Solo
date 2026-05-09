"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { isCompatComplete } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [eventosCount, setEventosCount] = useState(0);
  const [gruposCount, setGruposCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace("/login"); return; }
        const { data: profile } = await supabase.from("profiles").select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior").eq("user_id", user.id).maybeSingle();
        if (!profile?.onboarding_completed) { router.replace("/onboarding"); return; }
        if (!isCompatComplete(profile)) { router.replace("/onboarding-compat"); return; }
        const [{ count: eCount }, { count: gCount }] = await Promise.all([
          supabase.from("inscricoes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ]);
        setUser(user);
        setEventosCount(eCount ?? 0);
        setGruposCount(gCount ?? 0);
        setReady(true);
      } catch (e: unknown) {
        setInitError(e instanceof Error ? e.message : "Erro ao carregar. Tente novamente.");
      }
    }
    init();
  }, [router]);

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-[#FAFAFA] font-semibold text-sm">Algo deu errado</p>
        <p className="text-[#A1A1AA] text-xs max-w-xs">{initError}</p>
        <button onClick={() => window.location.reload()}
          className="mt-1 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold rounded-xl transition-colors">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const name: string = user!.user_metadata?.name || user!.email || "Usuário";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#FAFAFA]">
      <Navbar onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-8">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-violet-500/20">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-[#0F0F11]" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>
            Bem-vindo ao <span className="text-violet-500 glow-violet">SOLO</span>, {firstName}!
          </h1>
          <p className="text-[#A1A1AA] text-lg">Sua jornada para conexões reais começa aqui.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <Link href="/eventos" className="bg-[#18181B] border border-white/10 hover:border-violet-500/40 rounded-2xl px-4 py-5 flex flex-col items-center gap-1 transition-colors group">
            <span className="text-3xl font-bold text-violet-500">{eventosCount}</span>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400 font-medium uppercase tracking-wide transition-colors">Eventos</span>
          </Link>
          <Link href="/grupos" className="bg-[#18181B] border border-white/10 hover:border-violet-500/40 rounded-2xl px-4 py-5 flex flex-col items-center gap-1 transition-colors group">
            <span className="text-3xl font-bold text-violet-500">{gruposCount}</span>
            <span className="text-xs text-zinc-500 group-hover:text-zinc-400 font-medium uppercase tracking-wide transition-colors">Grupos</span>
          </Link>
          <div className="bg-[#18181B] border border-white/10 rounded-2xl px-4 py-5 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-violet-500">0</span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Mensagens</span>
          </div>
        </div>

        {/* Eventos banner */}
        {eventosCount > 0 && (
          <Link href="/eventos" className="w-full flex items-center justify-between px-5 py-4 bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-[#FAFAFA] text-sm font-semibold">{eventosCount} evento{eventosCount > 1 ? "s" : ""} na sua agenda</p>
                <p className="text-zinc-500 text-xs mt-0.5">Ver meus eventos →</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Profile info */}
        <div className="w-full bg-[#18181B] border border-white/10 rounded-2xl p-6 text-left">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Seu perfil</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[#FAFAFA] font-medium text-sm">{name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[#A1A1AA] text-sm">{user!.email}</span>
            </div>
          </div>
        </div>

        {/* Plan card */}
        <div className="w-full bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seu plano</p>
              <p className="text-base font-black text-[#FAFAFA] mt-0.5">SOLO Free</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400">
              Ativo
            </span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-zinc-400">1 convite gratuito por semana</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-zinc-400">Acesso básico aos rolês</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pt-1">
              Com Plus, você sai mais vezes e entra com prioridade nos grupos compatíveis.
            </p>
            <Link href="/planos"
              className="mt-1 flex items-center justify-center py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 transition-colors text-white text-xs font-semibold">
              Conhecer Plus →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
