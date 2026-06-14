"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

const EMAIL = "fuad-salma@outlook.com";
const LINKEDIN = "https://www.linkedin.com/in/fuad-salma-944051224/";

const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};
const panelItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const pathname = usePathname();

  // Esc to close. (Page stays scrollable while the menu is open — the menu
  // is pinned to the fixed navbar, so the page scrolls behind it.)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
    <header className="fixed inset-x-0 top-0 z-50 px-6 sm:px-10 lg:px-16">
      <nav className="mx-auto mt-4 max-w-6xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-surface/70 backdrop-blur-xl">
          {/* Top bar */}
          <div className="flex items-center justify-between py-2.5 pl-4 pr-2.5">
            <Link
              href="/"
              className="group flex items-center"
              aria-label="Fuad Salma — home"
              onClick={() => setOpen(false)}
            >
              <Logo className="h-6 w-auto text-ink transition-colors group-hover:text-blue" />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/#contact"
                onClick={(e) => onNavClick(e, "/#contact")}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-b from-blue-light/95 via-blue to-blue-deep px-4 py-2 text-sm font-medium text-white shadow-[0_8px_22px_-8px_rgba(37,99,235,0.7)] transition-[filter] hover:brightness-110"
              >
                Let&apos;s talk
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-ink transition-colors hover:bg-bg-soft"
              >
                <MenuGlyph open={open} />
                <span className="hidden font-mono text-[0.7rem] uppercase tracking-[0.18em] sm:inline">
                  {open ? "Close" : "Menu"}
                </span>
              </button>
            </div>
          </div>

          {/* Unfolding panel */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="panel"
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="overflow-hidden"
              >
                <motion.div
                  variants={reduce ? undefined : panelStagger}
                  initial={reduce ? undefined : "hidden"}
                  animate={reduce ? undefined : "show"}
                  className="border-t border-border px-4 pb-5 pt-3 sm:px-5"
                >
                  <ul className="flex flex-col">
                    {NAV.map((item) => (
                      <motion.li
                        key={item.href}
                        variants={reduce ? undefined : panelItem}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => onNavClick(e, item.href)}
                          className="group flex items-baseline gap-4 border-b border-border/60 py-3.5 last:border-b-0"
                        >
                          <span className="font-display text-3xl font-bold uppercase tracking-tight transition-colors group-hover:text-blue sm:text-4xl">
                            {item.label}
                          </span>
                          <span className="ml-auto translate-x-0 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue group-hover:opacity-100">
                            →
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    variants={reduce ? undefined : panelItem}
                    className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted"
                  >
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
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}

/** Two asymmetric lines that morph into an X on open. */
function MenuGlyph({ open }: { open: boolean }) {
  const t = { duration: 0.4, ease: EASE };
  return (
    <svg
      width="20"
      height="20"
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
