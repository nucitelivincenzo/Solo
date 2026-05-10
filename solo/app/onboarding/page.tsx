"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SoloAmbientShapes } from "@/components/SoloAmbientShapes";

const STEP1_OPTIONS = [
  { id: "happy_hour",     label: "Happy hour",      emoji: "🍸" },
  { id: "bar_casual",     label: "Bar casual",       emoji: "🍻" },
  { id: "jantar_grupo",   label: "Jantar em grupo",  emoji: "🍽️" },
  { id: "rooftop",        label: "Rooftop",          emoji: "🏙️" },
  { id: "balada_premium", label: "Balada premium",   emoji: "🪩" },
  { id: "noite_drinks",   label: "Noite com drinks", emoji: "🍹" },
];

const STEP2_OPTIONS = [
  { id: "novas_amizades", label: "Novas amizades",         emoji: "👋" },
  { id: "rolar_algo",     label: "Rolar algo",             emoji: "🔥" },
  { id: "networking",     label: "Networking descontraído",emoji: "💼" },
  { id: "companhia",      label: "Companhia para sair",    emoji: "🤝" },
];

const STEP3_OPTIONS = [
  { id: "pequeno", label: "Grupos pequenos",       sub: "4–6 pessoas",          emoji: "👥" },
  { id: "medio",   label: "Grupos médios",         sub: "7–12 pessoas",         emoji: "🎊" },
  { id: "grande",  label: "Quanto maior melhor!",  sub: "Quanto mais, merrier", emoji: "🚀" },
];

const STEPS = [
  { number: 1, title: "Qual é o seu\nestilo de noite?", hint: "Escolha até 3 opções" },
  { number: 2, title: "O que você\nbusca?",             hint: "Escolha até 2 opções" },
  { number: 3, title: "Com quantas pessoas\nvocê curte sair?", hint: "Escolha uma opção" },
];

function Chip({ emoji, label, sub, selected, onClick }: {
  emoji: string; label: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 w-full
        ${selected
          ? "bg-white/[0.09] border-white/25"
          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"}`}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="flex flex-col flex-1">
        <span className="font-semibold text-sm text-[#FAFAFA]">{label}</span>
        {sub && <span className="text-xs text-zinc-500 mt-0.5">{sub}</span>}
      </span>
      {selected && (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nightStyles, setNightStyles] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);
    });
  }, [router]);

  function toggleStyle(id: string) {
    setNightStyles((p) => p.includes(id) ? p.filter((s) => s !== id) : p.length < 3 ? [...p, id] : p);
  }
  function toggleLooking(id: string) {
    setLookingFor((p) => p.includes(id) ? p.filter((s) => s !== id) : p.length < 2 ? [...p, id] : p);
  }
  function canAdvance() {
    if (step === 1) return nightStyles.length > 0;
    if (step === 2) return lookingFor.length > 0;
    return groupSize !== "";
  }
  function goNext() {
    if (!canAdvance() || animating) return;
    if (step < 3) { setAnimating(true); setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 180); }
    else handleFinish();
  }
  function goBack() {
    if (step > 1 && !animating) { setAnimating(true); setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 180); }
  }

  async function handleFinish() {
    if (!userId) return;
    setSaving(true); setError("");
    try {
      const { error: sbError } = await supabase.from("profiles").upsert(
        { user_id: userId, night_styles: nightStyles, looking_for: lookingFor, group_size: groupSize, onboarding_completed: true },
        { onConflict: "user_id" }
      );
      if (sbError) throw sbError;
      router.push("/onboarding-compat");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.");
      setSaving(false);
    }
  }

  const currentStep = STEPS[step - 1];

  return (
    <main className="min-h-screen bg-[#050506] flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 0%, rgba(255,179,122,0.05) 0%, transparent 70%)" }} />
      <SoloAmbientShapes />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center">
            <div className="relative w-[18px] h-[18px] rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#F8FAFC,#94A3B8)" }}>
              <div className="absolute inset-[3px] rounded-full" style={{ background: "#050506" }} />
            </div>
            <span className="text-[#F8FAFC]" style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic", fontSize: "22px", letterSpacing: "-0.01em" }}>SOLO</span>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((s) => (
              <div key={s.number} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: step >= s.number ? "100%" : "0%" }} />
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 text-right">Passo {step} de {STEPS.length}</p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 transition-opacity duration-180" style={{ opacity: animating ? 0 : 1 }}>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA] leading-tight whitespace-pre-line">{currentStep.title}</h1>
            <p className="text-sm text-zinc-500 mt-1">{currentStep.hint}</p>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2.5">
              {STEP1_OPTIONS.map((opt) => (
                <Chip key={opt.id} emoji={opt.emoji} label={opt.label} selected={nightStyles.includes(opt.id)} onClick={() => toggleStyle(opt.id)} />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2.5">
              {STEP2_OPTIONS.map((opt) => (
                <Chip key={opt.id} emoji={opt.emoji} label={opt.label} selected={lookingFor.includes(opt.id)} onClick={() => toggleLooking(opt.id)} />
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-2.5">
              {STEP3_OPTIONS.map((opt) => (
                <Chip key={opt.id} emoji={opt.emoji} label={opt.label} sub={opt.sub} selected={groupSize === opt.id} onClick={() => setGroupSize(opt.id)} />
              ))}
            </div>
          )}
        </div>

        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={goBack} disabled={saving}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-zinc-400 font-semibold hover:bg-white/5 hover:border-white/20 transition-all duration-200 text-sm">
              Voltar
            </button>
          )}
          <button onClick={goNext} disabled={!canAdvance() || saving}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#C94A1E] to-[#7A2540] hover:from-[#E05525] hover:to-[#8B2F4C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-black/25 hover:-translate-y-0.5 active:translate-y-0 text-sm solo-shimmer-btn">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : step === 3 ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </main>
  );
}
