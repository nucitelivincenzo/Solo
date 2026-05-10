"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/eventos",   label: "Eventos"   },
  { href: "/grupos",    label: "Grupos"    },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/perfil",    label: "Perfil"    },
];

export function Navbar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    if (onLogout) { onLogout(); return; }
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* ── Main row ── */}
      <div className="px-5 py-3 flex items-center justify-between">
        {/* Logo — clean, no circle */}
        <Link href="/" className="flex-shrink-0">
          <span
            className="text-[#F8FAFC]"
            style={{ fontFamily: "var(--font-dm-serif), serif", fontStyle: "italic", fontSize: "19px", letterSpacing: "-0.01em" }}
          >
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
          <button
            onClick={handleLogout}
            className="ml-2 text-sm text-zinc-500 hover:text-[#FAFAFA] transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Sair
          </button>
        </nav>

        {/* Mobile: sair */}
        <button
          onClick={handleLogout}
          className="md:hidden text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/[0.05]"
        >
          Sair
        </button>
      </div>

      {/* ── Mobile nav row — 4 items always visible ── */}
      <nav className="md:hidden flex items-center gap-1 px-3 pb-2.5">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex-1 text-center text-xs py-1.5 rounded-lg transition-all duration-200 font-medium ${
                active
                  ? "text-[#FAFAFA] bg-white/[0.08]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              }`}>
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
