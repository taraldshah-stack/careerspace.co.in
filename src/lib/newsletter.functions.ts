import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        name: z.string().trim().max(120).optional(),
        source: z.string().trim().max(60).default("website"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subscribers").upsert(
      {
        email: data.email.toLowerCase(),
        name: data.name ?? null,
        source: data.source,
        status: "subscribed",
      },
      { onConflict: "email" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });