import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { logoWhite } from "@/assets/images";
import { CLIENTS, CONTACT, NAV } from "@/components/site/data";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-ink text-background">
      <Nav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-transparent transition-all duration-500"
      style={{
        backgroundColor: solid ? "color-mix(in oklab, var(--ink) 92%, transparent)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid
          ? "1px solid color-mix(in oklab, white 12%, transparent)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[auto_1fr_auto] items-center px-6 py-4 lg:px-10">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoWhite} alt="Career Space" className="h-28 w-auto md:h-32" />
          </Link>
        </div>
        <nav className="hidden lg:flex items-center justify-center">
          <div className="flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href.startsWith("#") ? `/${item.href}` : item.href}
                className="text-[0.82rem] font-medium tracking-wide text-background/70 transition-colors hover:text-spark"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center justify-end">
          <Link
            to="/#contact"
            className="rounded-full bg-spark px-5 py-2 text-[0.82rem] font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start a conversation
          </Link>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-background/25 lg:hidden"
        >
          <span className="relative block h-[9px] w-4">
            <span className="absolute inset-x-0 top-0 h-[1.5px] bg-background" />
            <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-background" />
          </span>
        </button>
      </div>
      {open && (
        <div className="border-t border-background/10 bg-ink px-6 pb-6 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href.startsWith("#") ? `/${item.href}` : item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-background/10 py-3 font-display text-2xl text-background"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-background/15">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <img src={logoWhite} alt="Career Space" className="h-44 w-auto md:h-56" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/60">
            Assessment, training and hands-on experience — making mathematics, careers and learning
            itself feel like a space worth exploring.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 text-background/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-spark hover:text-spark"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                  {s.paths.map((path) => (
                    <path
                      key={path.d}
                      d={path.d}
                      fillRule={path.fillRule}
                      clipRule={path.clipRule}
                    />
                  ))}
                </svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow text-background/45">Explore</p>
          <ul className="mt-5 space-y-3">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="text-sm text-background/70 transition-colors hover:text-spark"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-background/45">Get in touch</p>
          <ul className="mt-5 space-y-3 text-sm text-background/70">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-spark">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-spark"
              >
                {CONTACT.phone}
              </a>
            </li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-[1200px] px-6 py-6 text-[0.72rem] uppercase tracking-[0.18em] text-background/40 lg:px-10">
          <p>© {new Date().getFullYear()} Career Space</p>
        </div>
      </div>
    </footer>
  );
}

const SOCIALS = [
  {
    label: "Instagram",
    href: CONTACT.instagram,
    paths: [
      {
        d: "M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z",
        fillRule: "evenodd" as const,
        clipRule: "evenodd" as const,
      },
    ],
  },
  {
    label: "LinkedIn",
    href: CONTACT.linkedin,
    paths: [
      {
        d: "M12.51 8.796v1.697a3.738 3.738 0 0 1 3.288-1.684c3.455 0 4.202 2.16 4.202 4.97V19.5h-3.2v-5.072c0-1.21-.244-2.766-2.128-2.766-1.827 0-2.139 1.317-2.139 2.676V19.5h-3.19V8.796h3.168ZM7.2 6.106a1.61 1.61 0 0 1-.988 1.483 1.595 1.595 0 0 1-1.743-.348A1.607 1.607 0 0 1 5.6 4.5a1.601 1.601 0 0 1 1.6 1.606Z",
        fillRule: "evenodd" as const,
        clipRule: "evenodd" as const,
      },
      { d: "M7.2 8.809H4V19.5h3.2V8.809Z" },
    ],
  },
  {
    label: "YouTube",
    href: CONTACT.youtube,
    paths: [
      {
        d: "M21.7 8.037a4.26 4.26 0 0 0-.789-1.964 2.84 2.84 0 0 0-1.984-.839c-2.767-.2-6.926-.2-6.926-.2s-4.157 0-6.928.2a2.836 2.836 0 0 0-1.983.839 4.225 4.225 0 0 0-.79 1.965 30.146 30.146 0 0 0-.2 3.206v1.5a30.12 30.12 0 0 0 .2 3.206c.094.712.364 1.39.784 1.972.604.536 1.38.837 2.187.848 1.583.151 6.731.2 6.731.2s4.161 0 6.928-.2a2.844 2.844 0 0 0 1.985-.84 4.27 4.27 0 0 0 .787-1.965 30.12 30.12 0 0 0 .2-3.206v-1.516a30.672 30.672 0 0 0-.202-3.206Zm-11.692 6.554v-5.62l5.4 2.819-5.4 2.801Z",
        fillRule: "evenodd" as const,
        clipRule: "evenodd" as const,
      },
    ],
  },
];
