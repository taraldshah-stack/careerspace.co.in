import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listContacts, deleteContact } from "@/lib/admin.functions";
import { PageHead, btnGhost } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/contacts")({
  component: Contacts,
});

function Contacts() {
  const fetchContacts = useServerFn(listContacts);
  const remove = useServerFn(deleteContact);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "contacts"],
    queryFn: () => fetchContacts(),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  function exportCsv() {
    const rows = [
      ["name", "email", "phone", "message", "received"],
      ...(data ?? []).map((c: any) => [
        c.name,
        c.email,
        c.phone ?? "",
        c.message,
        new Date(c.created_at).toISOString(),
      ]),
    ];
    const csv = rows
      .map((r: string[]) => r.map((v: string) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-space-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHead
        eyebrow="Contact module"
        title="Contact messages"
        lede="Enquiries submitted through the website contact form."
        action={
          <button className={btnGhost} onClick={exportCsv}>
            Export CSV
          </button>
        }
      />
      {error && <p className="text-destructive">{(error as Error).message}</p>}
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {data && data.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
      <div className="divide-y divide-border border-y border-border">
        {data?.map((c: any) => (
          <div key={c.id} className="grid gap-3 py-5 md:grid-cols-[1.6fr_auto] md:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-semibold text-ink">{c.name}</p>
                <a href={`mailto:${c.email}`} className="text-sm text-accent hover:underline">
                  {c.email}
                </a>
                {c.phone && <span className="text-sm text-muted-foreground">{c.phone}</span>}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-ink/85">{c.message}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </p>
            </div>
            <button
              className={btnGhost}
              onClick={() => {
                if (confirm(`Delete message from ${c.name}?`)) del.mutate(c.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
