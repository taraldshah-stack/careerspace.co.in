import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!name || !email || !message) {
      setErrorText("Please fill name, email and message.");
      setStatus("error");
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, phone: phone || null, message, created_at: new Date().toISOString() } as any;
      // Try to insert into a `contacts` table in Supabase if available
      // If Supabase isn't configured the client will throw and we show an error
      const { data, error } = await supabase.from("contacts").insert(payload);
      if (error) {
        console.error(error);
        setErrorText(error.message || "Submission failed");
        setStatus("error");
      } else {
        setStatus("success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Submission failed");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[720px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-sm font-medium text-background/80">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            placeholder="Your name"
            required
          />
        </label>
        <label className="block">
          <div className="mb-1 text-sm font-medium text-background/80">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            placeholder="you@domain.com"
            required
          />
        </label>
      </div>

      <label className="block mt-4">
        <div className="mb-1 text-sm font-medium text-background/80">Phone (optional)</div>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          placeholder="+91 99xxxxxxx"
        />
      </label>

      <label className="block mt-4">
        <div className="mb-1 text-sm font-medium text-background/80">Message</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-accent"
          placeholder="Tell us about your enquiry"
          required
        />
      </label>

      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-spark px-6 py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send message"}
        </button>
        {status === "success" && <p className="text-sm text-spark">Thanks — we'll get back soon.</p>}
        {status === "error" && <p className="text-sm text-accent">{errorText}</p>}
      </div>
    </form>
  );
}
