"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/eventos",   label: "Eventos"   },
  { href: "/grupos",    label: "Grupos"    },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/perfil",    label: "Perfil"    },
];

export function Navbar({ onLogout }: { onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    setOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
      router.push("/");
    }
  }

  return (
    <header className="relative border-b border-white/[0.06] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#050506]/90 backdrop-blur-xl z-40">
      <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
        <div className="relative w-[18px] h-[18px] rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg,#F8FAFC,#94A3B8)" }}>
          <div className="absolute inset-[3px] rounded-full" style={{ background: "#050506" }} />
        </div>
        <span className="text-[#F8FAFC]" style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic", fontSize: "19px", letterSpacing: "-0.01em" }}>
          SOLO
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`text-sm transition-all duration-200 px-3 py-1.5 rounded-lg ${
                active
                  ? "font-semibold text-[#FAFAFA] bg-white/[0.07]"
                  : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/[0.05]"
              }`}>
              {label}
            </Link>
          );
        })}
        <button onClick={handleLogout}
          className="ml-2 text-sm text-zinc-500 hover:text-[#FAFAFA] transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Sair
        </button>
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
          <div className="absolute top-full left-0 right-0 z-50 bg-[#050506] border-b border-white/[0.06] shadow-lg shadow-black/60 md:hidden">
            <nav className="flex flex-col px-4 py-2">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? "text-[#FAFAFA] bg-white/[0.07]"
                        : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-white/5"}`}>
                    {label}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white/40 flex-shrink-0" />}
                  </Link>
                );
              })}
              <div className="h-px bg-white/10 my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-[#FAFAFA] hover:bg-white/5 transition-colors w-full text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Sair
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
