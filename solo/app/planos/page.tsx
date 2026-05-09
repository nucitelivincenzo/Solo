"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-4 bg-[#18181B] border border-violet-500/25 rounded-2xl shadow-2xl shadow-black/60 max-w-[90vw]">
      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm text-zinc-200 leading-snug">
        Interesse registrado para demonstração do MVP.
        <br />
        <span className="text-zinc-500 text-xs">Pagamento real ainda não está ativo.</span>
      </p>
      <button onClick={onClose} className="flex-shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Check icon ────────────────────────────────────────────────────────────────

function BenefitRow({ text, icon, highlight }: { text: string; icon: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 text-[12px] leading-[1.6]" style={{ color: highlight ? "rgba(139,92,246,0.55)" : undefined }}>{icon}</span>
      <span className={`text-[13px] leading-[1.5] ${highlight ? "font-medium text-white/80" : "font-light text-white/55"}`}>{text}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlanosPage() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3500);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#FAFAFA]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-14">

        {/* ── Back + Header */}
        <div className="flex flex-col gap-6">
          <Link href="/perfil"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao perfil
          </Link>

          <div>
            <h1 className="text-3xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>Planos SOLO</h1>
            <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed max-w-md">
              Comece grátis. Escolha Plus ou Black quando quiser sair mais, ter prioridade e acessar experiências mais exclusivas.
            </p>
          </div>
        </div>

        {/* ── Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

          {/* ── FREE */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">SOLO Free</span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400 flex-shrink-0">
                Plano atual
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>R$0</span>
                <span className="text-sm text-zinc-500 ml-1">para começar</span>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed mt-2">
                Para começar, explorar a SOLO e viver a primeira experiência.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-white/[0.07] pt-4">
              {[
                "Criar conta e montar sua vibe",
                "Explorar rolês da semana",
                "1 convite gratuito por semana",
                "Entrar em grupo quando formado",
                "Chat e confirmação do rolê",
              ].map((f) => <BenefitRow key={f} text={f} icon="○" />)}
            </div>

            <button
              disabled
              className="mt-auto w-full py-3 rounded-xl border border-white/10 text-zinc-500 text-xs font-semibold cursor-default bg-white/[0.025] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              Plano atual
            </button>

            <p className="text-[11px] text-zinc-600 leading-relaxed -mt-1">
              Com o Free, você testa a proposta da SOLO sem pagar.
            </p>
          </div>

          {/* ── PLUS */}
          <div className="relative rounded-2xl border border-violet-500/40 bg-violet-500/[0.06] p-6 flex flex-col gap-5"
            style={{ boxShadow: "0 0 48px rgba(139,92,246,0.08)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 rounded-full px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
              Mais escolhido
            </div>

            <div className="flex items-start justify-between gap-3 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400/90">SOLO Plus</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>R$19</span>
                <span className="text-xl font-light text-white/65">,90</span>
                <span className="text-sm text-zinc-500 ml-1">/ mês</span>
              </div>
              <p className="text-[13px] text-zinc-300 leading-relaxed mt-2">
                Para quem quer sair mais vezes e ter mais chances de entrar nos grupos certos.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-violet-500/[0.14] pt-4">
              {[
                { text: "Tudo do Free", first: true },
                { text: "Até 3 convites por semana", first: false },
                { text: "Prioridade em grupos compatíveis", first: false },
                { text: "Acesso antecipado a alguns rolês", first: false },
                { text: "Benefícios básicos em parceiros", first: false },
                { text: "Mais contexto antes de confirmar", first: false },
              ].map(({ text, first }) => (
                <BenefitRow key={text} text={text} icon="✦" highlight={first} />
              ))}
            </div>

            <button
              onClick={() => setShowToast(true)}
              className="mt-auto w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 active:bg-violet-600 transition-colors text-white text-xs font-semibold"
              style={{ boxShadow: "0 0 24px rgba(139,92,246,0.30)" }}>
              Tenho interesse no Plus
            </button>

            <p className="text-[11px] text-zinc-500 leading-relaxed -mt-1">
              Com o Plus, você aumenta frequência, prioridade e acesso a oportunidades sociais.
            </p>
          </div>

          {/* ── BLACK */}
          <div className="rounded-2xl border border-white/[0.11] bg-white/[0.018] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">SOLO Black</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>R$49</span>
                <span className="text-xl font-light text-white/65">,90</span>
                <span className="text-sm text-zinc-500 ml-1">/ mês</span>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed mt-2">
                Para quem quer prioridade máxima, experiências especiais e grupos mais curados.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-white/[0.07] pt-4">
              {[
                { text: "Tudo do Plus", first: true },
                { text: "Prioridade máxima nos grupos", first: false },
                { text: "Acesso primeiro aos rolês mais disputados", first: false },
                { text: "Experiências exclusivas SOLO", first: false },
                { text: "Mesas menores e mais selecionadas", first: false },
                { text: "Benefícios premium em parceiros", first: false },
              ].map(({ text, first }) => (
                <BenefitRow key={text} text={text} icon="◆"
                  highlight={undefined}
                  {...(!first ? {} : { highlight: false })}
                />
              ))}
            </div>

            <button
              onClick={() => setShowToast(true)}
              className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 active:from-zinc-200 active:to-zinc-400 transition-all text-zinc-900 text-xs font-semibold">
              Tenho interesse no Black
            </button>

            <p className="text-[11px] text-zinc-600 leading-relaxed -mt-1">
              Com o Black, você acessa a camada mais exclusiva da SOLO.
            </p>
          </div>

        </div>

        {/* ── Comparativo */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Comparativo</p>
            <h2 className="text-2xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>Na prática, o que muda?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Free */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">F</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Free</p>
                  <p className="text-[11px] text-zinc-500">Para experimentar.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-400 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>1 convite por semana</p>
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>Acesso básico aos rolês</p>
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>Participa quando o grupo já está formado</p>
              </div>
            </div>

            {/* Plus */}
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.05] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0">P</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Plus</p>
                  <p className="text-[11px] text-violet-400/70">Para sair mais vezes.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-300 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Até 3 convites por semana</p>
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Prioridade em grupos compatíveis</p>
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Acesso antecipado a alguns rolês</p>
              </div>
            </div>

            {/* Black */}
            <div className="rounded-2xl border border-white/[0.11] bg-white/[0.018] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[10px] font-bold text-zinc-300 flex-shrink-0">B</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Black</p>
                  <p className="text-[11px] text-zinc-400">Para experiências mais exclusivas.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-300 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Prioridade máxima</p>
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Acesso primeiro aos rolês mais disputados</p>
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Experiências especiais e grupos mais curados</p>
              </div>
            </div>

          </div>

          {/* Progressão visual */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
            <span className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-500">Free</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">Plus</span>
            <span>→</span>
            <span className="px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.04] text-zinc-300">Black</span>
            <span className="ml-2 text-zinc-700">Cada nível amplia acesso, prioridade e exclusividade.</span>
          </div>
        </div>

        {/* ── MVP disclaimer */}
        <div className="border-t border-white/[0.06] pt-8">
          <p className="text-[11px] text-zinc-600 leading-relaxed text-center">
            Checkout real não está ativo nesta versão do MVP. Os planos demonstram a estratégia de monetização da SOLO.
          </p>
        </div>

      </main>

      {showToast && <Toast onClose={() => setShowToast(false)} />}
    </div>
  );
}
