"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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
        <span className="text-xs font-semibold text-violet-400 tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300 ease-out"
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
          ? "bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/20"
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
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
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
          step="Vibe social"
          question="Como você costuma se comportar num rolê com pessoas novas?"
          options={[
            { label: "Fico mais na minha, prefiro observar antes",         value: 1 },
            { label: "Converso quando puxam assunto, mas não tomo a frente", value: 2 },
            { label: "Consigo me soltar, gosto de conversar",              value: 3 },
            { label: "Já chego puxando conversa com todo mundo",           value: 4 },
          ]}
          selected={answers.vibe}
          onSelect={(v) => setAnswer("vibe", v)}
        />
      );

    case "ambiente":
      return (
        <QuestionLayout<Ambiente>
          step="Tipo de ambiente"
          question="Qual tipo de ambiente combina mais com você?"
          options={[
            { label: "Bar tranquilo, dá pra ouvir a pessoa falar",  value: "bar"    },
            { label: "Happy hour animado, sem ser barulhento demais", value: "happy"  },
            { label: "Balada ou festa, prefiro o caos controlado",   value: "balada" },
            { label: "Evento diferente: show, rooftop, experiência", value: "evento" },
          ]}
          selected={answers.ambiente}
          onSelect={(v) => setAnswer("ambiente", v)}
        />
      );

    case "energia":
      return (
        <QuestionLayout
          step="Nível de energia"
          question="Qual é o seu ritmo numa noite fora?"
          options={[
            { label: "Tranquilo, prefiro conversa e drinks",      value: 1 },
            { label: "Moderado, me animo conforme a noite avança", value: 2 },
            { label: "Animado, gosto de dançar e interagir bastante", value: 3 },
            { label: "Alta energia, quero que a noite não acabe",  value: 4 },
          ]}
          selected={answers.energia}
          onSelect={(v) => setAnswer("energia", v)}
        />
      );

    case "grupo":
      return (
        <QuestionLayout
          step="Tamanho de grupo ideal"
          question="Com quantas pessoas você curte mais sair?"
          options={[
            { label: "2–3 pessoas, prefiro algo mais íntimo",         value: 1 },
            { label: "4–6, um grupo pequeno mas com energia",         value: 2 },
            { label: "7–10, gosto de um grupo maior",                 value: 3 },
            { label: "Quanto mais gente, melhor",                     value: 4 },
          ]}
          selected={answers.grupo}
          onSelect={(v) => setAnswer("grupo", v)}
        />
      );

    case "social_behavior":
      return (
        <QuestionLayout
          step="Comportamento social"
          question="Quando está num grupo misturado (pessoas que conhece + pessoas novas), você tende a:"
          options={[
            { label: "Ficar perto de quem já conheço",                              value: 1 },
            { label: "Ficar perto de quem conheço, mas interagir com os novos",     value: 2 },
            { label: "Me misturar com todos na mesma medida",                        value: 3 },
            { label: "Focar em conhecer os novos — já sei tudo sobre os outros",     value: 4 },
          ]}
          selected={answers.social_behavior}
          onSelect={(v) => setAnswer("social_behavior", v)}
        />
      );

    case "intencao":
      return (
        <QuestionLayout<Intencao>
          step="Intenção no app"
          question="O que você está buscando principalmente aqui?"
          options={[
            { label: "Fazer amizades de verdade",                    value: "amizade"    },
            { label: "Ampliar meu círculo social sem pressão",       value: "social"     },
            { label: "Aberto(a) para algo mais romântico também",    value: "romantico"  },
            { label: "Curtir experiências e sair da rotina",         value: "experiencia"},
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

  useEffect(() => {
    async function init() {
      try {
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
        if (isCompatComplete(profile)) { router.replace("/dashboard"); return; }

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
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.");
      setSaving(false);
    }
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex flex-col items-center justify-center gap-4 px-6 text-center">
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
          className="mt-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-400 text-white text-sm font-semibold rounded-xl transition-colors"
        >
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

  return (
    <main className="min-h-screen bg-[#0F0F11] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <span
          className="text-xl font-black text-violet-500 glow-violet"
          style={{ letterSpacing: "-0.04em" }}
        >
          SOLO
        </span>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Pular por agora
        </Link>
      </div>

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
          className="flex-1 py-4 rounded-2xl bg-violet-500 hover:bg-violet-400 active:bg-violet-600 disabled:bg-white/10 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-violet-500/20 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2"
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLast ? "Concluir" : "Próximo"}
        </button>
      </div>

    </main>
  );
}
