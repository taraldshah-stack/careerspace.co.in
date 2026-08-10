import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Reveal } from "@/components/site/Reveal";
import { subscribeToNewsletter } from "@/lib/newsletter.functions";

export function Newsletter() {
  const subscribe = useServerFn(subscribeToNewsletter);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      await subscribe({ data: { email, name: name || undefined, source: "website" } });
      setState("done");
      setEmail("");
      setName("");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section id="newsletter" className="scroll-mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:py-28">
        <Reveal>
          <p className="eyebrow text-accent">Newsletter</p>
          <h2 className="mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] text-ink">
            One thoughtful email. No noise.
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
            Classroom ideas, Math Cafe dates and career guidance essays — sent occasionally, only
            when we have something genuinely useful to say.
          </p>
        </Reveal>
        <Reveal delay={120}>
          {state === "done" ? (
            <div className="border border-accent/40 bg-card p-10">
              <h3 className="text-2xl text-ink">You're on the list.</h3>
              <p className="mt-3 text-muted-foreground">
                Thanks for subscribing — look out for our next note.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="border border-border bg-card p-8 lg:p-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Your name (optional)"
                  value={name}
                  maxLength={120}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-ink outline-none transition-colors focus:border-accent"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-ink outline-none transition-colors focus:border-accent"
                />
              </div>
              {state === "error" && <p className="mt-4 text-sm text-destructive">{msg}</p>}
              <button
                type="submit"
                disabled={state === "busy"}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {state === "busy" ? "Subscribing…" : "Subscribe"}
                <span>→</span>
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                We never share your email. Unsubscribe any time.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
