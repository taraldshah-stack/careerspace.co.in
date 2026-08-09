import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { deletePost, listAllPosts } from "@/lib/admin.functions";
import { PageHead, StatusPill, btnGhost, btnPrimary } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/posts/")({
  component: PostsList,
});

function PostsList() {
  const fetchPosts = useServerFn(listAllPosts);
  const removePost = useServerFn(deletePost);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => fetchPosts(),
  });

  const del = useMutation({
    mutationFn: (id: string) => removePost({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  return (
    <div>
      <PageHead
        eyebrow="Blog module"
        title="Articles"
        lede="Write, edit and publish articles that appear instantly on the public blog."
        action={
          <Link to="/admin/posts/$id" params={{ id: "new" }} className={btnPrimary}>
            New article
          </Link>
        }
      />
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {data && data.length === 0 && (
        <p className="text-muted-foreground">No articles yet — start with your first one.</p>
      )}
      <div className="divide-y divide-border border-y border-border">
        {data?.map((p: any) => (
          <div
            key={p.id}
            className="grid gap-4 py-6 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
          >
            <div className="min-w-0">
              <h3 className="truncate text-xl text-ink">{p.title}</h3>
              <p className="mt-1 truncate text-sm text-muted-foreground">/blog/{p.slug}</p>
            </div>
            <StatusPill status={p.status} />
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {new Date(p.updated_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <Link to="/admin/posts/$id" params={{ id: p.id }} className={btnGhost}>
                Edit
              </Link>
              <button
                className={btnGhost}
                onClick={() => {
                  if (confirm(`Delete “${p.title}”?`)) del.mutate(p.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}