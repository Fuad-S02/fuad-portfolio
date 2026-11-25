import { siBlender, siClaude, siClaudecode, siElevenlabs, siFigma } from "simple-icons";

/**
 * Endless strip of the tools Fuad works with, as logos (not words), for the
 * bottom of the hero. Every mark is drawn in one colour (currentColor), so
 * brands with very different colours read as one quiet set.
 *
 * Sources: Figma, Blender, Claude, Claude Code, ElevenLabs from Simple Icons.
 * Adobe apps: Fuad's official SVGs, turned into one-colour knockouts in
 * /public/logos/tools/mono (originals kept alongside). OpenAI Blossom
 * (openai.com/brand), Higgsfield (higgsfield.ai) and Kling (kling.ai) marks
 * as SVGs in /public/logos/tools.
 */

type Tool =
  | { name: string; path: string } // Simple Icons (24×24 viewBox)
  | { name: string; src: string }; // our SVG file, drawn as a colour mask

const TOOLS: Tool[] = [
  { name: "Adobe Photoshop", src: "/logos/tools/mono/photoshop.svg" },
  { name: "Adobe Illustrator", src: "/logos/tools/mono/illustrator.svg" },
  { name: "Adobe After Effects", src: "/logos/tools/mono/after-effects.svg" },
  { name: "Adobe Premiere Pro", src: "/logos/tools/mono/premiere-pro.svg" },
  { name: "Figma", path: siFigma.path },
  { name: "Blender", path: siBlender.path },
  { name: "OpenAI", src: "/logos/tools/openai.svg" },
  { name: "Claude", path: siClaude.path },
  { name: "Claude Code", path: siClaudecode.path },
  { name: "Higgsfield", src: "/logos/tools/higgsfield.svg" },
  { name: "Kling", src: "/logos/tools/kling.svg" },
  { name: "ElevenLabs", path: siElevenlabs.path },
];

function Mark({ tool }: { tool: Tool }) {
  if ("path" in tool) {
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" aria-hidden>
        <path d={tool.path} />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className="block h-full w-full bg-current"
      style={{
        maskImage: `url(${tool.src})`,
        WebkitMaskImage: `url(${tool.src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function ToolMarquee({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)] ${className ?? ""}`}
    >
      <p className="sr-only">Tools I use: {TOOLS.map((t) => t.name).join(", ")}</p>
      <ul
        aria-hidden
        className="flex w-max animate-[marquee_38s_linear_infinite] items-center motion-reduce:animate-none"
      >
        {[...TOOLS, ...TOOLS].map((t, i) => (
          <li
            key={i}
            title={t.name}
            className="mx-6 h-8 w-8 shrink-0 text-white/65 transition-colors duration-300 hover:text-white sm:mx-8"
          >
            <Mark tool={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
