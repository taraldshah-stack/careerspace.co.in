import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { blobPathFromPublicUrl } from "@/lib/storage";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
  return context.supabase;
}

const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  excerpt: z.string().trim().max(400).default(""),
  content: z.string().max(60000).default(""),
  cover_url: z.string().trim().max(600).nullable().optional(),
  tags: z.array(z.string().trim().max(40)).max(8).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  author_name: z.string().trim().max(120).default("Career Space"),
  read_minutes: z.number().int().min(1).max(90).default(4),
});

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context as Ctx);
    const [posts, subs, camps] = await Promise.all([
      supabase.from("posts").select("id, status, views, title, updated_at, slug"),
      supabase.from("subscribers").select("id, status, created_at"),
      supabase.from("campaigns").select("id, status, recipients, sent_at, subject"),
    ]);
    const postRows = posts.data ?? [];
    const subRows = subs.data ?? [];
    const campRows = camps.data ?? [];
    return {
      posts: postRows.length,
      published: postRows.filter((p: any) => p.status === "published").length,
      drafts: postRows.filter((p: any) => p.status === "draft").length,
      views: postRows.reduce((n: number, p: any) => n + (p.views ?? 0), 0),
      subscribers: subRows.filter((s: any) => s.status === "subscribed").length,
      unsubscribed: subRows.filter((s: any) => s.status !== "subscribed").length,
      campaigns: campRows.length,
      sentCampaigns: campRows.filter((c: any) => c.status === "sent").length,
      recentPosts: [...postRows]
        .sort((a: any, b: any) => (a.updated_at < b.updated_at ? 1 : -1))
        .slice(0, 5),
      recentCampaigns: campRows.slice(0, 5),
    };
  });

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPostById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data: row, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const savePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => postSchema.parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const payload: Record<string, unknown> = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_url: data.cover_url || null,
      tags: data.tags,
      status: data.status,
      author_name: data.author_name,
      read_minutes: data.read_minutes,
    };
    if (data.status === "published") payload["published_at"] = new Date().toISOString();

    if (data.id) {
      const { data: row, error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    payload["created_by"] = context.userId;
    const { data: row, error } = await supabase.from("posts").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    // Remove the stored cover image so deleting a post doesn't orphan a blob in storage.
    const { data: post } = await supabase
      .from("posts")
      .select("cover_url")
      .eq("id", data.id)
      .maybeSingle();
    const coverPath = blobPathFromPublicUrl(post?.cover_url ?? null);
    if (coverPath) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage
        .from("blog-covers")
        .remove([coverPath])
        .catch(() => {});
    }
    const { error } = await supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["subscribe", "unsubscribe", "delete"]),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    if (data.action === "delete") {
      const { error } = await supabase.from("subscribers").delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    }
    const { error } = await supabase
      .from("subscribers")
      .update({ status: data.action === "subscribe" ? "subscribed" : "unsubscribed" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        subject: z.string().trim().min(2).max(200),
        preview_text: z.string().trim().max(200).default(""),
        content: z.string().max(40000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const payload = {
      subject: data.subject,
      preview_text: data.preview_text,
      content: data.content,
    };
    if (data.id) {
      const { error } = await supabase.from("campaigns").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase
      .from("campaigns")
      .insert({ ...payload, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { error } = await supabase.from("campaigns").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const sendCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "sent") throw new Error("This campaign has already been sent");

    const { data: subs, error: sErr } = await supabase
      .from("subscribers")
      .select("email")
      .eq("status", "subscribed");
    if (sErr) throw new Error(sErr.message);
    const recipients = subs?.length ?? 0;
    if (recipients === 0) throw new Error("No active subscribers to send to");

    const { error } = await supabase
      .from("campaigns")
      .update({ status: "sent", recipients, sent_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, recipients };
  });

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const supabase = await assertAdmin(context as Ctx);
    const { error } = await supabase.from("contacts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
