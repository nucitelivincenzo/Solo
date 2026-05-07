"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email || !form.password) { setError("Preencha todos os campos."); return; }
    if (form.password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name.trim() } },
      });
      if (sbError) throw sbError;
      if (data.session) router.push("/onboarding");
      else setEmailSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <main className="min-h-screen bg-[#0F0F11] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center flex flex-col gap-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#FAFAFA]">Verifique seu email</h2>
            <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
              Enviamos um link para <span className="text-violet-400 font-medium">{form.email}</span>. Clique no link para ativar sua conta.
            </p>
          </div>
          <Link href="/login" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Já confirmei, entrar →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0F11] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl font-black text-violet-500 glow-violet" style={{ letterSpacing: "-0.04em" }}>SOLO</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#FAFAFA]">Crie sua conta</h2>
          <p className="text-[#A1A1AA] text-sm mt-1">É grátis e leva menos de 1 minuto</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { id: "name",     label: "Seu nome", type: "text",     autocomplete: "name",         placeholder: "Como você quer ser chamado?" },
            { id: "email",    label: "Email",     type: "email",    autocomplete: "email",         placeholder: "seuemail@exemplo.com"         },
            { id: "password", label: "Senha",     type: "password", autocomplete: "new-password",  placeholder: "Mínimo 6 caracteres"          },
          ].map((f) => (
            <div key={f.id} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300" htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id} name={f.id} type={f.type} autoComplete={f.autocomplete}
                value={(form as Record<string, string>)[f.id]}
                onChange={handleChange} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#FAFAFA] placeholder-zinc-600 outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-colors text-sm"
              />
            </div>
          ))}

          {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="mt-1 w-full py-3.5 bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm">
            {loading ? "Criando conta..." : "Criar conta grátis"}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm mt-6">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
