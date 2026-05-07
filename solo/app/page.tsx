import Link from "next/link";

// ─── Parceiros data ───────────────────────────────────────────────────────────

const PARCEIROS = [
  { nome: "Club Noir",    bairro: "Pinheiros",    tipo: "Balada",        emoji: "🎉", dia: "Sex",  vagas: 12, bar: "bg-purple-500",  badge: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { nome: "Bar Caju",     bairro: "Vila Madalena", tipo: "Bar descolado", emoji: "🍹", dia: "Sáb",  vagas: 8,  bar: "bg-amber-500",   badge: "text-amber-400 bg-amber-500/10 border-amber-500/20"   },
  { nome: "Terraço 360",  bairro: "Itaim Bibi",    tipo: "Rooftop",       emoji: "🌆", dia: "Sáb",  vagas: 6,  bar: "bg-sky-500",     badge: "text-sky-400 bg-sky-500/10 border-sky-500/20"         },
  { nome: "Audio Club",   bairro: "Barra Funda",   tipo: "Show ao vivo",  emoji: "🎸", dia: "Sáb",  vagas: 10, bar: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Cadastre-se",
    desc: "30 segundos, sem enrolação. Crie sua conta e monte seu perfil de noite.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Escolha seu estilo",
    desc: "Balada, rooftop, bar, show ao vivo. Você define a vibe — o SOLO encontra o rolê certo.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Encontre sua turma",
    desc: "Veja quem mais vai aparecer no mesmo rolê. Chega sabendo com quem vai curtir.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-black text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <span className="text-2xl font-black text-orange-500 glow-orange select-none" style={{ letterSpacing: "-0.04em" }}>
          SOLO
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium px-4 py-2">
            Entrar
          </Link>
          <Link href="/cadastro" className="text-sm font-semibold px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5">
            Criar conta
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(249,115,22,0.15) 0%, transparent 65%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        {/* Floating orbs */}
        <div className="absolute top-32 left-1/4 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-32 right-1/4 w-48 h-48 rounded-full bg-orange-600/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 text-sm text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            🔥 Para quem quer curtir com pessoas novas — São Paulo
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tight">
            <span className="text-white">Encontre sua</span>
            <br />
            <span className="text-orange-500 glow-orange">turma pra noite.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-400 text-lg sm:text-xl max-w-xl leading-relaxed">
            SOLO conecta você com pessoas novas nos melhores bares, baladas e rolês de São Paulo.
            Experiências reais, conexões genuínas, noites que valem.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Link href="/cadastro" className="flex-1 py-4 px-8 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-2xl text-center transition-all duration-200 shadow-xl shadow-orange-500/25 hover:shadow-orange-400/40 hover:-translate-y-1 active:translate-y-0 text-base">
              Criar conta grátis
            </Link>
            <Link href="/login" className="flex-1 py-4 px-8 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl text-center transition-all duration-200 border border-zinc-700 hover:border-zinc-500 hover:-translate-y-1 active:translate-y-0 text-base">
              Já tenho conta
            </Link>
          </div>

          <p className="text-zinc-600 text-sm">Gratuito. Sem fake. Sem enrolação.</p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">scroll</span>
          <svg className="w-4 h-4 text-zinc-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <section className="border-y border-zinc-900 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "2.4k+", label: "Pessoas ativas" },
            { value: "18",    label: "Estabelecimentos" },
            { value: "100%",  label: "Gratuito" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-black text-orange-500">{s.value}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Como funciona ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Simples assim</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 tracking-tight">
              Como funciona
            </h2>
            <p className="text-zinc-400 mt-4 max-w-md mx-auto">
              Três passos e você já está no próximo rolê com pessoas que combinam com você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent pointer-events-none" />

            {STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col gap-5 p-7 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors duration-200 group">
                {/* Number + icon */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors select-none">
                    {step.num}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-black text-white">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Estabelecimentos ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Esta semana</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 tracking-tight">
                Parceiros
              </h2>
            </div>
            <Link href="/eventos" className="self-start sm:self-auto flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 font-semibold transition-colors group">
              Ver todos os eventos
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARCEIROS.map((p) => (
              <div key={p.nome} className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1">
                <div className={`h-1 w-full ${p.bar}`} />
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${p.badge}`}>
                      {p.emoji} {p.tipo}
                    </span>
                    <span className="text-xs text-zinc-600">{p.dia}</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-black text-white group-hover:text-orange-400 transition-colors">{p.nome}</h3>
                    <p className="text-xs text-zinc-500">{p.bairro}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.vagas <= 6 ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                      <span className="text-xs font-semibold text-white">{p.vagas} vagas</span>
                    </div>
                    <Link href="/cadastro" className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                      Quero ir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 mx-auto">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.759 4.03 2 6.5 2c1.922 0 3.752 1.049 4.5 2.25C12.498 3.049 14.15 2 16.5 2 18.97 2 22 3.759 22 7.191c0 4.105-5.37 8.863-11 14.402z" />
            </svg>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight">
              Chega de planejar{" "}
              <span className="text-orange-500 glow-orange">sozinho.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
              Crie sua conta em 30 segundos e entre no próximo rolê com pessoas que também querem curtir a noite.
            </p>
          </div>

          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 px-10 py-5 bg-orange-500 hover:bg-orange-400 text-white font-black text-lg rounded-2xl transition-all duration-200 shadow-2xl shadow-orange-500/30 hover:shadow-orange-400/50 hover:-translate-y-1 active:translate-y-0"
          >
            Quero entrar agora
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          <p className="text-zinc-600 text-sm">Gratuito · Sem spam · Só SP por enquanto</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-black text-orange-500 glow-orange select-none" style={{ letterSpacing: "-0.04em" }}>
            SOLO
          </span>
          <p className="text-zinc-600 text-sm">© 2026 SOLO. Feito para quem curte a noite.</p>
          <div className="flex items-center gap-6 text-sm text-zinc-600">
            <Link href="/login"    className="hover:text-zinc-400 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-zinc-400 transition-colors">Cadastro</Link>
            <Link href="/eventos"  className="hover:text-zinc-400 transition-colors">Eventos</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
