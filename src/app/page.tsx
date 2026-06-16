import { Hero } from "@/components/Hero";
import { BasedIn } from "@/components/BasedIn";
import { SelectedWork } from "@/components/SelectedWork";
import { Education } from "@/components/Education";
import { Marquee } from "@/components/Marquee";
import { LogoSignature } from "@/components/LogoSignature";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <BasedIn />
        <SelectedWork />
        <Education />
        <Marquee />
        <LogoSignature />
        <Contact />
      </main>
    </>
  );
}
