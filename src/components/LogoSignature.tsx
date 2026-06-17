"use client";

import { motion } from "motion/react";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { LogoDotField } from "./ui/logo-dotfield";

export function LogoSignature() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center px-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex w-full flex-col items-center"
      >
        <LogoDotField className="h-[90vh] max-h-[1000px] min-h-[460px] w-full" />
      </motion.div>
    </section>
  );
}
