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

  useEffect(() => {
    async function init() {
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
    }
    init();
  }, [router]);

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const name: string = user!.user_metadata?.name || user!.email || "Usuário";
  const firstName = name.split(" ")[0];
  const initials = name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Navbar onLogout={handleLogout} />

      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center text-center gap-8">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-violet-500/20">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-zinc-900" style={{ letterSpacing: "-0.02em" }}>
            Bem-vindo a <span className="text-violet-500 glow-violet">SOLO</span>, {firstName}!
          </h1>
          <p className="text-zinc-500 text-lg">Sua jornada para conexões reais começa aqui.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <Link href="/eventos" className="bg-white border border-zinc-200 hover:border-violet-300 rounded-2xl px-4 py-5 flex flex-col items-center gap-1 transition-colors group">
            <span className="text-3xl font-bold text-violet-500">{eventosCount}</span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 font-medium uppercase tracking-wide transition-colors">Eventos</span>
          </Link>
          <Link href="/grupos" className="bg-white border border-zinc-200 hover:border-violet-300 rounded-2xl px-4 py-5 flex flex-col items-center gap-1 transition-colors group">
            <span className="text-3xl font-bold text-violet-500">{gruposCount}</span>
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 font-medium uppercase tracking-wide transition-colors">Grupos</span>
          </Link>
          <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-5 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-violet-500">0</span>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Mensagens</span>
          </div>
        </div>

        {/* Eventos banner */}
        {eventosCount > 0 && (
          <Link href="/eventos" className="w-full flex items-center justify-between px-5 py-4 bg-violet-50 border border-violet-200 hover:border-violet-300 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-zinc-900 text-sm font-semibold">{eventosCount} evento{eventosCount > 1 ? "s" : ""} na sua agenda</p>
                <p className="text-zinc-400 text-xs mt-0.5">Ver meus eventos →</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-zinc-300 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Profile info */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-6 text-left">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-4">Seu perfil</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-zinc-900 font-medium text-sm">{name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-zinc-500 text-sm">{user!.email}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full bg-violet-50 border border-violet-200 rounded-2xl p-6 text-center">
          <p className="text-violet-600 font-semibold text-sm mb-1">Em breve</p>
          <p className="text-zinc-500 text-sm">Explore perfis, envie mensagens e encontre sua conexão.</p>
        </div>
      </main>
    </div>
  );
}
