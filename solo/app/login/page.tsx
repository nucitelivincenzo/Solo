"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("[SOLO] Login page - env check:", {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl}` : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.slice(0, 12)}...` : "MISSING",
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Preencha todos os campos."); return; }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      setError("Configuração do Supabase ausente em produção.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (sbError) throw sbError;
      const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("user_id", data.user.id).maybeSingle();
      router.push(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
    } catch (e: unknown) {
      console.error("[SOLO] Login error:", e);
      if (e instanceof TypeError && e.message.toLowerCase().includes("fetch")) {
        setError("Não foi possível conectar ao Supabase. Verifique as variáveis de ambiente da Vercel.");
      } else {
        const msg = e instanceof Error ? e.message : "Erro ao entrar.";
        setError(msg === "Invalid login credentials" ? "Email ou senha incorretos." : msg);
      }
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0F0F11] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl font-black text-violet-500 glow-violet" style={{ letterSpacing: "-0.04em" }}>SOLO</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#FAFAFA]">Bem-vindo de volta</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={handleChange} placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#FAFAFA] placeholder-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-colors text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300" htmlFor="password">Senha</label>
            <input
              id="password" name="password" type="password" autoComplete="current-password"
              value={form.password} onChange={handleChange} placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#FAFAFA] placeholder-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="mt-1 w-full py-3.5 bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </>
            ) : "Entrar"}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-6">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Cadastre-se grátis</Link>
        </p>
      </div>
    </main>
  );
}
