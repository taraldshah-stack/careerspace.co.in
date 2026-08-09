import { createFileRoute, Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { PublicShell } from "@/components/site/PublicShell";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/")({
  loader: () => listPublishedPosts({ data: { limit: 24 } }),
  head: () => ({
    meta: [
      { title: "Journal — Career Space" },
      {
        name: "description",
        content:
          "Essays and field notes on maths education, inquiry-based teaching and career guidance from the Career Space team.",
      },
      { property: "og:title", content: "Journal — Career Space" },
      {
        property: "og:description",
        content: "Field notes on maths education, teaching practice and career guidance.",
      },
    ],
  }),
  errorComponent: () => (
    <main className="flex min-h-screen items-center justify-center text-muted-foreground">
      The journal couldn't load right now.
    </main>
  ),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <PublicShell>
      <main className="min-h-screen bg-background text-foreground">
        <section id="top" className="surface-ink relative overflow-hidden pt-28 lg:pt-32">
          <div className="rule-grid absolute inset-0 opacity-20" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-16 lg:px-10 lg:pb-24 lg:pt-20">
            <p className="eyebrow mt-6 text-spark">Journal</p>
            <h1 className="mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4rem)] text-background">
              Notes from the classroom, the cafe and everywhere in between.
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] bg-background px-6 py-20 text-foreground lg:px-10 lg:py-28">
          {posts.length === 0 && (
            <p className="text-muted-foreground">First article coming soon.</p>
          )}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p: any, i: number) => (
            <Reveal key={p.id} delay={i * 80}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-video w-full rounded-sm object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="rule-grid aspect-video w-full rounded-sm bg-secondary" />
                )}
                <p className="eyebrow mt-6 text-accent">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString() : "New"} ·{" "}
                  {p.read_minutes} min
                </p>
                <h2 className="mt-3 text-2xl text-ink transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <Link
          to="/"
          className="mt-20 inline-block text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
        >
          ← Back to Career Space
        </Link>
      </section>
    </main>
    </PublicShell>
  );
}