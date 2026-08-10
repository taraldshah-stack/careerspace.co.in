import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { adminStats } from "@/lib/admin.functions";
import { PageHead, StatusPill } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fetchStats(),
  });

  return (
    <div>
      <PageHead
        eyebrow="Overview"
        title="Your content at a glance."
        lede="Everything published on the Career Space website, plus your newsletter audience."
      />
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {data && (
        <>
          <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: data.published, v: "published posts" },
              { k: data.drafts, v: "drafts in progress" },
              { k: data.subscribers, v: "active subscribers" },
              { k: data.sentCampaigns, v: "campaigns sent" },
            ].map((s) => (
              <div key={s.v} className="bg-card px-6 py-8">
                <div className="font-display text-4xl text-ink">{s.k}</div>
                <div className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-ink">Recently updated posts</h2>
                <Link to="/admin/posts" className="text-sm font-semibold text-accent">
                  Manage →
                </Link>
              </div>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {data.recentPosts.length === 0 && (
                  <p className="py-6 text-muted-foreground">No posts yet.</p>
                )}
                {data.recentPosts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 py-4">
                    <span className="truncate text-ink">{p.title}</span>
                    <StatusPill status={p.status} />
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-ink">Newsletter campaigns</h2>
                <Link to="/admin/campaigns" className="text-sm font-semibold text-accent">
                  Manage →
                </Link>
              </div>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {data.recentCampaigns.length === 0 && (
                  <p className="py-6 text-muted-foreground">No campaigns yet.</p>
                )}
                {data.recentCampaigns.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 py-4">
                    <span className="truncate text-ink">{c.subject}</span>
                    <StatusPill status={c.status} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
