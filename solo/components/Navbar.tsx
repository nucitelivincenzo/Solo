"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/eventos",   label: "Eventos"   },
  { href: "/grupos",    label: "Grupos"    },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/perfil",    label: "Perfil"    },
];

export function Navbar({ onLogout }: { onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="relative border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0F0F11]/80 backdrop-blur-xl z-40">
      <Link href="/" onClick={() => setOpen(false)}
        className="text-2xl font-black text-violet-500 glow-violet"
        style={{ letterSpacing: "-0.04em" }}>
        SOLO
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`text-sm transition-colors ${
                active
                  ? "font-medium text-[#FAFAFA] border-b-2 border-violet-500 pb-0.5"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA]"
              }`}>
              {label}
            </Link>
          );
        })}
        {onLogout && (
          <button onClick={onLogout}
            className="text-sm text-zinc-500 hover:text-[#FAFAFA] transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Sair
          </button>
        )}
      </nav>

      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/10 transition-colors"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 bg-[#18181B] border-b border-white/10 shadow-lg shadow-black/40 md:hidden">
            <nav className="flex flex-col px-4 py-2">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? "text-violet-400 bg-violet-500/10"
                        : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5"}`}>
                    {label}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
                  </Link>
                );
              })}
              {onLogout && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <button
                    onClick={() => { setOpen(false); onLogout(); }}
                    className="flex items-center gap-2 px-3 py-3.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-[#FAFAFA] hover:bg-white/5 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Sair
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
