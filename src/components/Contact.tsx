"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useLenis } from "lenis/react";
import Link from "next/link";
import { Logo } from "./Logo";
import { LiquidButton } from "./ui/liquid-glass-button";
import { staggerContainer, fadeUp, viewportOnce, EASE } from "@/lib/motion";
import { MaskLine } from "./ui/reveal";

// Footer rises up a touch more than the standard reveal for an end-of-page lift.
const footerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.22, delayChildren: 0.08 } },
};
const footerItem = {
  hidden: { opacity: 0, y: 90 },
  show: { opacity: 1, y: 0, transition: { duration: 1.3, ease: EASE } },
};

const EMAIL = "fuad-salma@outlook.com";
const LINKEDIN = "https://www.linkedin.com/in/fuad-salma-944051224/";
const RESUME =
  "https://drive.google.com/file/d/1qbYW2YdP-923hM1A7Y985XzbaoGRzWDG/view?usp=sharing";

export function Contact() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const climaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: climaxRef,
    offset: ["start end", "center center"],
  });
  // Gentle settle: the closing line grows into place as it nears center.
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  return (
    <section
      id="contact"
      className="relative flex min-h-screen flex-col justify-between px-6 pb-10 pt-28 text-ink sm:px-10 lg:px-16"
    >
      {/* Statement climax */}
      <motion.div
        ref={climaxRef}
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        style={reduce ? undefined : { scale }}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center text-center"
      >
        <motion.p
          variants={fadeUp}
          className="mb-7 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue pulse-dot" />
          Let&apos;s connect
        </motion.p>

        <h2 className="font-display text-[clamp(2.5rem,9vw,8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
          <MaskLine>Let&apos;s make</MaskLine>
          <MaskLine className="text-gradient">something that wins.</MaskLine>
        </h2>

        <motion.p
          variants={fadeUp}
          className="mt-8 max-w-md text-lg leading-relaxed text-muted"
        >
          Got something in mind, or just want to connect? I&apos;d love to
          hear from you.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-3.5"
        >
          <LiquidButton href={`mailto:${EMAIL}`} tone="blue">
            Get in touch
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </LiquidButton>
          <LiquidButton
            href={LINKEDIN}
            tone="glass"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </LiquidButton>
          <LiquidButton
            href={RESUME}
            tone="glass"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume ↗
          </LiquidButton>
        </motion.div>
      </motion.div>

      {/* Footer — rises up + fades in as you reach the bottom */}
      <motion.footer
        variants={footerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        className="mx-auto mt-20 w-full max-w-6xl"
      >
        <motion.div
          variants={reduce ? undefined : footerItem}
          className="flex flex-col gap-8 border-t border-border pt-10 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="max-w-xs">
            <Logo className="h-7 w-auto text-ink" />
            <p className="mt-4 text-sm">
              <span className="font-medium text-ink">Fuad Salma</span>
              <br />
              <span className="text-muted">Multidisciplinary Designer</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <FooterCol title="Sitemap">
              <FooterLink href="/work">Work</FooterLink>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="#contact">Contact</FooterLink>
            </FooterCol>
            <FooterCol title="Connect">
              <FooterLink href={`mailto:${EMAIL}`}>Email</FooterLink>
              <FooterLink href={LINKEDIN} external>
                LinkedIn
              </FooterLink>
              <FooterLink href={RESUME} external>
                Resume
              </FooterLink>
            </FooterCol>
            <FooterCol title="Based in">
              <span className="text-muted">Amman, Jordan</span>
              <span className="text-muted">Dubai, UAE</span>
            </FooterCol>
          </div>
        </motion.div>

        <motion.div
          variants={reduce ? undefined : footerItem}
          className="mt-10 flex flex-col gap-3 border-t border-border pt-6 font-mono text-[0.7rem] uppercase tracking-wider text-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <span>© 2026 Fuad Salma</span>
          <button
            type="button"
            onClick={() =>
              lenis
                ? lenis.scrollTo(0)
                : window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink"
          >
            Back to top ↑
          </button>
        </motion.div>
      </motion.footer>
    </section>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted/70">
        {title}
      </span>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  if (external || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="w-fit text-muted transition-colors hover:text-ink"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="w-fit text-muted transition-colors hover:text-ink">
      {children}
    </Link>
  );
}
