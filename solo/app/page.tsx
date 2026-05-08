import Link from "next/link";

// SVG fractal noise texture — same technique used in approved mockups
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

// Avatar gradient fills (warm, varied, human-feeling)
const AVATARS = [
  "linear-gradient(135deg,#3a2b22,#9a5a3a 65%,#FFB37A)",
  "linear-gradient(135deg,#1a1620,#4d3a52 50%,#a07a8e)",
  "linear-gradient(135deg,#2a1a14,#6e2c1c 60%,#FF7A35)",
  "linear-gradient(135deg,#3a0a18,#8a1c34 60%,#ff7090)",
];

const MOMENTS = [
  {
    bg: "radial-gradient(80% 70% at 30% 0%, rgba(197,60,90,.80), rgba(92,26,44,.55) 60%, transparent 80%), linear-gradient(160deg, #180812, #0a0608)",
    when: "Qui · 21:30",
    title: "Mesa pequena,\nvinho longo.",
    local: "Jantar íntimo · Pinheiros",
    count: "6 pessoas",
  },
  {
    bg: "radial-gradient(80% 70% at 70% 0%, rgba(255,178,89,.70), transparent 65%), radial-gradient(60% 60% at 30% 100%, rgba(162,90,30,.55), transparent 70%), linear-gradient(160deg, #1a1208, #0a0608)",
    when: "Sáb · 18:00",
    title: "Vista aberta,\ntarde vira noite.",
    local: "Rooftop · Itaim Bibi",
    count: "8 pessoas",
  },
  {
    bg: "radial-gradient(70% 60% at 50% 30%, rgba(255,122,53,.80), transparent 65%), radial-gradient(60% 60% at 50% 100%, rgba(162,49,11,.65), transparent 70%), linear-gradient(160deg, #1a0a06, #0a0608)",
    when: "Sex · 22:00",
    title: "Música ao vivo,\nperto de tudo.",
    local: "Bar ao vivo · Vila Madalena",
    count: "10 pessoas",
  },
];

const STEPS = [
  { num: "01", title: "Crie seu perfil", desc: "30 segundos. Monte seu perfil de noite — vibe, estilo, o que te move." },
  { num: "02", title: "Escolha o rolê", desc: "Bares, rooftops, jantares íntimos. Você define a noite que quer ter." },
  { num: "03", title: "Conheça sua turma", desc: "Chegue sabendo quem mais vai. Conexões reais ainda antes de sair." },
];

const EVENTS = [
  {
    bg: "radial-gradient(80% 70% at 50% 30%, rgba(255,122,53,.85), transparent 65%), radial-gradient(60% 70% at 50% 100%, rgba(162,49,11,.70), transparent 80%), linear-gradient(180deg, #1a0a06, #0a0608)",
    live: true,
    when: "Hoje · 22:00",
    title: "A noite está\naberta.",
    local: "Vila Madalena",
    match: "98%",
  },
  {
    bg: "radial-gradient(80% 70% at 30% 0%, rgba(197,60,90,.75), rgba(92,26,44,.55) 60%, transparent 80%), linear-gradient(180deg, #180812, #0a0608)",
    live: false,
    when: "Sex · 21:30",
    title: "Mesa pequena.",
    local: "Pinheiros",
    match: "94%",
  },
  {
    bg: "radial-gradient(80% 70% at 70% 0%, rgba(255,178,89,.70), transparent 65%), radial-gradient(60% 60% at 30% 100%, rgba(162,90,30,.55), transparent 70%), linear-gradient(180deg, #1a1208, #0a0608)",
    live: false,
    when: "Sáb · 18:00",
    title: "Vista aberta.",
    local: "Itaim Bibi",
    match: "91%",
  },
];

// Shared inline style helpers
const monoSm = (color = "rgba(255,255,255,0.55)"): React.CSSProperties => ({
  fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
  fontSize: "9px",
  letterSpacing: "0.38em",
  textTransform: "uppercase" as const,
  color,
});

