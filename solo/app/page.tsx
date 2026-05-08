import Link from "next/link";
import Image from "next/image";

// ── Noise texture (SVG grain, same as approved mockups) ───────────────────────
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

// ── Style helpers ──────────────────────────────────────────────────────────────
const mono = (sz = "9px", cl = "rgba(255,255,255,0.50)"): React.CSSProperties => ({
  fontFamily: "var(--font-geist-mono,'Courier New',monospace)",
  fontSize: sz, letterSpacing: "0.40em",
  textTransform: "uppercase" as const,
  color: cl, lineHeight: 1.4,
});
const serif = (sz: string, cl = "#fff"): React.CSSProperties => ({
  fontFamily: "var(--font-dm-serif,Georgia,serif)",
  fontStyle: "italic", fontSize: sz,
  letterSpacing: "-0.030em", color: cl, lineHeight: "0.92",
});

// ── Data ───────────────────────────────────────────────────────────────────────

const AVS = [
  "linear-gradient(135deg,#3a2b22,#9a5a3a 65%,#FFB37A)",
  "linear-gradient(135deg,#1a1620,#4d3a52 50%,#a07a8e)",
  "linear-gradient(135deg,#2a1a14,#6e2c1c 60%,#FF7A35)",
  "linear-gradient(135deg,#3a0a18,#8a1c34 60%,#ff7090)",
];

// Moments: photo ↔ copy ↔ atmosphere aligned
const MOMENTS = [
  {
    src: "/images/lifestyle-3.jpg",      // intimate candlelit bar → wine overlay
    overlay: "radial-gradient(90% 65% at 20% 0%,rgba(197,60,90,.38),transparent 65%),linear-gradient(180deg,transparent 22%,rgba(0,0,0,.72) 100%)",
    when: "Qui · 21:30", tag: "Jantar íntimo",
    title: "Mesa pequena,\nvinho longo.",
    local: "Jantar · Pinheiros",
  },
  {
    src: "/images/lifestyle-2.jpg",      // women outdoor, city skyline → perfect for rooftop
    overlay: "radial-gradient(80% 55% at 55% 5%,rgba(122,91,255,.30),transparent 65%),linear-gradient(180deg,transparent 22%,rgba(0,0,0,.72) 100%)",
    when: "Sáb · 18:00", tag: "Rooftop",
    title: "Noite a céu aberto,\ncidade aos pés.",
    local: "Rooftop · Itaim",
  },
  {
    src: "/images/lifestyle-5.jpg",      // diverse mixed group dinner → warm energy
    overlay: "radial-gradient(80% 55% at 70% 5%,rgba(255,165,60,.28),transparent 65%),linear-gradient(180deg,transparent 22%,rgba(0,0,0,.72) 100%)",
    when: "Sex · 22:00", tag: "Bar social",
    title: "Mesa boa,\ngente melhor.",
    local: "Bar · Vila Madalena",
  },
];

const TESTIMONIALS = [
  {
    quote: "Cheguei sozinha achando que ia ser estranho. Em 15 minutos já estava rindo com todo mundo. Voltei na semana seguinte.",
    name: "Larissa", age: 27, event: "Jantar · Pinheiros",
    av: "linear-gradient(135deg,#3a0a18,#8a1c34 60%,#ff7090)",
  },
  {
    quote: "A curadoria é real. Todo mundo ali tinha algo em comum. Não pareceu um app — pareceu uma descoberta.",
    name: "Pedro", age: 31, event: "Rooftop · Itaim",
    av: "linear-gradient(135deg,#0e1a24,#2e4a66 60%,#7a90a8)",
  },
  {
    quote: "Já fui em 4 rolês. Virei amiga de duas pessoas que conheci lá. Não foi forçado — foi totalmente orgânico.",
    name: "Ana Clara", age: 29, event: "Bar · Vila Madalena",
    av: "linear-gradient(135deg,#1a1620,#4d3a52 50%,#a07a8e)",
  },
  {
    quote: "Minha semana não faz sentido sem pelo menos um SOLO. Virou rotina boa.",
    name: "Thiago", age: 33, event: "Jantar · Moema",
    av: "linear-gradient(135deg,#2a1a14,#6e2c1c 60%,#FF7A35)",
  },
];

