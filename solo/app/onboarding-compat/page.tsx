"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { SoloAmbientShapes } from "@/components/SoloAmbientShapes";
import { isCompatComplete } from "@/lib/types";
import type { Ambiente, Intencao } from "@/lib/types";

// ─── Answer state ──────────────────────────────────────────────────────────────

type CompatAnswers = {
  vibe: number | null;
  energia: number | null;
  grupo: number | null;
  ambiente: Ambiente | null;
  intencao: Intencao | null;
  social_behavior: number | null;
};

const INITIAL_ANSWERS: CompatAnswers = {
  vibe: null, energia: null, grupo: null, ambiente: null, intencao: null, social_behavior: null,
};

const STEPS = ["vibe", "ambiente", "energia", "grupo", "social_behavior", "intencao"] as const;
type StepKey = typeof STEPS[number];

// ─── ProgressBar ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 tabular-nums">{current + 1} / {total}</span>
        <span className="text-xs font-semibold text-zinc-400 tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── OptionButton ──────────────────────────────────────────────────────────────

function OptionButton({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-5 py-[1.05rem] rounded-2xl border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3
        ${selected
          ? "bg-gradient-to-r from-[#C94A1E] to-[#7A2540] border-transparent text-white shadow-md shadow-black/20"
          : "bg-white/5 border-white/10 text-[#FAFAFA] hover:border-white/20 hover:bg-white/10"
        }`}
    >
      <span className="leading-snug">{label}</span>
      {selected && (
        <span className="flex-shrink-0 w-[1.1rem] h-[1.1rem] rounded-full bg-white/25 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ─── QuestionLayout ────────────────────────────────────────────────────────────

function QuestionLayout<T extends number | string>({
  step, question, options, selected, onSelect,
}: {
  step: string;
  question: string;
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <span className="text-zinc-500 uppercase" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>
          {step}
        </span>
        <h1
          className="text-[1.6rem] font-black text-[#FAFAFA] leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {question}
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <OptionButton
            key={String(opt.value)}
            label={opt.label}
            selected={selected === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── StepContent ───────────────────────────────────────────────────────────────

function StepContent({
  stepKey,
  answers,
  setAnswer,
}: {
  stepKey: StepKey;
  answers: CompatAnswers;
  setAnswer: <K extends StepKey>(key: K, value: CompatAnswers[K]) => void;
}) {
  switch (stepKey) {
    case "vibe":
      return (
        <QuestionLayout
          step="Energia que traz"
          question="Que tipo de energia você costuma trazer para um grupo?"
          options={[
            { label: "Observo primeiro e me solto aos poucos",      value: 1 },
            { label: "Sou mais tranquilo, mas entro bem no clima",  value: 2 },
            { label: "Trago leveza, humor e conversa fácil",        value: 3 },
            { label: "Puxo assunto e ajudo todo mundo a se soltar", value: 4 },
          ]}
          selected={answers.vibe}
          onSelect={(v) => setAnswer("vibe", v)}
        />
      );

    case "ambiente":
      return (
        <QuestionLayout<Ambiente>
          step="Evita na noite"
          question="O que costuma quebrar o clima para você em uma noite?"
          options={[
            { label: "Ambiente caótico onde ninguém consegue conversar", value: "bar"    },
            { label: "Grupo fechado que não integra ninguém",            value: "happy"  },
            { label: "Rolê parado, sem energia",                         value: "balada" },
            { label: "Gente que transforma tudo em networking",          value: "evento" },
          ]}
          selected={answers.ambiente}
          onSelect={(v) => setAnswer("ambiente", v)}
        />
      );

    case "energia":
      return (
        <QuestionLayout
          step="Ritmo social"
          question="Qual ritmo de noite combina mais com você?"
          options={[
            { label: "Prefiro conversa, mesa e clima mais leve",    value: 1 },
            { label: "Depende do lugar e das pessoas",              value: 2 },
            { label: "Começo tranquilo e vou animando",             value: 3 },
            { label: "Gosto de energia alta desde o início",        value: 4 },
          ]}
          selected={answers.energia}
          onSelect={(v) => setAnswer("energia", v)}
        />
      );

    case "grupo":
      return (
        <QuestionLayout
          step="Busca social"
          question="Que tipo de conexão você gostaria de encontrar?"
          options={[
            { label: "Pessoas leves para conversar e dar risada",        value: 1 },
            { label: "Gente interessante, sem pressão ou expectativa",   value: 2 },
            { label: "Companhia para viver experiências novas",          value: 3 },
            { label: "Novas amizades para sair mais vezes",              value: 4 },
          ]}
          selected={answers.grupo}
          onSelect={(v) => setAnswer("grupo", v)}
        />
      );

    case "social_behavior":
      return (
        <QuestionLayout
          step="Entrada no grupo"
          question="Quando você chega em um grupo novo, como costuma agir?"
          options={[
            { label: "Observo primeiro e depois participo",             value: 1 },
            { label: "Entro quando alguém abre espaço",                 value: 2 },
            { label: "Me solto rápido se o grupo for receptivo",        value: 3 },
            { label: "Já chego puxando assunto",                        value: 4 },
          ]}
          selected={answers.social_behavior}
          onSelect={(v) => setAnswer("social_behavior", v)}
        />
      );

    case "intencao":
      return (
        <QuestionLayout<Intencao>
          step="Noite boa é"
          question="Para você, o que faz uma noite valer a pena?"
          options={[
            { label: "Conversa boa com gente interessante",            value: "social"     },
            { label: "Rir, relaxar e sair da rotina",                  value: "romantico"  },
            { label: "Conhecer pessoas que eu veria de novo",          value: "amizade"    },
            { label: "Ir para um lugar novo e viver algo diferente",   value: "experiencia"},
          ]}
          selected={answers.intencao}
          onSelect={(v) => setAnswer("intencao", v)}
        />
      );
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingCompatPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<CompatAnswers>(INITIAL_ANSWERS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const isEdit = new URLSearchParams(window.location.search).get("edit") === "true";
        setEditMode(isEdit);

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) { router.replace("/login"); return; }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profile?.onboarding_completed) { router.replace("/onboarding"); return; }
        if (!isEdit && isCompatComplete(profile)) { router.replace("/dashboard"); return; }

        if (profile) {
          setAnswers({
            vibe:            profile.vibe            ?? null,
            energia:         profile.energia         ?? null,
            grupo:           profile.grupo           ?? null,
            ambiente:        (profile.ambiente        as Ambiente  | null) ?? null,
            intencao:        (profile.intencao        as Intencao  | null) ?? null,
            social_behavior: profile.social_behavior ?? null,
          });
        }

        setReady(true);
      } catch (e: unknown) {
        setReady(false);
        setInitError(e instanceof Error ? e.message : "Erro ao carregar seu perfil. Tente novamente.");
      }
    }
    init();
  }, [router, retryCount]);

  const currentStep = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  function setAnswer<K extends StepKey>(key: K, value: CompatAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    return answers[currentStep] !== null;
  }

  function goNext() {
    if (!canAdvance() || saving) return;
    if (!isLast) {
      setStepIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }

  function goBack() {
    if (!isFirst) setStepIndex((i) => i - 1);
  }

  async function handleFinish() {
    setSaving(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { error: sbError } = await supabase
        .from("profiles")
        .update(answers)
        .eq("user_id", user.id);
      if (sbError) throw sbError;
      router.push(editMode ? "/perfil" : "/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.");
      setSaving(false);
    }
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-[#FAFAFA] font-semibold text-sm">Algo deu errado</p>
          <p className="text-[#A1A1AA] text-xs mt-1 max-w-xs">{initError}</p>
        </div>
        <button
          onClick={() => { setInitError(""); setRetryCount((c) => c + 1); }}
          className="mt-2 px-5 py-2.5 bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] text-white text-sm font-semibold rounded-xl transition-all duration-200 solo-shimmer-btn"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050506] flex flex-col relative overflow-hidden">
      <SoloAmbientShapes />

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-1.5">
          <div className="relative w-[16px] h-[16px] rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#F8FAFC,#94A3B8)" }}>
            <div className="absolute inset-[3px] rounded-full" style={{ background: "#050506" }} />
          </div>
          <span className="text-[#F8FAFC]" style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic", fontSize: "19px", letterSpacing: "-0.01em" }}>SOLO</span>
        </div>
        {editMode ? (
          <Link href="/perfil" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
            Cancelar
          </Link>
        ) : (
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
            Pular por agora
          </Link>
        )}
      </div>

      {/* Edit-mode title */}
      {editMode && (
        <div className="px-6 pb-4">
          <p className="text-zinc-500 uppercase mb-1" style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "10px", letterSpacing: "0.18em" }}>Editar perfil</p>
          <p className="text-[#A1A1AA] text-xs">Essas respostas ajudam a SOLO a montar grupos melhores para você.</p>
        </div>
      )}

      {/* Progress */}
      <div className="px-6 pb-2">
        <ProgressBar current={stepIndex} total={totalSteps} />
      </div>

      {/* Step */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <StepContent
          stepKey={currentStep}
          answers={answers}
          setAnswer={setAnswer}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="px-6 pb-8 flex gap-3">
        {!isFirst && (
          <button
            onClick={goBack}
            disabled={saving}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-[#FAFAFA] font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-200 disabled:opacity-40"
          >
            Voltar
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canAdvance() || saving}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-black/25 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2 solo-shimmer-btn"
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLast ? (editMode ? "Salvar alterações" : "Concluir") : "Próximo"}
        </button>
      </div>

    </main>
  );
}
