"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "A SOLO é um dating app?",
    a: "Não. A SOLO é sobre experiências sociais em grupo. Você conhece pessoas novas em bares, rooftops e jantares, mas o foco é viver uma noite boa — não forçar encontros.",
  },
  {
    q: "Preciso ir sozinho?",
    a: "Sim. A ideia é justamente essa: você chega sozinho, mas encontra um grupo pequeno formado por interesses, disponibilidade e estilo de rolê.",
  },
  {
    q: "A SOLO é gratuita?",
    a: "Você pode começar gratuitamente: criar perfil, explorar eventos e participar da experiência inicial. Os planos Plus e Black são para quem quer mais convites, prioridade e experiências mais exclusivas.",
  },
  {
    q: "Qual a diferença entre Free, Plus e Black?",
    a: "Free é para experimentar. Plus é para sair mais vezes e ter prioridade. Black é para acessar experiências mais disputadas, grupos mais curados e benefícios premium.",
  },
  {
    q: "O Premium garante grupo?",
    a: "Não força conexões nem garante grupo artificialmente. Ele aumenta sua prioridade e acesso, mas os grupos continuam sendo formados por compatibilidade, disponibilidade e interesse no mesmo rolê.",
  },
  {
    q: "Como a SOLO monta os grupos?",
    a: "A SOLO considera sua vibe, preferências, intenção social e interesse no mesmo evento para formar grupos pequenos com mais chance de conversa boa.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex-1 flex flex-col">
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left gap-4"
            style={{ padding: "20px 0", cursor: "pointer", background: "none", border: "none" }}
          >
            <span style={{ fontWeight: 500, fontSize: "15px", color: "#fff" }}>{faq.q}</span>
            <svg
              className="flex-shrink-0 transition-transform duration-200"
              style={{
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                width: "16px", height: "16px",
                color: "rgba(255,255,255,0.38)",
                flexShrink: 0,
              }}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            style={{
              overflow: "hidden",
              maxHeight: open === i ? "300px" : "0",
              transition: "max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
              opacity: open === i ? 1 : 0,
            }}
          >
            <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, paddingBottom: "20px" }}>
              {faq.a}
            </p>
          </div>
        </div>
      ))}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
        <p style={{ fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.40)", lineHeight: 1.7 }}>
          Ainda tem dúvida?{" "}
          <Link
            href="/cadastro"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.25)" }}
          >
            Entre e descubra.
          </Link>
        </p>
      </div>
    </div>
  );
}
