import { HeroStage } from "@/components/HeroStage";
import { WorkSphere } from "@/components/WorkSphere";
import { Experience } from "@/components/Experience";
import { Testimonials } from "@/components/Testimonials";
import { Aspiration } from "@/components/Aspiration";
import { LightSheet } from "@/components/LightSheet";
import { ClosingStage } from "@/components/ClosingStage";

export default function Home() {
  return (
    <>
      <main>
        {/* Dark bluish opening… */}
        <HeroStage />
        {/* …a white sheet slides up over the pinned hero stage (the stage's
            last screen of scroll), so the 3D mark stays put and disappears
            behind it. Everything between the hero and the ending lives on
            this white sheet… */}
        <LightSheet className="relative z-10 -mt-[100svh] rounded-[2rem] bg-white shadow-[0_-40px_80px_-30px_rgba(0,0,0,0.7),0_40px_80px_-30px_rgba(0,0,0,0.55)] sm:rounded-[3rem]">
          <WorkSphere />
          <Experience />
          <Testimonials />
          <Aspiration />
        </LightSheet>
        {/* …and at the end the sheet lifts away, revealing the stage again:
            the FS mark in its final pose + the closing call to action. */}
        <ClosingStage />
      </main>
    </>
  );
}
