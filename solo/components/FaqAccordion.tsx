"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "A SOLO é um dating app?",
    a: "Não. A SOLO é sobre experiências sociais em grupo. Você conhece pessoas novas em bares, rooftops e jantares, mas o foco é viver uma noite boa — o que acontece depois é por conta própria.",
  },
  {
    q: "Preciso ir sozinho?",
    a: "Sim, e esse é o ponto. Você chega sozinho, mas encontra um grupo montado por compatibilidade de vibe, interesse e disponibilidade.",
  },
  {
    q: "A SOLO é gratuita?",
    a: "Você pode criar sua conta, montar seu perfil e participar da experiência inicial gratuitamente. Os planos Plus e Black desbloqueiam mais convites, prioridade nos grupos e acesso a experiências mais exclusivas.",
  },
  {
    q: "Qual a diferença entre Free, Plus e Black?",
    a: "Free é para começar. Plus é para quem quer sair mais vezes e ter prioridade. Black é para quem quer acesso aos rolês mais disputados, grupos mais curados e experiências especiais.",
  },
  {
    q: "O Premium garante grupo?",
    a: "Não força conexões. Ele aumenta sua prioridade e acesso, mas os grupos continuam sendo formados por compatibilidade, disponibilidade e interesse no mesmo rolê.",
  },
  {
    q: "Como a SOLO monta os grupos?",
    a: "A SOLO cruza seu perfil de noite, preferências, intenção social e interesse no mesmo evento para formar grupos pequenos e mais compatíveis.",
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
          Outra pergunta?{" "}
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
