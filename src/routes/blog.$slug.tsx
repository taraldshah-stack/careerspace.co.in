import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PublicShell } from "@/components/site/PublicShell";
import { getPublishedPost } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found — Career Space" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — Career Space` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        ...(loaderData.cover_url?.startsWith("https://")
          ? [
              { property: "og:image", content: loaderData.cover_url },
              { name: "twitter:image", content: loaderData.cover_url },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <PublicShell>
      <main className="flex min-h-[calc(100vh-240px)] flex-col items-center justify-center gap-4 px-6 py-20 text-muted-foreground">
        <p>That article doesn't exist.</p>
        <Link to="/blog" className="text-accent">
          Back to the journal
        </Link>
      </main>
    </PublicShell>
  ),
  errorComponent: () => (
    <PublicShell>
      <main className="flex min-h-[calc(100vh-240px)] items-center justify-center px-6 py-20 text-muted-foreground">
        This article couldn't load right now.
      </main>
    </PublicShell>
  ),
  component: Article,
});

function Article() {
  const post = Route.useLoaderData();

  return (
    <PublicShell>
      <main className="bg-background text-foreground">
        <section id="top" className="surface-ink relative overflow-hidden pt-28 lg:pt-32">
          <div className="rule-grid absolute inset-0 opacity-20" aria-hidden />
          <div className="relative mx-auto max-w-[860px] px-6 pb-20 pt-16 lg:pb-24">
            <p className="eyebrow mt-6 text-spark">
              {post.published_at ? new Date(post.published_at).toLocaleDateString() : "New"} · {" "}
              {post.read_minutes} min read
            </p>
            <h1 className="mt-6 text-[clamp(2rem,4.6vw,3.4rem)] text-background">{post.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-background/75">{post.excerpt}</p>
            <p className="mt-8 text-sm text-background/55">By {post.author_name}</p>
          </div>
        </section>

        {post.cover_url && (
          <div className="bg-background px-6 pt-12 lg:pt-16">
            <img
              src={post.cover_url}
              alt={post.title}
              className="mx-auto aspect-video w-full max-w-[860px] rounded-sm object-cover shadow-lift"
            />
          </div>
        )}

        <article className="mx-auto max-w-[860px] bg-background px-6 py-16 lg:py-24">
          {post.content.split(/\n{2,}/).map((para: string, i: number) => (
            <p key={i} className="mb-6 max-w-[720px] text-lg leading-[1.85] text-ink-soft">
              {para}
            </p>
          ))}
          {post.tags.length > 0 && (
            <div className="mt-12 flex max-w-[720px] flex-wrap gap-2 border-t border-border pt-8">
              {post.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <Link
            to="/blog"
            className="mt-16 inline-block text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
          >
            ← All articles
          </Link>
        </article>
      </main>
    </PublicShell>
  );
}