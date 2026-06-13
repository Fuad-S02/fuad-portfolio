import type { Metadata } from "next";
import { WorkArchive } from "@/components/WorkArchive";

export const metadata: Metadata = {
  title: "Work — Fuad Salma",
  description:
    "Selected projects across brand, motion, UI/UX and AI-driven creative.",
};

export default function WorkPage() {
  return <WorkArchive />;
}