const monoXs = (color = "rgba(255,255,255,0.45)"): React.CSSProperties => ({
  fontFamily: "var(--font-geist-mono, 'Courier New', monospace)",
  fontSize: "8px",
  letterSpacing: "0.28em",
  textTransform: "uppercase" as const,
  color,
});

export default function Home() {
  return (
    <div style={{ background: "#050506", color: "#fff", overflowX: "hidden" }}>

      {/* ────────────────── NAVBAR ────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(5,5,6,0.80)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative w-5 h-5 rounded-full flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
              boxShadow: "0 0 18px rgba(226,232,240,.28), inset 0 0 0 1px rgba(255,255,255,.45)",
            }}
          >
            <div className="absolute inset-[5px] rounded-full" style={{ background: "#050506" }} />
          </div>
          <span
            className="font-serif italic text-white"
            style={{ fontSize: "20px", letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            SOLO
          </span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="transition-colors" style={monoSm("rgba(255,255,255,0.45)")}>
            <span className="hover:text-white/70">Entrar</span>
          </Link>
          <Link
            href="/cadastro"
            className="flex items-center gap-2 rounded-full px-4 py-2.5"
            style={{
              background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
              color: "#080808",
              boxShadow: "0 0 22px rgba(255,255,255,.14)",
              ...monoSm("#080808"),
              fontSize: "10px",
            }}
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* ────────────────── HERO ────────────────── */}
      <section
        className="relative min-h-screen flex flex-col justify-end overflow-hidden"
        style={{ paddingTop: "96px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}
      >
        {/* Ember atmospheric background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(65% 45% at 12% 0%, rgba(255,178,89,.20), transparent 70%),
              radial-gradient(55% 45% at 88% 28%, rgba(197,60,90,.20), transparent 70%),
              radial-gradient(75% 55% at 50% 105%, rgba(255,122,53,.25), transparent 70%),
              radial-gradient(45% 40% at 92% 98%, rgba(122,91,255,.18), transparent 70%)
            `,
          }}
        />
        {/* Noise grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: NOISE, opacity: 0.06, mixBlendMode: "overlay" }}
        />
        {/* Bottom fade to section below */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #050506)" }}
        />

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col gap-7">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#FF7A35", boxShadow: "0 0 10px rgba(255,122,53,.85)" }}
            />
            <span style={monoSm("rgba(255,255,255,0.62)")}>27 SOLOs essa semana</span>
          </div>

          {/* Headline */}
          <div>
            <h1
              className="font-serif italic text-white leading-none"
              style={{ fontSize: "clamp(58px, 15vw, 92px)", letterSpacing: "-0.032em" }}
            >
              Sua noite,
            </h1>
            <h1
              className="font-serif italic leading-none"
              style={{
                fontSize: "clamp(58px, 15vw, 92px)",
                letterSpacing: "-0.032em",
                background: "linear-gradient(180deg, #FFE3CC 0%, #FF9659 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              começa aqui.
            </h1>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "Inter, var(--font-geist-sans), sans-serif",
              fontWeight: 300,
              fontSize: "15px",
              color: "rgba(255,255,255,0.70)",
              lineHeight: "1.6",
              maxWidth: "300px",
            }}
          >
            Pequenos grupos curados. Bares e mesas que você ainda não conhece. Experiências reais com pessoas reais.
          </p>

          {/* Social proof */}
          <div
            className="flex items-center gap-3 w-fit rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              padding: "10px 16px 10px 10px",
            }}
          >
            <div className="flex" style={{ gap: "-8px" }}>
              {AVATARS.map((bg, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    background: bg,
                    border: "1.5px solid rgba(0,0,0,.65)",
                    marginLeft: i > 0 ? "-10px" : undefined,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>+ 2.4k em São Paulo</span>
              <span style={monoXs("rgba(255,255,255,0.45)")}>Lista aberta</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href="/cadastro"
              className="flex items-center justify-between rounded-full"
              style={{
                height: "56px",
                paddingLeft: "24px",
                paddingRight: "8px",
                background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
                color: "#080808",
                boxShadow: "0 0 36px rgba(255,255,255,.16)",
                ...monoSm("#080808"),
                fontSize: "11px",
              }}
            >
              <span>Pedir convite</span>
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full"
                style={{ background: "#080808", color: "#fff", fontSize: "15px" }}
              >
                →
              </span>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center"
              style={{ height: "44px", ...monoSm("rgba(255,255,255,0.48)") }}
            >
              já tenho uma conta
            </Link>
          </div>

          {/* Invite tag */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            <span style={monoXs("rgba(255,255,255,0.30)")}>Por convite · SP</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          </div>
        </div>
      </section>

      {/* ────────────────── LIFESTYLE MOMENTS ────────────────── */}
      <section style={{ padding: "80px 24px 96px" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-12">
            <span style={monoSm("rgba(255,255,255,0.40)")}>O que te espera</span>
            <h2
              className="font-serif italic text-white leading-none"
              style={{ fontSize: "clamp(38px, 8vw, 58px)", letterSpacing: "-0.028em" }}
            >
              Noites que<br />valem a história.
            </h2>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOMENTS.map((m, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden flex flex-col justify-end"
                style={{
                  aspectRatio: "3 / 4",
                  background: m.bg,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "20px",
                }}
              >
                {/* Noise */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: NOISE, opacity: 0.07, mixBlendMode: "overlay" }}
                />
                {/* Gradient grade */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,.72) 100%)" }}
                />
                {/* Content */}
                <div className="relative z-10">
                  <span style={monoXs("rgba(255,255,255,0.65)")}>{m.when}</span>
                  <h3
                    className="font-serif italic text-white leading-none mt-2"
                    style={{ fontSize: "27px", letterSpacing: "-0.022em", whiteSpace: "pre-line" }}
                  >
                    {m.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span style={monoXs("rgba(255,255,255,0.52)")}>{m.local}</span>
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{
                        padding: "5px 10px",
                        ...monoXs("#fff"),
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                      }}
                    >
                      {m.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── STATS STRIP ────────────────── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "40px 24px",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "2.4k+", label: "Pessoas ativas" },
            { value: "18",    label: "Estabelecimentos" },
            { value: "100%",  label: "Gratuito" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-2">
              <span
                className="font-serif italic text-white leading-none"
                style={{ fontSize: "clamp(30px, 7vw, 52px)", letterSpacing: "-0.028em" }}
              >
                {s.value}
              </span>
              <span style={monoXs("rgba(255,255,255,0.40)")}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section style={{ padding: "96px 24px" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 mb-14">
            <span style={monoSm("rgba(255,255,255,0.38)")}>Como funciona</span>
            <h2
              className="font-serif italic text-white leading-none"
              style={{ fontSize: "clamp(38px, 8vw, 54px)", letterSpacing: "-0.028em" }}
            >
              Simples assim,<br />sério.
            </h2>
          </div>

          {/* Steps grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex flex-col gap-5 p-7"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                }}
              >
                <span
                  className="font-serif italic text-white leading-none"
                  style={{ fontSize: "52px", letterSpacing: "-0.025em", opacity: 0.18 }}
                >
                  {step.num}
                </span>
                <div>
                  <h3
                    className="text-white"
                    style={{
                      fontFamily: "var(--font-geist-sans), sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "Inter, var(--font-geist-sans), sans-serif",
                      fontWeight: 300,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.52)",
                      lineHeight: "1.65",
                      marginTop: "8px",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── EVENTS PREVIEW ────────────────── */}
      <section style={{ padding: "0 0 96px" }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 px-6">
            <div className="flex flex-col gap-2">
              <span style={monoSm("rgba(255,255,255,0.38)")}>Esta semana</span>
              <h2
                className="font-serif italic text-white leading-none"
                style={{ fontSize: "clamp(32px, 7vw, 48px)", letterSpacing: "-0.025em" }}
              >
                Próximos rolês.
              </h2>
            </div>
            <Link
              href="/cadastro"
              className="flex-shrink-0"
              style={{ ...monoXs("rgba(255,255,255,0.45)"), fontSize: "9px" }}
            >
              Ver todos →
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div
            className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible px-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {EVENTS.map((ev, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden flex flex-col justify-end flex-shrink-0"
                style={{
                  width: "240px",
                  aspectRatio: "3 / 4",
                  background: ev.bg,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "14px",
                }}
              >
                {/* Noise */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: NOISE, opacity: 0.07, mixBlendMode: "overlay" }}
                />
                {/* Grade */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,.78) 100%)" }}
                />
                {/* Live badge */}
                {ev.live && (
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 z-10 rounded-full"
                    style={{
                      padding: "5px 10px",
                      background: "rgba(0,0,0,.50)",
                      border: "1px solid rgba(255,255,255,.20)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      ...monoXs("#fff"),
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#FF7A35", boxShadow: "0 0 8px rgba(255,122,53,.9)" }}
                    />
                    Acontece hoje
                  </div>
                )}
                {/* When (non-live) */}
                {!ev.live && (
                  <div className="absolute top-3 left-3 z-10" style={monoXs("rgba(255,255,255,0.65)")}>
                    {ev.when}
                  </div>
                )}
                {/* Content */}
                <div className="relative z-10">
                  <h3
                    className="font-serif italic text-white leading-none"
                    style={{ fontSize: "22px", letterSpacing: "-0.020em", whiteSpace: "pre-line" }}
                  >
                    {ev.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2.5">
                    <span style={monoXs("rgba(255,255,255,0.55)")}>{ev.local}</span>
                    <span
                      className="rounded-full"
                      style={{
                        padding: "4px 9px",
                        ...monoXs("#fff"),
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      {ev.match} match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── FINAL CTA ────────────────── */}
      <section className="relative overflow-hidden" style={{ padding: "112px 24px" }}>
        {/* Twilight atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(80% 55% at 50% 105%, rgba(122,91,255,.32), transparent 70%),
              radial-gradient(70% 50% at 25% 0%, rgba(197,60,90,.22), transparent 70%)
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: NOISE, opacity: 0.06, mixBlendMode: "overlay" }}
        />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center gap-8">
          <span style={monoSm("rgba(255,255,255,0.40)")}>Sua próxima noite</span>

          <h2
            className="font-serif italic text-white leading-none"
            style={{ fontSize: "clamp(46px, 11vw, 76px)", letterSpacing: "-0.032em" }}
          >
            Chega de planejar<br />sozinho.
          </h2>

          <p
            style={{
              fontFamily: "Inter, var(--font-geist-sans), sans-serif",
              fontWeight: 300,
              fontSize: "15px",
              color: "rgba(255,255,255,0.62)",
              lineHeight: "1.65",
              maxWidth: "320px",
            }}
          >
            Crie sua conta em 30 segundos e entre no próximo rolê com pessoas que combinam com você.
          </p>

          <Link
            href="/cadastro"
            className="flex items-center justify-between rounded-full w-full max-w-xs"
            style={{
              height: "56px",
              paddingLeft: "24px",
              paddingRight: "8px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
              color: "#080808",
              boxShadow: "0 0 48px rgba(255,255,255,.14)",
              ...monoSm("#080808"),
              fontSize: "11px",
            }}
          >
            <span>Começar agora</span>
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: "#080808", color: "#fff", fontSize: "15px" }}
            >
              →
            </span>
          </Link>

          <span style={monoXs("rgba(255,255,255,0.28)")}>Gratuito · São Paulo · 2026</span>
        </div>
      </section>

      {/* ────────────────── FOOTER ────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "28px 24px",
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="relative w-4 h-4 rounded-full flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)",
              }}
            >
              <div className="absolute inset-[4px] rounded-full" style={{ background: "#050506" }} />
            </div>
            <span
              className="font-serif italic text-white"
              style={{ fontSize: "16px", letterSpacing: "-0.02em" }}
            >
              SOLO
            </span>
          </div>

          <span style={monoXs("rgba(255,255,255,0.28)")}>São Paulo · BR · 2026</span>

          <div className="flex items-center gap-6">
            {([["Entrar", "/login"], ["Cadastro", "/cadastro"], ["Eventos", "/eventos"]] as const).map(
              ([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:opacity-70 transition-opacity"
                  style={monoXs("rgba(255,255,255,0.35)")}
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
