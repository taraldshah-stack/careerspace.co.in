import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { logoWhite } from "@/assets/images";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Career Space" },
      { name: "description", content: "Secure sign in for the Career Space content team." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin sign in — Career Space" },
      { property: "og:description", content: "Secure sign in for the Career Space content team." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="surface-ink relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="rule-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="relative w-full max-w-md">
        <a href="/" className="mb-10 flex justify-center">
          <img src={logoWhite} alt="Career Space" className="h-36 w-auto" />
        </a>
        <div className="rounded-lg border border-background/15 bg-ink/60 p-8 backdrop-blur">
          <p className="eyebrow text-spark">Content studio</p>
          <h1 className="mt-4 text-3xl text-background">Sign in</h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-background/50">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-background/20 bg-transparent px-4 py-3 text-background outline-none transition-colors focus:border-spark"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-background/50">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-background/20 bg-transparent px-4 py-3 text-background outline-none transition-colors focus:border-spark"
              />
            </div>
            {msg && <p className="text-sm text-spark">{msg}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-spark px-6 py-3 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Sign in"}
            </button>
          </form>
        </div>
        <a
          href="/"
          className="mt-8 block text-center text-xs uppercase tracking-[0.2em] text-background/40 transition-colors hover:text-spark"
        >
          ← Back to website
        </a>
      </div>
    </main>
  );
}