const STEPS = [
  { num: "01", title: "Monte seu perfil de noite",  desc: "Duas perguntas. Você conta quem é e qual tipo de noite te move. Sem questionários infinitos." },
  { num: "02", title: "Escolha onde aparecer",       desc: "Bares novos, rooftops com vista, jantares com menos de 8 pessoas. Você escolhe o rolê." },
  { num: "03", title: "Apareça sabendo quem vai",    desc: "Antes de sair você já viu quem mais estará lá. Chega com intenção, sem awkwardness." },
];

const EVENTS = [
  { bg: "radial-gradient(80% 70% at 50% 30%,rgba(255,122,53,.90),transparent 65%),radial-gradient(60% 70% at 50% 100%,rgba(162,49,11,.72),transparent 80%),linear-gradient(180deg,#1a0a06,#0a0608)", live: true,  when: "Hoje · 22:00", title: "A noite está\naberta.",  local: "Vila Madalena", match: "98%" },
  { bg: "radial-gradient(80% 70% at 30% 0%,rgba(197,60,90,.80),rgba(92,26,44,.55) 60%,transparent 80%),linear-gradient(180deg,#180812,#0a0608)",                                                     live: false, when: "Sex · 21:30",  title: "Mesa pequena.", local: "Pinheiros",     match: "94%" },
  { bg: "radial-gradient(80% 70% at 70% 0%,rgba(255,178,89,.72),transparent 65%),radial-gradient(60% 60% at 30% 100%,rgba(162,90,30,.55),transparent 70%),linear-gradient(180deg,#1a1208,#0a0608)",  live: false, when: "Sáb · 18:00",  title: "Vista aberta.",  local: "Itaim Bibi",    match: "91%" },
];

