import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getPostById, savePost } from "@/lib/admin.functions";
import { Field, PageHead, btnGhost, btnPrimary, inputCls } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { blobPathFromPublicUrl } from "@/lib/storage";

// Resize + recompress cover images before upload to keep storage small.
// A raw phone photo (several MB) becomes ~100–300KB WebP/JPEG here.
const MAX_COVER_DIMENSION = 1920;
const COVER_QUALITY = 0.82;

function supportsWebp(): boolean {
  const c = document.createElement("canvas");
  return c.toDataURL("image/webp").startsWith("data:image/webp");
}

async function compressImage(file: File): Promise<{ blob: Blob; mime: string }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_COVER_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not compress image");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const mime = supportsWebp() ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not compress image"))),
        mime,
        COVER_QUALITY,
      ),
    );
    return { blob, mime };
  } finally {
    bitmap.close();
  }
}

/** Delete a cover object from the bucket, ignoring "already gone" errors. */
async function removeCoverObject(coverUrl: string | null): Promise<void> {
  const path = blobPathFromPublicUrl(coverUrl);
  if (!path) return;
  await supabase.storage
    .from("blog-covers")
    .remove([path])
    .catch(() => {});
}

export const Route = createFileRoute("/_authenticated/admin/posts/$id")({
  component: PostEditor,
});

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  tags: string;
  status: "draft" | "published";
  author_name: string;
  read_minutes: number;
};

const EMPTY: Form = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_url: "",
  tags: "",
  status: "draft",
  author_name: "Career Space",
  read_minutes: 4,
};

function PostEditor() {
  const { id } = useParams({ from: "/_authenticated/admin/posts/$id" });
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchPost = useServerFn(getPostById);
  const persist = useServerFn(savePost);
  const [form, setForm] = useState<Form>(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => fetchPost({ data: { id } }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      title: data.title ?? "",
      slug: data.slug ?? "",
      excerpt: data.excerpt ?? "",
      content: data.content ?? "",
      cover_url: data.cover_url ?? "",
      tags: (data.tags ?? []).join(", "),
      status: (data.status as Form["status"]) ?? "draft",
      author_name: data.author_name ?? "Career Space",
      read_minutes: data.read_minutes ?? 4,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: (status: Form["status"]) =>
      persist({
        data: {
          ...(isNew ? {} : { id }),
          title: form.title,
          slug: form.slug || slugify(form.title),
          excerpt: form.excerpt,
          content: form.content,
          cover_url: form.cover_url || null,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status,
          author_name: form.author_name,
          read_minutes: Number(form.read_minutes) || 4,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/posts" });
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "Could not save"),
  });

  const set = (k: keyof Form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }) as Form);

  async function uploadCover(file: File) {
    setErr(null);
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setUploading(true);
    try {
      // Downscale + recompress before upload so we never store full-size originals.
      const { blob, mime } = await compressImage(file);
      const ext = mime === "image/webp" ? "webp" : "jpg";
      const safeSlug = form.slug || slugify(form.title) || "article";
      const path = `${safeSlug}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("blog-covers").upload(path, blob, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      // The previous cover (if any) is now orphaned — delete it to avoid accumulating blobs.
      await removeCoverObject(form.cover_url);
      const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_url: data.publicUrl }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not upload image");
    } finally {
      setUploading(false);
    }
  }

  async function removeCover() {
    await removeCoverObject(form.cover_url);
    setForm((f) => ({ ...f, cover_url: "" }));
  }

  return (
    <div>
      <PageHead
        eyebrow="Blog module"
        title={isNew ? "New article" : "Edit article"}
        action={
          <div className="flex gap-2">
            <button className={btnGhost} onClick={() => navigate({ to: "/admin/posts" })}>
              Cancel
            </button>
            <button
              className={btnGhost}
              disabled={save.isPending}
              onClick={() => save.mutate("draft")}
            >
              Save draft
            </button>
            <button
              className={btnPrimary}
              disabled={save.isPending}
              onClick={() => save.mutate("published")}
            >
              Publish
            </button>
          </div>
        }
      />
      {err && <p className="mb-6 text-destructive">{err}</p>}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Field label="Title">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: isNew && !f.slug ? slugify(e.target.value) : f.slug,
                }))
              }
            />
          </Field>
          <Field label="Excerpt" hint="Shown on the blog listing and the home page.">
            <textarea
              className={`${inputCls} min-h-24`}
              value={form.excerpt}
              onChange={set("excerpt")}
            />
          </Field>
          <Field label="Content" hint="Plain text or simple markdown-style paragraphs.">
            <textarea
              className={`${inputCls} min-h-[420px] font-mono text-sm leading-relaxed`}
              value={form.content}
              onChange={set("content")}
            />
          </Field>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Field label="URL slug" hint={`/blog/${form.slug || "your-slug"}`}>
            <input className={inputCls} value={form.slug} onChange={set("slug")} />
          </Field>
          <Field label="Cover image" hint="Use a 16:9 image for best results.">
            <div className="space-y-3">
              <input
                className={inputCls}
                value={form.cover_url}
                onChange={set("cover_url")}
                placeholder="Paste image URL"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className={`${btnGhost} cursor-pointer`}>
                  {uploading ? "Uploading…" : "Upload from system"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCover(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {form.cover_url && (
                  <button type="button" className={btnGhost} onClick={removeCover}>
                    Remove image
                  </button>
                )}
              </div>
              <div className="overflow-hidden rounded-sm border border-border bg-secondary">
                {form.cover_url ? (
                  <img
                    src={form.cover_url}
                    alt="Cover preview"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="rule-grid flex aspect-video items-center justify-center text-sm text-muted-foreground">
                    16:9 cover preview
                  </div>
                )}
              </div>
            </div>
          </Field>
          <Field label="Tags" hint="Comma separated">
            <input className={inputCls} value={form.tags} onChange={set("tags")} />
          </Field>
          <Field label="Author">
            <input className={inputCls} value={form.author_name} onChange={set("author_name")} />
          </Field>
          <Field label="Read time (minutes)">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.read_minutes}
              onChange={(e) => setForm((f) => ({ ...f, read_minutes: Number(e.target.value) }))}
            />
          </Field>
        </aside>
      </div>
    </div>
  );
}
