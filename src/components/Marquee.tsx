const brands = [
  "MaktabiTech",
  "Triangle",
  "Canvas Home",
  "PricyPal",
  "Nook",
  "Hydralyte",
  "Taskrabbit",
];

const tools = [
  "Figma",
  "After Effects",
  "Illustrator",
  "Photoshop",
  "Premiere Pro",
  "Framer",
  "Claude",
  "ChatGPT",
  "Branding",
  "Motion",
  "UI/UX",
  "3D / CGI",
];

function Row({
  items,
  reverse,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className="flex overflow-hidden">
      <div
        className={`flex w-max shrink-0 items-center animate-[marquee_42s_linear_infinite] ${
          reverse ? "[animation-direction:reverse]" : ""
        } ${className ?? ""}`}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="cursor-default px-7 font-display text-2xl font-semibold tracking-tight transition-colors duration-200 hover:text-blue sm:text-3xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section className="relative overflow-hidden border-y border-border py-10 sm:py-14">
      <p className="mb-7 px-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.28em] text-muted sm:px-10">
        Brands shaped · tools mastered
      </p>
      <div className="flex flex-col gap-4 text-ink/80">
        <Row items={brands} />
        <Row items={tools} reverse className="text-muted" />
      </div>
    </section>
  );
}
