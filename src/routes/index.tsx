import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { logoWhite, taral, maria } from "@/assets/images";
import { Reveal } from "@/components/site/Reveal";
import { LatestPosts } from "@/components/site/LatestPosts";
import { Newsletter } from "@/components/site/Newsletter";
import { ContactForm } from "@/components/site/ContactForm";
import { listPublishedPosts } from "@/lib/blog.functions";
import { CLIENTS, CONTACT, NAV, PILLARS, PRODUCTS, SERVICES } from "@/components/site/data";

export const Route = createFileRoute("/")({
  loader: () => listPublishedPosts({ data: { limit: 3 } }),
  head: () => ({
    meta: [
      { title: "Career Space: From Confusion to Curiosity" },
      {
        name: "description",
        content:
          "Career Space is a Bengaluru education company working across maths assessment, career guidance and teacher training: assess, train, experience.",
      },
      { property: "og:title", content: "Career Space: From Confusion to Curiosity" },
      {
        property: "og:description",
        content:
          "Assessments that reveal how a student thinks, training that reinvents classrooms, and Math Cafe — maths you can hold in your hands.",
      },
    ],
  }),
  component: Index,
});

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
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: solid ? "color-mix(in oklab, var(--ink) 92%, transparent)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid
          ? "1px solid color-mix(in oklab, white 12%, transparent)"
          : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:px-10">
        <div className="flex items-center">
          <a href="#top" className="flex items-center gap-3">
            <img src={logoWhite} alt="Career Space" className="h-28 w-auto md:h-32" />
          </a>
        </div>
        <nav className="hidden lg:flex items-center justify-center">
          <div className="flex items-center gap-8">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.82rem] font-medium tracking-wide text-background/70 transition-colors hover:text-spark"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        <div className="hidden items-center justify-end lg:flex">
          <a
            href="#contact"
            className="rounded-full bg-spark px-5 py-2 text-[0.82rem] font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start a conversation
          </a>
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
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-background/10 py-3 font-display text-2xl text-background"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex rounded-full bg-spark px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Start a conversation
          </a>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="surface-ink relative overflow-hidden">
      <div className="rule-grid absolute inset-0 opacity-[0.25]" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 top-10 hidden h-[520px] w-[520px] rounded-full opacity-40 blur-[90px] lg:block"
        style={{ background: "radial-gradient(circle, var(--spark) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-32 lg:px-10 lg:pb-20 lg:pt-40">
        <div className="reveal max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-background/20 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-background/70">
            Bengaluru · Education
          </span>
          <h1 className="mt-7 text-[clamp(2.6rem,6.6vw,5.4rem)] text-background">
            From confusion
            <br />
            to <span className="italic font-semibold text-spark">curiosity</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-background/70">
            Career Space works at the intersection of mathematics education, career guidance and
            teacher training, helping students discover paths they didn't know they'd love, and
            giving educators the tools to make that discovery possible.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#products"
              className="group inline-flex items-center gap-2.5 rounded-full bg-spark px-6 py-3 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore what we build
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#math-cafe"
              className="inline-flex items-center gap-2.5 rounded-full border border-background/25 px-6 py-3 text-sm font-semibold text-background/85 transition-colors hover:border-spark hover:text-spark"
            >
              Math Cafe
            </a>
          </div>
        </div>
        <div className="reveal mt-14 grid gap-px overflow-hidden rounded-lg border border-background/15 bg-background/15 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "10+", v: "years in education" },
            { k: "300+", v: "teachers trained" },
            { k: "800+", v: "students in workshops" },
            { k: "20+", v: "cities covered across India" },
          ].map((s) => (
            <div key={s.k} className="bg-ink/60 px-6 py-7">
              <div className="font-display text-3xl text-spark md:text-4xl">{s.k}</div>
              <div className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-background/55">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative border-y border-background/12 py-4">
        <div className="flex w-max marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {CLIENTS.map((c) => (
                <span key={c + dup} className="flex items-center whitespace-nowrap px-8">
                  <span className="mr-8 text-spark">✦</span>
                  <span className="font-display text-lg text-background/70">{c}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  lede,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`eyebrow ${dark ? "text-spark" : "text-accent"}`}>{eyebrow}</p>
      <h2
        className={`mt-5 text-[clamp(2rem,4vw,3.25rem)] ${dark ? "text-background" : "text-ink"}`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-6 text-lg leading-relaxed ${dark ? "text-background/70" : "text-muted-foreground"}`}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

function Goal() {
  return (
    <section
      id="about"
      className="scroll-mt-24 mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-36"
    >
      <Reveal>
        <SectionHead
          eyebrow="Our goal"
          title="Confusion is the first step toward curiosity."
          lede="We started with a question every maths teacher has heard a hundred times, “when will I ever use this?”, and built our work around answering it properly."
        />
      </Reveal>
      <Reveal>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Career Space is a Bengaluru based education company. Our starting point is simple:
          confusion is the first step toward curiosity, not a problem to avoid. We work across
          maths education, career guidance and teacher training, helping students discover subjects
          and paths they didn't know they'd love, and helping teachers teach in ways that make that
          discovery possible.
        </p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          Instead of piling on more formulae and shortcuts, we design experiences: assessments that
          show how a student actually thinks, workshops that turn abstract ideas into something you
          can touch and play with, and training that gives teachers the tools to run a classroom
          built on curiosity rather than memorization.
        </p>
      </Reveal>
      <div className="mt-16 grid gap-px border border-border bg-border md:grid-cols-2">
        {[
          {
            t: "Vision",
            b: "To create a world where learners, teachers and professionals feel supported to question, explore and grow with confidence.",
          },
          {
            t: "Mission",
            b: "At Career Space, we support students in discovering fulfilling career paths, empower teachers with innovative inquiry-based practices, and guide learners to see mathematics as a space of curiosity and clarity. Through co-creation, ethical innovation, and a culture of questioning, we make learning meaningful, empowering, and future-ready.",
          },
        ].map((item, i) => (
          <Reveal key={item.t} delay={i * 120}>
            <div className="h-full bg-card p-10 lg:p-14">
              <h3 className="text-3xl text-ink">{item.t}</h3>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{item.b}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-24 grid gap-10 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal key={p.no} delay={i * 120}>
            <div className="group border-t border-ink pt-6">
              <span className="eyebrow text-accent">{p.no}</span>
              <h3 className="mt-4 text-3xl text-ink transition-transform duration-500 group-hover:translate-x-1">
                {p.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ListSection({
  id,
  eyebrow,
  title,
  lede,
  items,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  items: { index: string; title: string; body: string }[];
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHead eyebrow={eyebrow} title={title} lede={lede} />
        </Reveal>
        <div className="mt-16">
          {items.map((item, i) => (
            <Reveal key={item.index} delay={i * 90}>
              <div className="group grid gap-6 border-t border-border py-10 transition-colors duration-500 hover:bg-secondary/60 md:grid-cols-[100px_1fr_1.1fr] md:items-start md:gap-10 md:px-4">
                <span className="eyebrow pt-2 text-accent">{item.index}</span>
                <h3 className="text-[clamp(1.6rem,3vw,2.4rem)] text-ink">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}

function MathCafe() {
  return (
    <section id="math-cafe" className="scroll-mt-24 surface-ink relative overflow-hidden">
      <div className="rule-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-36">
        <Reveal>
          <p className="eyebrow text-spark">Featured program</p>
          <h2 className="mt-6 max-w-4xl text-[clamp(2.1rem,5vw,4rem)] text-background">
            Math Cafe: Where Math Becomes Fun, Accessible, and Doable.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-background/75">
              Math Cafe is our flagship experience, a workshop that takes mathematics out of the
              textbook and puts it somewhere far more interesting: your hands. Through hands on
              stations, real world puzzles and guided discovery, participants meet mathematical
              ideas the way they were meant to be found, by noticing patterns first, and getting
              the official name for them later.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-background/60">
              One of our most loved and most repeated programs, run for schools, colleges and
              community groups across Bengaluru, proof that maths doesn't need to be intimidating
              to be rigorous.
            </p>
            <a
              href={CONTACT.mathCafe}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-spark px-7 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore Math Cafe
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </Reveal>
          <Reveal delay={220}>
            <div className="grid gap-px border border-background/15 bg-background/15">
              {[
                "Hands-on discovery stations",
                "Real-world puzzles, no shortcuts",
                "Schools, colleges & community groups",
                "Patterns first, names later",
              ].map((f) => (
                <div key={f} className="flex items-center gap-4 bg-ink/60 px-6 py-6">
                  <span className="text-spark">✦</span>
                  <span className="font-display text-xl text-background/85">{f}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Team() {
  const people = [
    {
      img: taral,
      name: "Taral Shah",
      role: "Founder, Teacher Trainer & Career Mentor",
      bio: "Taral's decade plus in mathematics education sits behind everything we do at Career Space. A Ministry certified trainer, he runs hands on workshops that get students curious and give teachers engaging, activity based methods they can use right away.",
    },
    {
      img: maria,
      name: "Dr. Maria Thomas",
      role: "Senior Academic Advisor",
      bio: "A UK based educator with a PhD and a long list of maths and teaching qualifications (MSc, MPhil, MStat USA, B.Ed, CILT UK, PGCAP UK, PGDCA). Formerly Academic Head at Sacred Heart Girls and Vice Principal with the Notre Dame Sisters in Chicago, she has spent 21 years helping students do their best.",
    },
  ];

  return (
    <section id="team" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHead eyebrow="Our team" title="The people behind the questions." />
        </Reveal>
        <div className="mt-16 grid gap-14 md:grid-cols-2">
          {people.map((p, i) => (
            <Reveal key={p.name} delay={i * 140}>
              <article className="group">
                <div className="relative overflow-hidden bg-ink">
                  <img
                    src={p.img}
                    alt={`Portrait of ${p.name}`}
                    loading="lazy"
                    className="aspect-4/5 w-full object-cover object-top grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <h3 className="mt-7 text-3xl text-ink">{p.name}</h3>
                <p className="mt-2 eyebrow text-accent">{p.role}</p>
                <p className="mt-5 leading-relaxed text-muted-foreground">{p.bio}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Clients() {
  return (
    <section className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.6rem,3.4vw,2.6rem)] text-ink">
            Trusted by institutions that care about how students learn.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {CLIENTS.map((c, i) => (
            <Reveal key={c} delay={i * 70}>
              <div className="flex h-full items-center justify-center bg-background px-6 py-10 text-center font-display text-lg text-ink-soft">
                {c}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 surface-ink relative overflow-hidden">
      <div className="rule-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-[1200px] px-6 py-24 lg:px-10 lg:py-36">
        <Reveal>
          <p className="eyebrow text-spark">Contact</p>
          <h2 className="mt-6 max-w-4xl text-[clamp(2.1rem,5vw,4rem)] text-background">
            Let's make learning
            <br />
            worth exploring.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-10 border-t border-background/15 pt-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <ContactForm />
          </div>
          <div className="md:col-span-1 flex flex-col justify-start gap-8 pt-7">
            {[
              { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
              {
                label: "Phone / WhatsApp",
                value: CONTACT.phone,
                href: `https://wa.me/${CONTACT.whatsapp}`,
              },
              { label: "Studio", value: CONTACT.address },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 110}>
                <p className="eyebrow text-background/50">{c.label}</p>
                {c.href ? (
                  <a
                    href={c.href}
                    className="mt-3 block font-display text-2xl text-background transition-colors hover:text-spark"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-3 font-display text-2xl text-background">{c.value}</p>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
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

function SiteFooter() {
  return (
    <footer className="relative border-t border-background/15">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <img src={logoWhite} alt="Career Space" className="h-44 w-auto md:h-56" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-background/60">
            Assessment, training and hands on experience, making mathematics, careers and learning
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

function Index() {
  const posts = Route.useLoaderData();

  return (
    <main className="bg-background">
      <Nav />
      <Hero />
      <Goal />
      <ListSection
        id="products"
        eyebrow="Our products"
        title="Self contained tools, built for how people actually learn."
        lede="Assessments and teaching tools designed to replace guesswork with evidence, and scores with understanding."
        items={PRODUCTS}
      />
      <ListSection
        id="services"
        eyebrow="Our services"
        title="Services we run, in person."
        lede="Hands on work with schools, colleges and organisations across Bengaluru."
        items={SERVICES}
      />
      <MathCafe />
      <Team />
      <LatestPosts posts={posts as never} />
      <Newsletter />
      <Clients />
      <Contact />
    </main>
  );
}
