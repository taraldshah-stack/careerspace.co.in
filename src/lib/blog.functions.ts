import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/integrations/supabase/types";

// On serverless (Vercel) a Supabase call can stall without ever resolving or
// rejecting. That leaves the SSR stream open past Nitro's ~120s lifetime cap,
// which force-cleans it and shows the user "This page didn't load". Bound every
// public query with a timeout so a stalled call degrades gracefully instead of
// hanging the response.
const QUERY_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(50).default(24) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const fetchRows = async () => {
      const { data: rows, error } = await publicClient()
        .from("posts")
        .select("id, title, slug, excerpt, cover_url, tags, author_name, read_minutes, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(data.limit);
      if (error) throw new Error(error.message);
      return rows ?? [];
    };
    return withTimeout(fetchRows(), QUERY_TIMEOUT_MS, []);
  });

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const fetchRow = async () => {
      const { data: row, error } = await publicClient()
        .from("posts")
        .select(
          "id, title, slug, excerpt, content, cover_url, tags, author_name, read_minutes, published_at",
        )
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return row;
    };
    return withTimeout(fetchRow(), QUERY_TIMEOUT_MS, null);
  });
