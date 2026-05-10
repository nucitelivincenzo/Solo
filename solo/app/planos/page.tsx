"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

// ── Data ──────────────────────────────────────────────────────────────────────

const PLUS_DETAILS = [
  {
    title: "Até 3 convites por semana",
    desc: "Você pode demonstrar interesse em mais rolês durante a semana.",
  },
  {
    title: "Prioridade em grupos compatíveis",
    desc: "Quando houver disputa por vagas, o Plus aparece antes na formação dos grupos.",
  },
  {
    title: "Acesso antecipado a alguns rolês",
    desc: "Você vê determinadas experiências antes da lista geral.",
  },
  {
    title: "Mais contexto antes de confirmar",
    desc: "Você recebe mais informações sobre a experiência antes de decidir.",
  },
  {
    title: "Benefícios básicos em parceiros",
    desc: "Alguns bares e experiências podem oferecer condições especiais para usuários Plus.",
  },
];

const BLACK_DETAILS = [
  {
    title: "Tudo do Plus",
    desc: "Inclui os benefícios de frequência e prioridade do Plus.",
  },
  {
    title: "Prioridade máxima nos grupos",
    desc: "Você tem a maior prioridade na formação de grupos para experiências disputadas.",
  },
  {
    title: "Acesso primeiro aos rolês mais disputados",
    desc: "Experiências de maior demanda aparecem primeiro para usuários Black.",
  },
  {
    title: "Experiências exclusivas SOLO",
    desc: "Acesso a noites especiais, mesas selecionadas e experiências mais curadas.",
  },
  {
    title: "Mesas menores e mais selecionadas",
    desc: "Grupos mais reduzidos, com curadoria mais forte de perfil e intenção social.",
  },
  {
    title: "Benefícios premium em parceiros",
    desc: "Vantagens especiais em experiências e estabelecimentos parceiros.",
  },
];

