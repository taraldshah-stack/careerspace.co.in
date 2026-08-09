import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listSubscribers, updateSubscriber } from "@/lib/admin.functions";
import { PageHead, StatusPill, btnGhost } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  component: Subscribers,
});

function Subscribers() {
  const fetchSubs = useServerFn(listSubscribers);
  const update = useServerFn(updateSubscriber);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: () => fetchSubs(),
  });

  const act = useMutation({
    mutationFn: (v: { id: string; action: "subscribe" | "unsubscribe" | "delete" }) =>
      update({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  function exportCsv() {
    const rows = [
      ["email", "name", "status", "source", "joined"],
      ...(data ?? []).map((s: any) => [
        s.email,
        s.name ?? "",
        s.status,
        s.source,
        new Date(s.created_at).toISOString(),
      ]),
    ];
    const csv = rows
      .map((r: string[]) => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-space-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHead
        eyebrow="Newsletter module"
        title="Subscribers"
        lede="Everyone who signed up through the website newsletter form."
        action={
          <button className={btnGhost} onClick={exportCsv}>
            Export CSV
          </button>
        }
      />
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {data && data.length === 0 && <p className="text-muted-foreground">No subscribers yet.</p>}
      <div className="divide-y divide-border border-y border-border">
        {data?.map((s: any) => (
          <div key={s.id} className="grid gap-3 py-5 md:grid-cols-[1.4fr_1fr_auto_auto] md:items-center">
            <div className="min-w-0">
              <p className="truncate text-ink">{s.email}</p>
              {s.name && <p className="text-sm text-muted-foreground">{s.name}</p>}
            </div>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {s.source} · {new Date(s.created_at).toLocaleDateString()}
            </span>
            <StatusPill status={s.status} />
            <div className="flex gap-2">
              <button
                className={btnGhost}
                onClick={() =>
                  act.mutate({
                    id: s.id,
                    action: s.status === "subscribed" ? "unsubscribe" : "subscribe",
                  })
                }
              >
                {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
              </button>
              <button
                className={btnGhost}
                onClick={() => {
                  if (confirm(`Remove ${s.email}?`)) act.mutate({ id: s.id, action: "delete" });
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