import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { logoWhite } from "@/assets/images";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/posts", label: "Blog posts" },
  { to: "/admin/subscribers", label: "Subscribers" },
  { to: "/admin/campaigns", label: "Campaigns" },
  { to: "/admin/contacts", label: "Contacts" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-ink sticky top-0 z-40 border-b border-background/12">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-5">
            <img src={logoWhite} alt="Career Space" className="h-36 w-auto" />
            <span className="hidden text-[0.7rem] uppercase tracking-[0.22em] text-background/45 sm:block">
              Content studio
            </span>
          </div>
          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto lg:order-2 lg:w-auto">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: Boolean((l as { exact?: boolean }).exact) }}
                activeProps={{ className: "bg-spark text-ink" }}
                inactiveProps={{ className: "text-background/65 hover:text-spark" }}
                className="whitespace-nowrap rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="order-2 flex items-center gap-3 lg:order-3">
            <a
              href="/"
              className="text-[0.78rem] text-background/55 transition-colors hover:text-spark"
            >
              View site ↗
            </a>
            <button
              onClick={signOut}
              className="rounded-full border border-background/25 px-4 py-2 text-[0.78rem] font-semibold text-background/80 transition-colors hover:border-spark hover:text-spark"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1320px] px-6 py-10 lg:px-10 lg:py-14">
        <Outlet />
      </main>
    </div>
  );
}