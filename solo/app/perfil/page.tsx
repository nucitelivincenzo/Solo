"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { isCompatComplete } from "@/lib/types";
import type { Ambiente, Intencao } from "@/lib/types";

const VIBE_LABELS   = ["", "Observador — prefiro ver antes de agir", "Converso quando puxam assunto", "Consigo me soltar facilmente", "Já chego puxando conversa com todos"];
const ENERGIA_LABELS = ["", "Tranquilo, drinks e conversa", "Moderado, animo conforme a noite", "Animado, danço e interajo bastante", "Alta energia — a noite não pode acabar"];
const GRUPO_LABELS  = ["", "2–3 pessoas (bem íntimo)", "4–6 pessoas (pequeno com energia)", "7–10 pessoas (grupo maior)", "Quanto mais, melhor"];
const SB_LABELS     = ["", "Fico perto de quem já conheço", "Perto de quem conheço, mas interajo com novos", "Me misturo com todos na mesma medida", "Foco em conhecer os novos"];

const AMBIENTE_LABELS: Record<Ambiente, string> = {
  bar:    "Bar tranquilo — dá pra ouvir a pessoa falar",
  happy:  "Happy hour animado, sem ser barulhento demais",
  balada: "Balada ou festa — o caos controlado",
  evento: "Evento diferente: show, rooftop, experiência",
};

const INTENCAO_LABELS: Record<Intencao, string> = {
  amizade:     "Fazer amizades de verdade",
  social:      "Ampliar meu círculo social sem pressão",
  romantico:   "Aberto(a) para algo mais romântico também",
  experiencia: "Curtir experiências e sair da rotina",
};

const NIGHT_STYLES = [
  { id: "balada",         label: "Balada",        emoji: "🎉" },
  { id: "bar_descolado",  label: "Bar descolado",  emoji: "🍹" },
  { id: "show_ao_vivo",   label: "Show ao vivo",   emoji: "🎸" },
  { id: "rooftop",        label: "Rooftop",        emoji: "🌆" },
  { id: "bar_de_bairro",  label: "Bar de bairro",  emoji: "🍺" },
  { id: "festa_tematica", label: "Festa temática", emoji: "🎭" },
];

const LOOKING_FOR = [
  { id: "novas_amizades", label: "Novas amizades",          emoji: "👋" },
  { id: "rolar_algo",     label: "Rolar algo",              emoji: "🔥" },
  { id: "networking",     label: "Networking descontraído", emoji: "💼" },
  { id: "companhia",      label: "Companhia para sair",     emoji: "🤝" },
];

const GROUP_SIZES = [
  { id: "pequeno", label: "Grupos pequenos",      sub: "4–6 pessoas",          emoji: "👥" },
  { id: "medio",   label: "Grupos médios",        sub: "7–12 pessoas",         emoji: "🎊" },
  { id: "grande",  label: "Quanto maior melhor!", sub: "Quanto mais, merrier", emoji: "🚀" },
];

