import { Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string | null;
  read_minutes: number;
  published_at: string | null;
};

export function LatestPosts({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <section id="journal" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-accent">Journal</p>
              <h2 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] text-ink">
                Ideas we're working through.
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              All articles →
            </Link>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="rule-grid aspect-16/10 w-full bg-secondary" />
                )}
                <p className="eyebrow mt-6 text-accent">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString() : "New"} ·{" "}
                  {p.read_minutes} min
                </p>
                <h3 className="mt-3 text-2xl text-ink transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{p.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}