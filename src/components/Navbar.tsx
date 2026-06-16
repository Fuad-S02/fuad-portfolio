"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { Logo } from "./Logo";
import { EASE } from "@/lib/motion";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

const EMAIL = "fuad-salma@outlook.com";
const LINKEDIN = "https://www.linkedin.com/in/fuad-salma-944051224/";
const RESUME =
  "https://drive.google.com/file/d/1qbYW2YdP-923hM1A7Y985XzbaoGRzWDG/view?usp=sharing";

const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const panelItem = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();

  // Esc to close + lock scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    // Lock the page behind the drawer.
    if (lenis) lenis.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      if (lenis) lenis.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [open, lenis]);

  // Same-page hash links scroll smoothly; cross-page links navigate normally.
  const onNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Home while already home → scroll to top.
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => {
        if (lenis) lenis.scrollTo(0, { force: true });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return;
    }
    if (href.startsWith("/#") && pathname === "/") {
      const el = document.getElementById(href.slice(2));
      if (el) {
        e.preventDefault();
        setOpen(false);
        // Defer one frame so the menu's lenis.stop() has been reverted by
        // lenis.start() before we scroll (force also bypasses the stopped state).
        requestAnimationFrame(() => {
          if (lenis) lenis.scrollTo(el, { offset: -90, force: true });
          else el.scrollIntoView({ behavior: "smooth" });
        });
        return;
      }
    }
    setOpen(false);
  };

  return (
    <>
      {/* Bare floating header — logo left, menu toggle right. No bar. */}
      <header className="fixed inset-x-0 top-0 z-[60] flex items-start justify-between px-6 py-5 sm:px-10 sm:py-6 lg:px-16">
        <Link
          href="/"
          className="group flex items-center"
          aria-label="Fuad Salma — home"
          onClick={() => setOpen(false)}
        >
          <Logo className="h-10 w-auto text-ink transition-colors group-hover:text-blue sm:h-11" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="group -mr-1 inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-ink transition-colors hover:bg-bg-soft"
        >
          <span className="hidden font-mono text-[0.7rem] uppercase tracking-[0.18em] sm:inline">
            {open ? "Close" : "Menu"}
          </span>
          <MenuGlyph open={open} />
        </button>
      </header>

      {/* Backdrop + right-side drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/35"
              aria-hidden
            />

            <motion.aside
              key="drawer"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="fixed inset-y-0 right-0 z-[55] flex h-full w-full flex-col border-l border-border bg-bg text-ink shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.5)] sm:w-[60vw] lg:w-[40vw] lg:min-w-[26rem]"
            >
              <motion.div
                variants={reduce ? undefined : panelStagger}
                initial={reduce ? undefined : "hidden"}
                animate={reduce ? undefined : "show"}
                className="flex h-full flex-col overflow-y-auto px-8 pb-10 pt-28 sm:px-12 sm:pt-32"
              >
                <nav className="flex flex-1 flex-col justify-center">
                  <ul className="flex flex-col">
                    {NAV.map((item) => (
                      <motion.li
                        key={item.href}
                        variants={reduce ? undefined : panelItem}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => onNavClick(e, item.href)}
                          className="group flex items-baseline gap-4 border-b border-border/60 py-4"
                        >
                          <span className="font-display text-4xl font-bold uppercase tracking-tight transition-colors group-hover:text-blue sm:text-5xl">
                            {item.label}
                          </span>
                          <span className="ml-auto translate-x-0 self-center text-muted opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Connect + Let's talk pinned to the bottom of the panel. */}
                <motion.div
                  variants={reduce ? undefined : panelItem}
                  className="mt-8 flex flex-col gap-5 border-t border-border pt-6"
                >
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                    <a
                      href={`mailto:${EMAIL}`}
                      className="transition-colors hover:text-blue"
                    >
                      {EMAIL}
                    </a>
                    <a
                      href={LINKEDIN}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-blue"
                    >
                      LinkedIn ↗
                    </a>
                    <a
                      href={RESUME}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-blue"
                    >
                      Resume ↗
                    </a>
                  </div>

                  <Link
                    href="/#contact"
                    onClick={(e) => onNavClick(e, "/#contact")}
                    className="group inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-blue-light/95 via-blue to-blue-deep px-5 py-3.5 text-sm font-medium text-white shadow-[0_8px_22px_-8px_rgba(37,99,235,0.7)] transition-[filter] hover:brightness-110"
                  >
                    Let&apos;s talk
                    <span className="transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/** Two asymmetric lines that morph into an X on open. */
function MenuGlyph({ open }: { open: boolean }) {
  const t = { duration: 0.4, ease: EASE };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className="text-ink transition-colors group-hover:text-blue"
    >
      <motion.path
        animate={{ d: open ? "M4 5 L16 15" : "M3 7 L17 7" }}
        transition={t}
      />
      <motion.path
        animate={{ d: open ? "M4 15 L16 5" : "M3 13 L13 13" }}
        transition={t}
      />
    </svg>
  );
}
