import Link from "next/link";
import Image from "next/image";

// ── Design tokens ──────────────────────────────────────────────────────────────

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

const AVS = [
  "linear-gradient(135deg,#3a2b22,#9a5a3a 65%,#FFB37A)",
  "linear-gradient(135deg,#1a1620,#4d3a52 50%,#a07a8e)",
  "linear-gradient(135deg,#2a1a14,#6e2c1c 60%,#FF7A35)",
  "linear-gradient(135deg,#3a0a18,#8a1c34 60%,#ff7090)",
];

// ── Style helpers ──────────────────────────────────────────────────────────────

const mono = (sz = "9px", cl = "rgba(255,255,255,0.50)"): React.CSSProperties => ({
  fontFamily: "var(--font-geist-mono,'Courier New',monospace)",
  fontSize: sz,
  letterSpacing: "0.40em",
  textTransform: "uppercase" as const,
  color: cl,
  lineHeight: 1.4,
});

const serif = (sz: string, cl = "#fff"): React.CSSProperties => ({
  fontFamily: "var(--font-dm-serif,Georgia,serif)",
  fontStyle: "italic",
  fontSize: sz,
  letterSpacing: "-0.030em",
  color: cl,
  lineHeight: "0.92",
});

// ── Section data ───────────────────────────────────────────────────────────────

// Warm cinematic tint per photo — layered on top of the real image
const MOMENT_OVERLAYS = [
  // Card 1: lifestyle-3 — intimate candlelit bar → wine tint
  "radial-gradient(80% 60% at 30% 0%,rgba(197,60,90,.50),transparent 70%),linear-gradient(180deg,transparent 20%,rgba(0,0,0,.88) 100%)",
  // Card 2: lifestyle-2 — women outdoor bar, blue skyline → amber tint
  "radial-gradient(80% 60% at 70% 0%,rgba(255,160,60,.35),transparent 70%),linear-gradient(180deg,transparent 20%,rgba(0,0,0,.85) 100%)",
  // Card 3: lifestyle-1 — men rooftop, warm city → ember tint
  "radial-gradient(70% 50% at 50% 30%,rgba(255,100,20,.38),transparent 65%),linear-gradient(180deg,transparent 20%,rgba(0,0,0,.85) 100%)",
];

const MOMENTS = [
  { src: "/images/lifestyle-3.jpg", when: "Qui · 21:30", title: "Mesa pequena,\nvinho longo.",   local: "Jantar · Pinheiros",      tag: "Íntimo"  },
  { src: "/images/lifestyle-2.jpg", when: "Sáb · 18:00", title: "Vista do alto,\ngente do bem.", local: "Rooftop · Itaim",         tag: "Rooftop" },
  { src: "/images/lifestyle-1.jpg", when: "Sex · 22:00", title: "Bar sem filtro,\nnoite sem pressa.", local: "Ao vivo · Vila Madalena", tag: "Show" },
];

const STEPS = [
  { num: "01", title: "Monte seu perfil de noite",   desc: "Duas perguntas. Você conta quem é e qual tipo de noite te move. Sem questionários infinitos." },
  { num: "02", title: "Escolha onde aparecer",        desc: "Bares novos, rooftops com vista, jantares com menos de 8 pessoas. Você escolhe o rolê." },
  { num: "03", title: "Apareça sabendo quem vai",     desc: "Antes de sair você já viu quem mais estará lá. Chega com intenção, sem awkwardness." },
];