const FREE_DETAILS = [
  "Criar conta e montar sua vibe",
  "Explorar rolês da semana",
  "1 convite gratuito por semana",
  "Entrar em grupo quando formado",
  "Chat e confirmação do rolê",
];

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ plan, onClose }: { plan: "plus" | "black"; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-4 border border-violet-500/20 rounded-2xl shadow-2xl shadow-black/60 max-w-[90vw]" style={{ background: "#0D0D0F" }}>
      <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-sm text-zinc-200 leading-snug">
        Interesse no {plan === "plus" ? "Plus" : "Black"} registrado para demonstração do MVP.
        <br />
        <span className="text-zinc-500 text-xs">Pagamento real ainda não está ativo nesta versão.</span>
      </p>
      <button onClick={onClose} className="flex-shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Detail row inside modal ────────────────────────────────────────────────────

function DetailRow({ title, desc, accent }: { title: string; desc: string; accent: "violet" | "zinc" }) {
  return (
    <div className="flex flex-col gap-1 py-3.5 border-b border-white/[0.06] last:border-0">
      <span className="text-sm font-semibold text-zinc-200">
        {title}
      </span>
      <span className="text-xs text-zinc-500 leading-relaxed">{desc}</span>
    </div>
  );
}

// ── Plan modals ────────────────────────────────────────────────────────────────

function PlusModal({ onClose, onInterest }: { onClose: () => void; onInterest: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md border border-violet-500/20 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 max-h-[92svh] flex flex-col"
        style={{ background: "#0D0D0F" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-violet-500/[0.12]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-violet-400/90 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Plus</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-violet-500 text-white">
                Mais escolhido
              </span>
            </div>
            <p className="text-xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>
              R$19,90<span className="text-sm font-light text-zinc-500">/mês</span>
            </p>
            <p className="text-[13px] text-zinc-400 mt-1 leading-snug max-w-xs">
              Para quem quer sair mais vezes e ter mais chances de entrar nos grupos certos.
            </p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          <p className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>O que muda na prática</p>
          <div className="flex flex-col">
            {PLUS_DETAILS.map((d) => (
              <DetailRow key={d.title} title={d.title} desc={d.desc} accent="violet" />
            ))}
          </div>

          {/* Practical example */}
          <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl px-4 py-3.5">
            <p className="text-amber-400/70 uppercase mb-1.5" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>Exemplo prático</p>
            <p className="text-[13px] text-zinc-300 leading-relaxed">
              No Free você tem 1 convite por semana. No Plus, pode entrar em até 3 rolês e ter prioridade para formar grupo.
            </p>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 pb-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
          <button
            onClick={onInterest}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] transition-all duration-200 text-white text-sm font-semibold shadow-md shadow-black/25 solo-shimmer-btn"
          >
            Registrar interesse no Plus
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-zinc-400 hover:text-zinc-300 text-sm font-medium"
          >
            Voltar aos planos
          </button>
        </div>
      </div>
    </div>
  );
}

function BlackModal({ onClose, onInterest }: { onClose: () => void; onInterest: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md border border-white/[0.14] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60 max-h-[92svh] flex flex-col"
        style={{ background: "#0D0D0F" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-white/[0.07]">
          <div>
            <span className="text-zinc-400 uppercase block mb-1" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Black</span>
            <p className="text-xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>
              R$49,90<span className="text-sm font-light text-zinc-500">/mês</span>
            </p>
            <p className="text-[13px] text-zinc-400 mt-1 leading-snug max-w-xs">
              Para quem quer prioridade máxima, experiências especiais e grupos mais curados.
            </p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          <p className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>O que muda na prática</p>
          <div className="flex flex-col">
            {BLACK_DETAILS.map((d) => (
              <DetailRow key={d.title} title={d.title} desc={d.desc} accent="zinc" />
            ))}
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Exemplo prático</p>
            <p className="text-[13px] text-zinc-300 leading-relaxed">
              Em uma experiência como um rooftop disputado, o Black representa a camada de maior prioridade e acesso da SOLO.
            </p>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-6 pb-6 pt-4 border-t border-white/[0.06] flex flex-col gap-2.5">
          <button
            onClick={onInterest}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 active:from-zinc-200 active:to-zinc-400 transition-all text-zinc-900 text-sm font-semibold"
          >
            Registrar interesse no Black
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-zinc-400 hover:text-zinc-300 text-sm font-medium"
          >
            Voltar aos planos
          </button>
        </div>
      </div>
    </div>
  );
}

function FreeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-black/60"
        style={{ background: "#0D0D0F" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
          <div>
            <span className="text-zinc-500 uppercase block mb-1" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Free</span>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              O Free permite testar a SOLO: criar perfil, explorar rolês e usar 1 convite gratuito por semana.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-white/[0.07] pt-3">
            {FREE_DETAILS.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="mt-1 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-zinc-300 text-sm font-medium"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Simple benefit row (cards) ────────────────────────────────────────────────

function BenefitRow({ text, icon, highlight }: { text: string; icon: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 text-[12px] leading-[1.6]" style={{ color: highlight ? "rgba(255,179,122,0.65)" : undefined }}>{icon}</span>
      <span className={`text-[13px] leading-[1.5] ${highlight ? "font-medium text-white/80" : "font-light text-white/55"}`}>{text}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type OpenModal = "free" | "plus" | "black" | null;
type ToastPlan = "plus" | "black" | null;

export default function PlanosPage() {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [toastPlan, setToastPlan] = useState<ToastPlan>(null);

  const closeModal = useCallback(() => setOpenModal(null), []);

  function handleInterest(plan: "plus" | "black") {
    setOpenModal(null);
    setToastPlan(plan);
  }

  useEffect(() => {
    if (!toastPlan) return;
    const t = setTimeout(() => setToastPlan(null), 4000);
    return () => clearTimeout(t);
  }, [toastPlan]);

  return (
    <div className="min-h-screen bg-[#050506] text-[#FAFAFA]">
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
            <h1 className="text-3xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>
            Planos{" "}
            <span className="text-[#F8FAFC]" style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic" }}>SOLO</span>
          </h1>
            <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed max-w-md">
              Comece grátis. Escolha Plus ou Black quando quiser sair mais, ter prioridade e acessar experiências mais exclusivas.
            </p>
          </div>
        </div>

        {/* ── Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

          {/* FREE */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Free</span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-400 flex-shrink-0">
                Plano atual
              </span>
            </div>

            <div>
              <p className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>
                R$0 <span className="text-sm font-light text-zinc-500">para começar</span>
              </p>
              <p className="text-[13px] text-zinc-400 leading-relaxed mt-2">
                Para começar, explorar a SOLO e viver a primeira experiência.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-white/[0.07] pt-4">
              {FREE_DETAILS.map((f) => <BenefitRow key={f} text={f} icon="○" />)}
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <button
                disabled
                className="w-full py-3 rounded-xl border border-white/10 text-zinc-500 text-xs font-semibold cursor-default bg-white/[0.025] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                Plano atual
              </button>
              <button
                onClick={() => setOpenModal("free")}
                className="w-full py-2.5 rounded-xl text-zinc-600 hover:text-zinc-400 text-xs font-medium transition-colors">
                Ver limites do Free
              </button>
            </div>
          </div>

          {/* PLUS */}
          <div className="relative rounded-2xl border border-violet-500/40 bg-violet-500/[0.06] p-6 flex flex-col gap-5"
            style={{ boxShadow: "0 0 48px rgba(139,92,246,0.05)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white whitespace-nowrap" style={{ background: "linear-gradient(135deg, #C94A1E, #7A2540)" }}>
              Mais escolhido
            </div>

            <span className="text-violet-400/90 uppercase pt-1" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Plus</span>

            <div>
              <p className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>
                R$19,90 <span className="text-sm font-light text-zinc-500">/mês</span>
              </p>
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
              onClick={() => setOpenModal("plus")}
              className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] transition-all duration-200 text-white text-xs font-semibold shadow-md shadow-black/25 solo-shimmer-btn">
              Ver detalhes do Plus →
            </button>
          </div>

          {/* BLACK */}
          <div className="rounded-2xl border border-white/[0.11] bg-white/[0.018] p-6 flex flex-col gap-5">
            <span className="text-zinc-400 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>SOLO Black</span>

            <div>
              <p className="text-4xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.03em" }}>
                R$49,90 <span className="text-sm font-light text-zinc-500">/mês</span>
              </p>
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
                <BenefitRow key={text} text={text} icon="◆" highlight={first ? false : undefined} />
              ))}
            </div>

            <button
              onClick={() => setOpenModal("black")}
              className="mt-auto w-full py-3 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 active:from-zinc-200 active:to-zinc-400 transition-all text-zinc-900 text-xs font-semibold">
              Ver detalhes do Black →
            </button>
          </div>

        </div>

        {/* ── Comparativo */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-zinc-500 uppercase mb-2" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>Comparativo</p>
            <h2 className="text-2xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>Na prática, o que muda?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">F</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Free</p>
                  <p className="text-zinc-500" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.12em" }}>Para experimentar.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-400 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>1 convite por semana</p>
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>Acesso básico aos rolês</p>
                <p className="flex items-start gap-2"><span className="text-zinc-600 flex-shrink-0">—</span>Participa quando o grupo já está formado</p>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.05] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0">P</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Plus</p>
                  <p className="text-violet-400/70" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.12em" }}>Para sair mais vezes.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-300 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Até 3 convites por semana</p>
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Prioridade em grupos compatíveis</p>
                <p className="flex items-start gap-2"><span className="text-violet-500/60 flex-shrink-0">+</span>Acesso antecipado a alguns rolês</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.11] bg-white/[0.018] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-[10px] font-bold text-zinc-300 flex-shrink-0">B</span>
                <div>
                  <p className="text-sm font-bold text-[#FAFAFA]">SOLO Black</p>
                  <p className="text-zinc-400" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.12em" }}>Para experiências mais exclusivas.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[13px] text-zinc-300 font-light leading-snug">
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Prioridade máxima</p>
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Acesso primeiro aos rolês mais disputados</p>
                <p className="flex items-start gap-2"><span className="text-zinc-400 flex-shrink-0">◆</span>Experiências especiais e grupos mais curados</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium flex-wrap">
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

      {/* Modals */}
      {openModal === "plus"  && <PlusModal  onClose={closeModal} onInterest={() => handleInterest("plus")}  />}
      {openModal === "black" && <BlackModal onClose={closeModal} onInterest={() => handleInterest("black")} />}
      {openModal === "free"  && <FreeModal  onClose={closeModal} />}

      {/* Toast */}
      {toastPlan && <Toast plan={toastPlan} onClose={() => setToastPlan(null)} />}
    </div>
  );
}