function Chip({ emoji, label, sub, selected, onClick }: {
  emoji: string; label: string; sub?: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 w-full
        ${selected
          ? "bg-violet-500/10 border-violet-500/40 shadow-sm shadow-violet-500/10"
          : "bg-[#18181B] border-white/10 hover:border-white/20 hover:bg-white/5"}`}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className={`font-semibold text-sm ${selected ? "text-violet-400" : "text-[#FAFAFA]"}`}>{label}</span>
        {sub && <span className="text-xs text-zinc-500 mt-0.5 truncate">{sub}</span>}
      </span>
      {selected && (
        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{title}</h2>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface ReputacaoData {
  grupos: number;
  confirmacoes: number;
  checkins: number;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [nightStyles, setNightStyles] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [groupSize, setGroupSize] = useState("");
  const [vibe, setVibe] = useState<number | null>(null);
  const [energia, setEnergia] = useState<number | null>(null);
  const [grupo, setGrupo] = useState<number | null>(null);
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [intencao, setIntencao] = useState<Intencao | null>(null);
  const [socialBehavior, setSocialBehavior] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [reputacao, setReputacao] = useState<ReputacaoData | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("night_styles, looking_for, group_size, onboarding_completed, vibe, energia, grupo, ambiente, intencao, social_behavior")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile?.onboarding_completed) { router.replace("/onboarding"); return; }
      if (!isCompatComplete(profile)) { router.replace("/onboarding-compat"); return; }
      setUser(user);
      setName(user.user_metadata?.name || "");
      setNightStyles(profile.night_styles ?? []);
      setLookingFor(profile.looking_for ?? []);
      setGroupSize(profile.group_size ?? "");
      setVibe(profile.vibe ?? null);
      setEnergia(profile.energia ?? null);
      setGrupo(profile.grupo ?? null);
      setAmbiente(profile.ambiente as Ambiente ?? null);
      setIntencao(profile.intencao as Intencao ?? null);
      setSocialBehavior(profile.social_behavior ?? null);

      // Fetch reputation stats (graceful — tables may not exist yet)
      try {
        const [
          { count: gruposCount },
          { count: confirmCount },
          { count: checkinCount },
        ] = await Promise.all([
          supabase.from("group_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("group_confirmations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("group_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ]);
        setReputacao({
          grupos:       gruposCount      ?? 0,
          confirmacoes: confirmCount     ?? 0,
          checkins:     checkinCount     ?? 0,
        });
      } catch { /* tables not yet created */ }

      setReady(true);
    }
    init();
  }, [router]);

  function toggleNightStyle(id: string) {
    setNightStyles((p) => p.includes(id) ? p.filter((s) => s !== id) : p.length < 3 ? [...p, id] : p);
  }
  function toggleLooking(id: string) {
    setLookingFor((p) => p.includes(id) ? p.filter((s) => s !== id) : p.length < 2 ? [...p, id] : p);
  }

  async function handleSave() {
    if (!user || saveState === "saving") return;
    setSaveState("saving");
    try {
      const [authResult, profileResult] = await Promise.all([
        supabase.auth.updateUser({ data: { name: name.trim() } }),
        supabase.from("profiles").update({ night_styles: nightStyles, looking_for: lookingFor, group_size: groupSize, vibe, energia, grupo, ambiente, intencao, social_behavior: socialBehavior }).eq("user_id", user.id),
      ]);
      if (authResult.error) throw authResult.error;
      if (profileResult.error) throw profileResult.error;
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = name.trim()
    ? name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : user!.email?.[0].toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#FAFAFA]">
      <Navbar />

      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Avatar + título */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-violet-500/20 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#FAFAFA]" style={{ letterSpacing: "-0.02em" }}>Meu Perfil</h1>
            <p className="text-[#A1A1AA] text-sm mt-0.5">Edite suas informações e preferências</p>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Informações pessoais */}
        <Section title="Informações pessoais">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide" htmlFor="name">Nome</label>
              <input
                id="name" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#FAFAFA] placeholder-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Email
                <span className="ml-2 text-zinc-500 normal-case font-normal tracking-normal">somente leitura</span>
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 text-sm flex items-center gap-2 cursor-not-allowed select-none">
                <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {user!.email}
              </div>
            </div>
          </div>
        </Section>

        <div className="h-px bg-white/10" />

        <Section title="Seu estilo de noite" hint="Escolha até 3 opções">
          <div className="grid grid-cols-2 gap-2.5">
            {NIGHT_STYLES.map((opt) => (
              <Chip key={opt.id} emoji={opt.emoji} label={opt.label}
                selected={nightStyles.includes(opt.id)} onClick={() => toggleNightStyle(opt.id)} />
            ))}
          </div>
        </Section>

        <div className="h-px bg-white/10" />

        <Section title="O que você busca" hint="Escolha até 2 opções">
          <div className="flex flex-col gap-2.5">
            {LOOKING_FOR.map((opt) => (
              <Chip key={opt.id} emoji={opt.emoji} label={opt.label}
                selected={lookingFor.includes(opt.id)} onClick={() => toggleLooking(opt.id)} />
            ))}
          </div>
        </Section>

        <div className="h-px bg-white/10" />

        <Section title="Com quantas pessoas você curte sair" hint="Escolha uma opção">
          <div className="flex flex-col gap-2.5">
            {GROUP_SIZES.map((opt) => (
              <Chip key={opt.id} emoji={opt.emoji} label={opt.label} sub={opt.sub}
                selected={groupSize === opt.id} onClick={() => setGroupSize(opt.id)} />
            ))}
          </div>
        </Section>

        {/* Compatibilidade */}
        {isCompatComplete({ vibe, energia, grupo, ambiente, intencao, social_behavior: socialBehavior }) && (
          <>
            <div className="h-px bg-white/10" />

            <Section title="Seu perfil de compatibilidade" hint="Como o SOLO te conecta com outras pessoas">
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Vibe social",          value: vibe            != null ? VIBE_LABELS[vibe]            : null },
                  { label: "Energia na noite",      value: energia         != null ? ENERGIA_LABELS[energia]      : null },
                  { label: "Tamanho de grupo",      value: grupo           != null ? GRUPO_LABELS[grupo]          : null },
                  { label: "Ambiente preferido",    value: ambiente        != null ? AMBIENTE_LABELS[ambiente]    : null },
                  { label: "Intenção no app",       value: intencao        != null ? INTENCAO_LABELS[intencao]    : null },
                  { label: "Comportamento social",  value: socialBehavior  != null ? SB_LABELS[socialBehavior]   : null },
                ].map(({ label, value }) => value && (
                  <div key={label} className="flex flex-col gap-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">{value}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/onboarding-compat"
                className="mt-1 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Atualizar respostas →
              </Link>
            </Section>
          </>
        )}

        {/* Reputação */}
        {reputacao !== null && (reputacao.grupos > 0 || reputacao.confirmacoes > 0 || reputacao.checkins > 0) && (
          <>
            <div className="h-px bg-white/10" />
            <Section title="Sua jornada" hint="Histórico de participação nos grupos">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Grupos participados",    value: reputacao.grupos,       icon: "👥" },
                  { label: "Presenças confirmadas",  value: reputacao.confirmacoes, icon: "✅" },
                  { label: "Encontros realizados",   value: reputacao.checkins,     icon: "📍" },
                  {
                    label: "Taxa de comparecimento",
                    value: reputacao.confirmacoes > 0
                      ? `${Math.round((reputacao.checkins / reputacao.confirmacoes) * 100)}%`
                      : "—",
                    icon: "📊",
                  },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex flex-col gap-2 px-4 py-3.5 bg-[#18181B] border border-white/10 rounded-xl">
                    <span className="text-xl leading-none">{icon}</span>
                    <div>
                      <span className="text-2xl font-black text-[#FAFAFA] tabular-nums leading-none">{value}</span>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide mt-1 leading-tight">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Plano */}
        <div className="h-px bg-white/10" />

        <div className="rounded-2xl border border-white/10 bg-[#18181B] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seu plano</p>
              <p className="text-base font-black text-[#FAFAFA] mt-0.5">SOLO Free</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
              Ativo
            </span>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-zinc-400">Experiência inicial incluída</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-zinc-400">1 convite gratuito por semana</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pt-1">
              Quer sair mais vezes? O Plus aumenta seus convites e sua prioridade nos grupos compatíveis.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/cadastro"
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 transition-colors text-white text-xs font-semibold">
                Conhecer Plus →
              </Link>
              <Link href="/cadastro"
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-zinc-400 hover:text-zinc-300 text-xs font-medium">
                Ver Black
              </Link>
            </div>
          </div>
        </div>

        {/* Botão salvar sticky */}
        <div className="sticky bottom-6 pt-2">
          <button
            onClick={handleSave}
            disabled={saveState === "saving" || saveState === "saved"}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
              ${saveState === "saved"
                ? "bg-green-500 shadow-green-500/20 text-white"
                : saveState === "error"
                ? "bg-red-500 shadow-red-500/20 text-white"
                : saveState === "saving"
                ? "bg-violet-500/60 shadow-violet-500/10 text-white cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-400 shadow-violet-500/20 hover:shadow-violet-400/30 text-white hover:-translate-y-0.5 active:translate-y-0"
              }`}
          >
            {saveState === "saving" && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveState === "saved"  && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            {saveState === "error"  && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
            {saveState === "saving" ? "Salvando..."
             : saveState === "saved"  ? "Salvo com sucesso!"
             : saveState === "error"  ? "Erro ao salvar — tente novamente"
             : "Salvar alterações"}
          </button>
        </div>

      </main>
    </div>
  );
}
