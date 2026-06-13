import type { Metadata } from "next";
import { About } from "@/components/About";

export const metadata: Metadata = {
  title: "About — Fuad Salma",
  description:
    "Multidisciplinary designer working across brand, motion, UI/UX and AI-driven creative. Based in Amman & Dubai.",
};

export default function AboutPage() {
  return <About />;
}