const FAQS = [
  { q: "O SOLO é um dating app?",                   a: "Não. O SOLO é sobre experiências sociais em grupo. Você vai conhecer pessoas novas em bares e jantares incríveis — o que acontecer depois é por conta própria." },
  { q: "Preciso ir sozinho?",                        a: "Esse é o ponto. Você vai sozinho, mas chega sabendo quem mais estará lá. Grupos de 4 a 8 pessoas curados por compatibilidade de vibe." },
  { q: "Como o SOLO monta os grupos?",               a: "Com base no seu perfil de noite — vibe, interesses, ritmo social. O algoritmo monta o grupo. Você só aparece." },
  { q: "A SOLO é gratuita?",                         a: "Você pode criar sua conta, montar seu perfil e participar da experiência inicial gratuitamente. Os planos Plus e Black desbloqueiam mais convites, prioridade nos grupos e acesso a experiências mais exclusivas." },
  { q: "Qual a diferença entre Free, Plus e Black?", a: "Free é para começar. Plus é para quem quer sair mais vezes e ter prioridade nos grupos certos. Black é para quem quer acesso aos rolês mais disputados, grupos mais curados e experiências especiais." },
  { q: "O Premium garante grupo?",                   a: "Não força conexões. Ele aumenta sua prioridade e acesso, mas os grupos continuam sendo formados por compatibilidade, disponibilidade e interesse no mesmo rolê." },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ background: "#050506", color: "#fff", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════ NAVBAR */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(5,5,6,0.78)", borderBottom: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-5 h-5 rounded-full flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", boxShadow: "0 0 18px rgba(226,232,240,.28),inset 0 0 0 1px rgba(255,255,255,.45)" }}>
            <div className="absolute inset-[5px] rounded-full" style={{ background: "#050506" }} />
          </div>
          <span style={{ ...serif("20px"), lineHeight: 1 }}>SOLO</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:opacity-70 transition-opacity" style={mono("10px","rgba(255,255,255,0.48)")}>Entrar</Link>
          <Link href="/cadastro" className="rounded-full hover:opacity-90 transition-opacity"
            style={{ padding: "10px 20px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", color: "#080808", boxShadow: "0 0 22px rgba(255,255,255,.14)", ...mono("10px","#080808") }}>
            Criar conta
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════ HERO — full-bleed photo */}
      <section className="relative overflow-hidden" style={{ minHeight: "100svh" }}>

        {/* Real photo — lifestyle-4: most diverse group (mixed gender, multiple races) */}
        <Image
          src="/images/lifestyle-4.jpg"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 30%" }}
          alt=""
          priority
        />

        {/* Cinematic overlay stack */}
        {/* 1. Top dark — navbar readability, reduced to let photo breathe */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom,rgba(5,5,6,.50) 0%,rgba(5,5,6,.08) 28%,rgba(5,5,6,.04) 48%,rgba(5,5,6,.45) 68%,rgba(5,5,6,.95) 88%,#050506 100%)" }} />
        {/* 2. Subtle atmospheric tint */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(70% 50% at 20% 90%,rgba(255,100,30,.12),transparent 70%),radial-gradient(60% 40% at 80% 0%,rgba(197,60,90,.10),transparent 65%)" }} />
        {/* 3. Noise grain */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE, opacity: 0.07, mixBlendMode: "overlay" }} />

        {/* Content — pinned to bottom */}
        <div className="absolute inset-0 flex flex-col justify-end pb-14 pt-20 px-6 md:px-12">
          <div className="max-w-xl">

            <div className="flex items-center gap-2.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF7A35", boxShadow: "0 0 10px rgba(255,122,53,.88)" }} />
              <span style={mono("9px","rgba(255,255,255,0.65)")}>São Paulo · 2.4k pessoas</span>
            </div>

            {/* Headline — human, social, relatable */}
            <div className="mb-6">
              <h1 style={{ ...serif("clamp(52px,13vw,90px)"), display: "block" }}>Sua turma existe.</h1>
              <h1 style={{
                ...serif("clamp(52px,13vw,90px)"), display: "block",
                background: "linear-gradient(180deg,#FFE3CC 0%,#FF9040 100%)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>Vocês só ainda não se encontraram.</h1>
            </div>

            <p style={{ fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, maxWidth: "340px", marginBottom: "28px" }}>
              O SOLO reúne grupos de até 8 pessoas em bares, rooftops e jantares em SP — toda semana, lugares novos, pessoas novas.
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-3 w-fit rounded-full mb-7"
              style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "10px 16px 10px 10px" }}>
              <div className="flex">
                {AVS.map((bg, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ background: bg, border: "1.5px solid rgba(0,0,0,.70)", marginLeft: i > 0 ? "-10px" : undefined }} />
                ))}
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: "12px", fontWeight: 500, color: "#fff", lineHeight: 1.3 }}>+ 2.4k já estão dentro</span>
                <span style={mono("8px","rgba(255,255,255,0.45)")}>lista aberta · SP</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 max-w-xs">
              <Link href="/cadastro" className="flex items-center justify-between rounded-full"
                style={{ height: "56px", paddingLeft: "24px", paddingRight: "8px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", color: "#080808", boxShadow: "0 0 40px rgba(255,255,255,.18)", ...mono("11px","#080808") }}>
                <span>Comece grátis</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full" style={{ background: "#080808", color: "#fff", fontSize: "16px" }}>→</span>
              </Link>
              <Link href="/login" className="flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ height: "44px", ...mono("9px","rgba(255,255,255,0.45)") }}>
                já tenho uma conta
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ QUICK STATS */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "32px 24px" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[{ v:"2.4k+", l:"pessoas em SP" }, { v:"18", l:"parceiros ativos" }, { v:"100%", l:"grátis para começar" }].map((s) => (
            <div key={s.l} className="flex flex-col gap-1.5">
              <span style={{ ...serif("clamp(26px,6vw,44px)") }}>{s.v}</span>
              <span style={mono("8px","rgba(255,255,255,0.38)")}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════ LIFESTYLE MOMENTS */}
      {/* Photo ↔ copy ↔ atmosphere fully aligned */}
      <section style={{ padding: "96px 24px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-3 mb-14">
            <span style={mono("9px","rgba(255,255,255,0.38)")}>O SOLO na vida real</span>
            <h2 style={{ ...serif("clamp(38px,8vw,58px)"), display: "block" }}>Três ambientes.<br />Uma noite que fica.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOMENTS.map((m) => (
              <div key={m.src} className="relative overflow-hidden rounded-2xl flex flex-col justify-end"
                style={{ aspectRatio: "3 / 4", border: "1px solid rgba(255,255,255,0.08)", padding: "20px" }}>
                <Image src={m.src} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover object-center" alt="" />
                <div className="absolute inset-0" style={{ background: m.overlay }} />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: NOISE, opacity: 0.09, mixBlendMode: "overlay" }} />

                {/* Environment tag */}
                <div className="absolute top-4 left-4 z-10 rounded-full"
                  style={{ padding: "5px 11px", ...mono("7.5px","#fff"), background: "rgba(0,0,0,.45)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
                  {m.tag}
                </div>

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

      {/* ══════════════════════════════════════════ TESTIMONIALS */}
      <section style={{ padding: "0 24px 96px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-3 mb-14">
            <span style={mono("9px","rgba(255,255,255,0.38)")}>Quem já foi</span>
            <h2 style={{ ...serif("clamp(38px,8vw,58px)"), display: "block" }}>2.4k pessoas.<br />Milhares de noites.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="flex flex-col gap-5 rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.034)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: "#FFB259", fontSize: "12px" }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.80)", lineHeight: 1.7, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: t.av, border: "1px solid rgba(255,255,255,0.12)" }} />
                  <div className="flex flex-col">
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#fff" }}>{t.name}, {t.age}</span>
                    <span style={mono("7.5px","rgba(255,255,255,0.40)")}>{t.event}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ HOW IT WORKS */}
      <section style={{ padding: "0 24px 96px" }}>
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

      {/* ══════════════════════════════════════════ PRICING */}
      <section style={{ padding: "0 24px 96px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-2 mb-4 text-center">
            <span style={mono("9px","rgba(255,255,255,0.38)")}>Acesso</span>
            <h2 style={{ ...serif("clamp(36px,8vw,56px)"), display: "block" }}>Comece grátis.<br />Viva mais com SOLO.</h2>
          </div>
          <p style={{ fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, textAlign: "center", maxWidth: "440px", margin: "0 auto 52px" }}>
            Free para experimentar. Plus para sair mais. Black para quem quer o melhor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

            {/* ── FREE ── */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px 24px" }}>
              <span style={mono("8px","rgba(255,255,255,0.38)")}>SOLO Free</span>
              <div style={{ marginTop: "14px", marginBottom: "10px" }}>
                <span style={{ ...serif("44px") }}>R$ 0</span>
                <span style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.35)", marginLeft: "8px" }}>/ sempre</span>
              </div>
              <p style={{ fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, marginBottom: "20px" }}>
                Comece grátis e descubra como a SOLO funciona na prática.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "18px", marginBottom: "22px", display: "flex", flexDirection: "column", gap: "9px" }}>
                {["Criar conta e montar perfil","Ver todos os eventos","1 convite / rolê por semana","Chat, confirmação e check-in","Feedback após o rolê"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, fontSize: "12px", lineHeight: "1.6" }}>○</span>
                    <span style={{ fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.52)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className="flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ height: "46px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.14)", ...mono("9.5px","rgba(255,255,255,0.62)") }}>
                Começar grátis
              </Link>
            </div>

            {/* ── PLUS — featured ── */}
            <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.38)", borderRadius: "20px", padding: "28px 24px", position: "relative", boxShadow: "0 0 48px rgba(139,92,246,0.09)" }}>
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#8B5CF6", borderRadius: "100px", padding: "4px 14px", whiteSpace: "nowrap", ...mono("8px","#fff") }}>
                Mais escolhido
              </div>
              <span style={mono("8px","rgba(139,92,246,0.90)")}>SOLO Plus</span>
              <div style={{ marginTop: "14px", marginBottom: "10px" }}>
                <span style={{ ...serif("44px") }}>R$ 19</span>
                <span style={{ fontWeight: 300, fontSize: "20px", color: "rgba(255,255,255,0.65)" }}>,90</span>
                <span style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.35)", marginLeft: "8px" }}>/ mês</span>
              </div>
              <p style={{ fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: "20px" }}>
                Mais convites, mais prioridade e mais chances de estar nos grupos certos.
              </p>
              <div style={{ borderTop: "1px solid rgba(139,92,246,0.14)", paddingTop: "18px", marginBottom: "22px", display: "flex", flexDirection: "column", gap: "9px" }}>
                {["Tudo do Free","Convites ilimitados por semana","Prioridade em grupos compatíveis","Acesso antecipado a eventos","Vantagens em parceiros SOLO","Mais detalhes da experiência"].map((f, i) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: i === 0 ? "rgba(139,92,246,0.55)" : "#8B5CF6", flexShrink: 0, fontSize: "12px", lineHeight: "1.6" }}>✦</span>
                    <span style={{ fontWeight: i === 0 ? 400 : 300, fontSize: "13px", color: i === 0 ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className="flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ height: "46px", borderRadius: "100px", background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", ...mono("9.5px","#fff"), boxShadow: "0 0 32px rgba(139,92,246,0.35)" }}>
                Entrar na lista Plus
              </Link>
            </div>

            {/* ── BLACK ── */}
            <div style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: "20px", padding: "28px 24px" }}>
              <span style={mono("8px","rgba(255,255,255,0.52)")}>SOLO Black</span>
              <div style={{ marginTop: "14px", marginBottom: "10px" }}>
                <span style={{ ...serif("44px") }}>R$ 49</span>
                <span style={{ fontWeight: 300, fontSize: "20px", color: "rgba(255,255,255,0.65)" }}>,90</span>
                <span style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.35)", marginLeft: "8px" }}>/ mês</span>
              </div>
              <p style={{ fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, marginBottom: "20px" }}>
                Acesso aos rolês mais disputados, grupos mais curados e experiências especiais.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "18px", marginBottom: "22px", display: "flex", flexDirection: "column", gap: "9px" }}>
                {["Tudo do Plus","Prioridade máxima em grupos","Acesso primeiro aos melhores eventos","Experiências exclusivas SOLO","Mesas menores e mais curadas","Badge discreto opcional"].map((f, i) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: i === 0 ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.55)", flexShrink: 0, fontSize: "12px", lineHeight: "1.6" }}>◆</span>
                    <span style={{ fontWeight: 300, fontSize: "13px", color: i === 0 ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className="flex items-center justify-center hover:opacity-90 transition-opacity"
                style={{ height: "46px", borderRadius: "100px", background: "linear-gradient(135deg,#F8FAFC 0%,#94A3B8 100%)", ...mono("9.5px","#080808") }}>
                Quero acesso Black
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ EVENTS PREVIEW */}
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

      {/* ══════════════════════════════════════════ FAQ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:gap-24 gap-14">

            {/* Left — header */}
            <div className="flex flex-col gap-3 md:w-72 flex-shrink-0">
              <span style={mono("9px","rgba(255,255,255,0.38)")}>Perguntas frequentes</span>
              <h2 style={{ ...serif("clamp(38px,8vw,54px)"), display: "block" }}>Tudo que você<br />quer saber.</h2>
              <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.50)", lineHeight: 1.7, marginTop: "8px" }}>
                Ainda tem dúvida? O SOLO é simples. Aqui vai o essencial.
              </p>
            </div>

            {/* Right — Q&A list */}
            <div className="flex-1 flex flex-col">
              {FAQS.map((faq, i) => (
                <div key={i} style={{ padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontWeight: 500, fontSize: "15px", color: "#fff", marginBottom: "10px" }}>{faq.q}</p>
                  <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{faq.a}</p>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
                <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.40)", lineHeight: 1.7 }}>
                  Outra pergunta?{" "}
                  <Link href="/cadastro" className="hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.25)" }}>
                    Entre e descubra.
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FINAL CTA */}
      <section className="relative overflow-hidden" style={{ padding: "112px 24px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:
          "radial-gradient(80% 55% at 50% 110%,rgba(122,91,255,.34),transparent 70%)," +
          "radial-gradient(70% 50% at 22% 0%,rgba(197,60,90,.20),transparent 70%)" }} />
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
          <span style={mono("8px","rgba(255,255,255,0.26)")}>Comece grátis · São Paulo · 2026</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FOOTER */}
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