const EVENTS = [
  { bg: "radial-gradient(80% 70% at 50% 30%,rgba(255,122,53,.90),transparent 65%),radial-gradient(60% 70% at 50% 100%,rgba(162,49,11,.72),transparent 80%),linear-gradient(180deg,#1a0a06,#0a0608)", live: true,  when: "Hoje · 22:00", title: "A noite está\naberta.", local: "Vila Madalena", match: "98%" },
  { bg: "radial-gradient(80% 70% at 30% 0%,rgba(197,60,90,.80),rgba(92,26,44,.55) 60%,transparent 80%),linear-gradient(180deg,#180812,#0a0608)",                                                     live: false, when: "Sex · 21:30",  title: "Mesa pequena.",     local: "Pinheiros",      match: "94%" },
  { bg: "radial-gradient(80% 70% at 70% 0%,rgba(255,178,89,.72),transparent 65%),radial-gradient(60% 60% at 30% 100%,rgba(162,90,30,.55),transparent 70%),linear-gradient(180deg,#1a1208,#0a0608)",  live: false, when: "Sáb · 18:00",  title: "Vista aberta.",     local: "Itaim Bibi",     match: "91%" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ background: "#050506", color: "#fff", overflowX: "hidden" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,6,0.82)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="relative w-5 h-5 rounded-full flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", boxShadow: "0 0 18px rgba(226,232,240,.28),inset 0 0 0 1px rgba(255,255,255,.45)" }}
          >
            <div className="absolute inset-[5px] rounded-full" style={{ background: "#050506" }} />
          </div>
          <span style={{ ...serif("20px"), lineHeight: 1 }}>SOLO</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:opacity-70 transition-opacity" style={mono("10px","rgba(255,255,255,0.48)")}>Entrar</Link>
          <Link href="/cadastro" className="flex items-center rounded-full hover:opacity-90 transition-opacity"
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", color: "#080808", boxShadow: "0 0 22px rgba(255,255,255,.14)", ...mono("10px","#080808") }}>
            Criar conta
          </Link>
        </div>
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "100svh", paddingTop: "72px" }}>
        {/* Ember atmosphere */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:
          "radial-gradient(65% 45% at 12% 0%,rgba(255,178,89,.20),transparent 70%)," +
          "radial-gradient(55% 45% at 88% 28%,rgba(197,60,90,.20),transparent 70%)," +
          "radial-gradient(75% 55% at 50% 110%,rgba(255,122,53,.24),transparent 70%)," +
          "radial-gradient(45% 40% at 92% 98%,rgba(122,91,255,.18),transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE, opacity: 0.06, mixBlendMode: "overlay" }} />
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to bottom,transparent,#050506)" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between min-h-[calc(100svh-72px)] px-6 md:px-12 pb-16 max-w-6xl mx-auto gap-12">

          {/* LEFT — copy */}
          <div className="flex flex-col gap-7 max-w-lg pt-16 md:pt-24 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF7A35", boxShadow: "0 0 10px rgba(255,122,53,.88)" }} />
              <span style={mono("9px","rgba(255,255,255,0.62)")}>São Paulo · esta semana</span>
            </div>

            <div>
              <h1 style={{ ...serif("clamp(52px,13vw,88px)"), display: "block" }}>A melhor parte</h1>
              <h1 style={{ ...serif("clamp(52px,13vw,88px)"), display: "block", background: "linear-gradient(180deg,#FFE3CC 0%,#FF9659 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                da cidade
              </h1>
              <h1 style={{ ...serif("clamp(52px,13vw,88px)"), display: "block", color: "rgba(255,255,255,0.52)" }}>
                ainda não é sua.
              </h1>
            </div>

            <p style={{ fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.68)", lineHeight: 1.65, maxWidth: "310px" }}>
              Grupos de até 8 pessoas, lugares que você ainda não conhece, conexões de verdade — toda semana, em SP.
            </p>

            <div className="flex items-center gap-3 w-fit rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "10px 16px 10px 10px" }}>
              <div className="flex">
                {AVS.map((bg, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ background: bg, border: "1.5px solid rgba(0,0,0,.65)", marginLeft: i > 0 ? "-10px" : undefined }} />
                ))}
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>+ 2.4k pessoas já estão dentro</span>
                <span style={mono("8px","rgba(255,255,255,0.42)")}>lista aberta</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/cadastro" className="flex items-center justify-between rounded-full"
                style={{ height: "56px", paddingLeft: "24px", paddingRight: "8px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", color: "#080808", boxShadow: "0 0 40px rgba(255,255,255,.16)", ...mono("11px","#080808") }}>
                <span>Pedir convite</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ background: "#080808", color: "#fff", fontSize: "16px" }}>→</span>
              </Link>
              <Link href="/login" className="flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ height: "44px", ...mono("9px","rgba(255,255,255,0.45)") }}>
                já tenho uma conta
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              <span style={mono("8px","rgba(255,255,255,0.28)")}>Por convite · SP</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            </div>
          </div>

          {/* RIGHT — floating photo cards, desktop only */}
          <div className="hidden md:block flex-shrink-0" style={{ width: "260px", position: "relative", height: "420px", alignSelf: "flex-end", marginBottom: "16px" }}>

            {/* Card back — lifestyle-5 (night dinner, intimate) */}
            <div className="absolute overflow-hidden rounded-2xl"
              style={{ width: "200px", height: "270px", bottom: 0, right: "24px", transform: "rotate(-3.5deg)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 32px 64px rgba(0,0,0,.80)" }}>
              <Image src="/images/lifestyle-5.jpg" fill sizes="220px" className="object-cover object-center" alt="" priority />
              <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 30% 0%,rgba(197,60,90,.42),transparent 70%),linear-gradient(180deg,transparent 35%,rgba(0,0,0,.82) 100%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.07, mixBlendMode: "overlay" }} />
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <span style={mono("7.5px","rgba(255,255,255,0.62)")}>Sáb · Pinheiros</span>
                <p style={{ ...serif("17px"), marginTop: "4px" }}>Jantar com<br />gente nova.</p>
              </div>
            </div>

            {/* Card front — lifestyle-4 (group dinner, energy) */}
            <div className="absolute overflow-hidden rounded-2xl"
              style={{ width: "210px", height: "290px", bottom: "20px", right: 0, transform: "rotate(2deg)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 40px 80px rgba(0,0,0,.90),0 0 0 1px rgba(255,255,255,0.05)" }}>
              <Image src="/images/lifestyle-4.jpg" fill sizes="220px" className="object-cover object-center" alt="" priority />
              <div className="absolute inset-0" style={{ background: "radial-gradient(70% 50% at 50% 30%,rgba(255,100,20,.32),transparent 65%),linear-gradient(180deg,transparent 25%,rgba(0,0,0,.85) 100%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.07, mixBlendMode: "overlay" }} />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 rounded-full"
                style={{ padding: "5px 10px", background: "rgba(0,0,0,.50)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", ...mono("7.5px","#fff") }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF7A35", boxShadow: "0 0 8px rgba(255,122,53,.9)" }} />
                acontece hoje
              </div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <span style={mono("7.5px","rgba(255,255,255,0.62)")}>Qui · Vila Madalena</span>
                <p style={{ ...serif("19px"), marginTop: "4px" }}>Noite<br />aberta.</p>
                <div className="flex items-center gap-2 mt-2">
                  {AVS.slice(0,3).map((bg,i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ background: bg, border: "1px solid rgba(0,0,0,.7)", marginLeft: i > 0 ? "-7px" : undefined }} />
                  ))}
                  <span style={mono("7px","rgba(255,255,255,0.55)")}>6 pessoas</span>
                </div>
              </div>
            </div>

            {/* Match badge */}
            <div className="absolute z-20 rounded-full"
              style={{ top: "80px", left: "10px", padding: "8px 14px", background: "rgba(5,5,6,0.88)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 8px 24px rgba(0,0,0,.6)", ...mono("8px","#fff") }}>
              98% match
            </div>
          </div>
        </div>
      </section>

      {/* ══ LIFESTYLE MOMENTS ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-3 mb-14">
            <span style={mono("9px","rgba(255,255,255,0.38)")}>O SOLO na vida real</span>
            <h2 style={{ ...serif("clamp(38px,8vw,58px)"), display: "block" }}>Três ambientes.<br />Uma noite que fica.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOMENTS.map((m, i) => (
              <div key={m.src} className="relative overflow-hidden rounded-2xl flex flex-col justify-end"
                style={{ aspectRatio: "3 / 4", border: "1px solid rgba(255,255,255,0.08)", padding: "20px" }}>
                {/* Real photo */}
                <Image src={m.src} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover object-center" alt="" />
                {/* Cinematic warm overlay */}
                <div className="absolute inset-0" style={{ background: MOMENT_OVERLAYS[i] }} />
                {/* Noise grain */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE, opacity: 0.09, mixBlendMode: "overlay" }} />

                {/* Tag badge */}
                <div className="absolute top-4 left-4 z-10 rounded-full"
                  style={{ padding: "5px 11px", ...mono("7.5px","#fff"), background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
                  {m.tag}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <span style={mono("8px","rgba(255,255,255,0.68)")}>{m.when}</span>
                  <h3 style={{ ...serif("27px"), display: "block", marginTop: "8px", whiteSpace: "pre-line" }}>{m.title}</h3>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span style={mono("7.5px","rgba(255,255,255,0.55)")}>{m.local}</span>
                    <Link href="/cadastro" className="flex-shrink-0 rounded-full hover:opacity-80 transition-opacity"
                      style={{ padding: "6px 12px", ...mono("7.5px","#fff"), background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
                      Quero ir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PHOTO COLLAGE ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">

          {/* Left tall — lifestyle-4 (diverse dinner group) */}
          <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3 / 4", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Image src="/images/lifestyle-4.jpg" fill sizes="(max-width:768px) 50vw, 50vw" className="object-cover object-center" alt="" />
            <div className="absolute inset-0" style={{ background: "radial-gradient(70% 50% at 50% 30%,rgba(255,80,0,.28),transparent 65%),linear-gradient(180deg,transparent 30%,rgba(0,0,0,.78) 100%)" }} />
            <div className="absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.08, mixBlendMode: "overlay" }} />
            <div className="absolute bottom-5 left-5 right-5 z-10">
              <p style={{ ...serif("22px"), marginBottom: "6px" }}>Conexões que<br />ficam depois.</p>
              <span style={mono("8px","rgba(255,255,255,0.52)")}>Pessoas reais · SP</span>
            </div>
          </div>

          {/* Right — two stacked */}
          <div className="flex flex-col gap-4">

            {/* Top — lifestyle-5 (intimate night dinner) */}
            <div className="relative overflow-hidden rounded-2xl flex-1" style={{ minHeight: "160px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Image src="/images/lifestyle-5.jpg" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover object-center" alt="" />
              <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 30% 0%,rgba(197,60,90,.42),transparent 70%),linear-gradient(180deg,transparent 35%,rgba(0,0,0,.82) 100%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.08, mixBlendMode: "overlay" }} />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <p style={{ ...serif("18px") }}>Noites que<br />você conta.</p>
              </div>
            </div>

            {/* Bottom — live stat card */}
            <div className="relative overflow-hidden rounded-2xl flex items-end p-5"
              style={{ minHeight: "160px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF7A35", boxShadow: "0 0 8px rgba(255,122,53,.85)" }} />
                  <span style={mono("8px","rgba(255,255,255,0.55)")}>ao vivo · SP</span>
                </div>
                <p style={{ ...serif("22px") }}>27 rolês<br />esta semana.</p>
                <Link href="/cadastro" className="hover:opacity-70 transition-opacity" style={mono("8px","rgba(255,255,255,0.45)")}>
                  Ver eventos →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════════ */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "40px 24px" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[{ v:"2.4k+", l:"em São Paulo" }, { v:"18", l:"parceiros ativos" }, { v:"100%", l:"gratuito" }].map((s) => (
            <div key={s.l} className="flex flex-col gap-2">
              <span style={{ ...serif("clamp(30px,7vw,52px)") }}>{s.v}</span>
              <span style={mono("8px","rgba(255,255,255,0.38)")}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-3 mb-14">
            <span style={mono("9px","rgba(255,255,255,0.38)")}>Como funciona</span>
            <h2 style={{ ...serif("clamp(38px,8vw,54px)"), display: "block" }}>Menos planejamento,<br />mais vida.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3"
            style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col gap-5 p-7"
                style={{ background: "rgba(255,255,255,0.025)", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : undefined, borderTop: i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
                <span style={{ ...serif("52px"), opacity: 0.18 }}>{s.num}</span>
                <div>
                  <h3 style={{ fontWeight: 500, fontSize: "15px", color: "#fff" }}>{s.title}</h3>
                  <p style={{ fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.50)", lineHeight: 1.7, marginTop: "8px" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EVENTS PREVIEW ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 96px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-8 px-6">
            <div className="flex flex-col gap-2">
              <span style={mono("9px","rgba(255,255,255,0.38)")}>Esta semana · São Paulo</span>
              <h2 style={{ ...serif("clamp(32px,7vw,48px)"), display: "block" }}>Só aparecer.</h2>
            </div>
            <Link href="/cadastro" className="hover:opacity-70 transition-opacity flex-shrink-0" style={mono("8.5px","rgba(255,255,255,0.40)")}>
              Ver todos →
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible px-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {EVENTS.map((ev, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl flex flex-col justify-end flex-shrink-0"
                style={{ width: "240px", aspectRatio: "3 / 4", background: ev.bg, border: "1px solid rgba(255,255,255,0.08)", padding: "14px" }}>
                <div className="absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.08, mixBlendMode: "overlay" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 35%,rgba(0,0,0,.80) 100%)" }} />
                {ev.live ? (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 rounded-full"
                    style={{ padding: "5px 10px", background: "rgba(0,0,0,.50)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", ...mono("7.5px","#fff") }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF7A35", boxShadow: "0 0 8px rgba(255,122,53,.92)" }} />
                    Acontece hoje
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 z-10" style={mono("7.5px","rgba(255,255,255,0.62)")}>{ev.when}</div>
                )}
                <div className="relative z-10">
                  <h3 style={{ ...serif("22px"), display: "block", whiteSpace: "pre-line" }}>{ev.title}</h3>
                  <div className="flex items-center justify-between mt-2.5 gap-2">
                    <span style={mono("7.5px","rgba(255,255,255,0.52)")}>{ev.local}</span>
                    <span className="rounded-full flex-shrink-0"
                      style={{ padding: "4px 9px", ...mono("7.5px","#fff"), background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.18)" }}>
                      {ev.match} match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ padding: "112px 24px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:
          "radial-gradient(80% 55% at 50% 110%,rgba(122,91,255,.34),transparent 70%)," +
          "radial-gradient(70% 50% at 22% 0%,rgba(197,60,90,.22),transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE, opacity: 0.06, mixBlendMode: "overlay" }} />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center gap-8">
          <span style={mono("9px","rgba(255,255,255,0.40)")}>Comece hoje</span>
          <h2 style={{ ...serif("clamp(46px,11vw,76px)"), display: "block" }}>A próxima história<br />é a sua.</h2>
          <p style={{ fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.62)", lineHeight: 1.7, maxWidth: "300px" }}>
            30 segundos para criar sua conta. O próximo grupo te espera.
          </p>
          <Link href="/cadastro" className="flex items-center justify-between rounded-full w-full max-w-xs"
            style={{ height: "56px", paddingLeft: "24px", paddingRight: "8px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", color: "#080808", boxShadow: "0 0 52px rgba(255,255,255,.15)", ...mono("11px","#080808") }}>
            <span>Entrar na lista</span>
            <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ background: "#080808", color: "#fff", fontSize: "16px" }}>→</span>
          </Link>
          <span style={mono("8px","rgba(255,255,255,0.26)")}>Gratuito · São Paulo · 2026</span>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "28px 24px" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)" }}>
              <div className="absolute inset-[4px] rounded-full" style={{ background: "#050506" }} />
            </div>
            <span style={{ ...serif("16px"), lineHeight: 1 }}>SOLO</span>
          </Link>
          <span style={mono("8px","rgba(255,255,255,0.26)")}>São Paulo · BR · 2026</span>
          <div className="flex items-center gap-6">
            {([ ["Entrar","/login"], ["Cadastro","/cadastro"], ["Eventos","/eventos"] ] as const).map(([label,href]) => (
              <Link key={href} href={href} className="hover:opacity-60 transition-opacity" style={mono("8.5px","rgba(255,255,255,0.35)")}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
