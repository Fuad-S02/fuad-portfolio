"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { Logo } from "./Logo";
import { onWorkLinkClick } from "@/lib/work-sheet";

/**
 * Bare floating header: logo left; "Work" + "Get in touch" right.
 * No menu/drawer. Link ink flips with the section underneath via `.nav-ink`
 * (see globals.css); the Get in touch pill (same style as the old hero button) has a dark
 * variant over the white sheet (`.nav-pill` rules).
 */
export function Navbar() {
  const lenis = useLenis();
  const pathname = usePathname();

  // Home logo while already home → scroll to top.
  const onHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { force: true });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // "Get in touch" on the homepage → smooth-scroll to the contact section.
  const onContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    const el = document.getElementById("contact");
    if (!el) return;
    e.preventDefault();
    // #contact marks the point where the closing stage is fully revealed.
    if (lenis) lenis.scrollTo(el, { force: true });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6 lg:px-16">
      <Link
        href="/"
        className="group flex items-center"
        aria-label="Fuad Salma — home"
        onClick={onHome}
      >
        <Logo className="nav-ink h-10 w-auto text-ink transition-colors group-hover:text-blue sm:h-11" />
      </Link>

      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/work"
          onClick={onWorkLinkClick}
          aria-current={pathname === "/work" ? "page" : undefined}
          className="nav-ink rounded-full px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-blue"
        >
          Work
        </Link>
        <Link
          href="/#contact"
          onClick={onContact}
          className="nav-ink nav-pill inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 py-1.5 pr-1.5 pl-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink backdrop-blur-md transition-colors hover:bg-white/15"
        >
          Get in touch
          <span className="nav-pill-icon grid h-7 w-7 place-items-center rounded-full bg-white text-[#040816]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </span>
        </Link>
      </nav>
    </header>
  );
}
