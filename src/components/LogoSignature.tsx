"use client";

import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { LogoDotField } from "./ui/logo-dotfield";

export function LogoSignature() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 py-28 sm:py-36">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex w-full max-w-3xl flex-col items-center"
      >
        <LogoDotField className="h-[58vh] max-h-[560px] min-h-[360px] w-full" />
        <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted">
          Move your cursor
        </p>
      </motion.div>
    </section>
  );
}
