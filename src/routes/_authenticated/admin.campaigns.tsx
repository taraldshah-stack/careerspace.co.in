import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { deleteCampaign, listCampaigns, saveCampaign, sendCampaign } from "@/lib/admin.functions";
import { Field, PageHead, StatusPill, btnGhost, btnPrimary, inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/campaigns")({
  component: Campaigns,
});

function Campaigns() {
  const fetchCampaigns = useServerFn(listCampaigns);
  const persist = useServerFn(saveCampaign);
  const dispatch = useServerFn(sendCampaign);
  const remove = useServerFn(deleteCampaign);
  const qc = useQueryClient();

  const [editing, setEditing] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => fetchCampaigns(),
  });

  function reset() {
    setEditing(null);
    setSubject("");
    setPreview("");
    setContent("");
  }

  const save = useMutation({
    mutationFn: () =>
      persist({
        data: {
          ...(editing ? { id: editing } : {}),
          subject,
          preview_text: preview,
          content,
        },
      }),
    onSuccess: () => {
      reset();
      setMsg("Campaign saved.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : "Could not save"),
  });

  const send = useMutation({
    mutationFn: (id: string) => dispatch({ data: { id } }),
    onSuccess: (r) => {
      setMsg(`Campaign dispatched to ${r.recipients} subscriber(s).`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => setMsg(e instanceof Error ? e.message : "Could not send"),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  return (
    <div>
      <PageHead
        eyebrow="Newsletter module"
        title="Campaigns"
        lede="Compose a newsletter, save it as a draft, then dispatch it to your active subscribers."
      />
      {msg && <p className="mb-6 text-accent-foreground">{msg}</p>}
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <section className="space-y-5">
          <h2 className="text-2xl text-ink">{editing ? "Edit campaign" : "New campaign"}</h2>
          <Field label="Subject">
            <input
              className={inputCls}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="Preview text">
            <input
              className={inputCls}
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
            />
          </Field>
          <Field label="Message">
            <textarea
              className={`${inputCls} min-h-[300px]`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
          <div className="flex gap-2">
            <button
              className={btnPrimary}
              disabled={save.isPending || subject.trim().length < 2}
              onClick={() => save.mutate()}
            >
              {editing ? "Update draft" : "Save draft"}
            </button>
            {editing && (
              <button className={btnGhost} onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-ink">All campaigns</h2>
          {error && <p className="mt-4 text-destructive">{(error as Error).message}</p>}
          {isLoading && <p className="mt-4 text-muted-foreground">Loading…</p>}
          {data && data.length === 0 && (
            <p className="mt-4 text-muted-foreground">No campaigns yet.</p>
          )}
          <div className="mt-6 divide-y divide-border border-y border-border">
            {data?.map((c: any) => (
              <div key={c.id} className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg text-ink">{c.subject}</h3>
                  <StatusPill status={c.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {c.status === "sent"
                    ? `Sent ${new Date(c.sent_at).toLocaleString()} · ${c.recipients} recipients`
                    : `Draft · created ${new Date(c.created_at).toLocaleDateString()}`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.status !== "sent" && (
                    <>
                      <button
                        className={btnGhost}
                        onClick={() => {
                          setEditing(c.id);
                          setSubject(c.subject);
                          setPreview(c.preview_text ?? "");
                          setContent(c.content ?? "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={btnPrimary}
                        disabled={send.isPending}
                        onClick={() => {
                          if (confirm(`Send “${c.subject}” to all active subscribers?`))
                            send.mutate(c.id);
                        }}
                      >
                        Send now
                      </button>
                    </>
                  )}
                  <button
                    className={btnGhost}
                    onClick={() => {
                      if (confirm("Delete this campaign?")) del.mutate(c.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
