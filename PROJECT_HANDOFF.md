# PROJECT HANDOFF — Fuad Salma Portfolio

> Handoff for any new Claude Code session. Read this fully before making changes.
> Last updated: 2026-06-08.

---

## 1. Project Goal

Rebuild **Fuad Salma's** portfolio — currently a Framer site at
`https://fuadsalma.framer.website` — into a **custom-coded Next.js site**.

- **Repositioning:** from "graphic designer" → **"multidisciplinary, AI-driven designer who also codes."** MaktabiTech is the flagship work.
- **Design direction (evolved):** light/dark themed, **bold + slick/tech-feeling**, distinctive (not a template). **Blue gradient as a ~10% signature accent.** Fonts: **Archivo** (display) + **Space Grotesk** (body), mono for labels. Lots of motion, but clear and not distracting.
- **Owner:** Fuad Salma — Multidisciplinary Designer (Brand · Motion · UI/UX · AI). Based **Amman, Jordan + Dubai, UAE**. Email `fuad-salma@outlook.com`, LinkedIn `in/fuad-salma`. Senior Designer @ **MaktabiTech** (AV/IT deep-tech serving NEOM/PIF/gov clients) — grew their LinkedIn ~8K→12K. BA Visual Arts, University of Jordan, GPA 3.64, Advisory Board Member.

⚠️ **Integrity note:** NEOM/PIF/government are MaktabiTech's clients (company context), **NOT** Fuad's personal wins. Never phrase them as his achievements.

---

## 2. ⚠️ CRITICAL ENVIRONMENT FACTS

- **The Next.js app lives on the FAST drive:** `C:\Users\foadx\fuad-portfolio`.
  Do ALL code Read/Write/Edit there. (It was moved off the slow `G:` drive on 2026-06-07 to fix constant Turbopack stalls. The old `G:\Claude Code\fuad-portfolio` copy was DELETED.)
- **User's source assets / inspiration live on `G:`:** `G:\Claude Code\` (CV, Inspirations, MaktabiTech videos, Selected Works, design-system, Based In section (Inspo), Motion (Inspiration)).
- **Windows machine.** Node/npm at `C:\Program Files\nodejs`. `git` present; `ffmpeg`/`ffprobe` installed (via winget); `three` already a dep.
- **Dev preview** is driven by the **Claude_Preview MCP** (`mcp__Claude_Preview__preview_*`). It reads `G:\Claude Code\.claude\launch.json`:
  ```json
  { "version":"0.0.1","configurations":[{
    "name":"fuad-portfolio","runtimeExecutable":"cmd.exe",
    "runtimeArgs":["/d","/s","/c","set PATH=C:\\Program Files\\nodejs;%PATH%&& cd /d C:\\Users\\foadx\\fuad-portfolio&& npm run dev"],
    "port":3000 }]}
  ```
- **For Bash/PowerShell tool calls that need node/npm/ffmpeg**, prepend a PATH refresh:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine")+";"+[Environment]::GetEnvironmentVariable("Path","User")`
- **AGENTS.md** in the project warns: this is **Next.js 16** with breaking changes — bundled docs at `node_modules/next/dist/docs/`. App Router, Server Components by default; motion/canvas components need `"use client"`.

---

## 3. Tech Stack

- **Next.js 16.2.7** (App Router, **Turbopack**), **React 19.2**, **TypeScript 5**
- **Tailwind CSS v4** (config-in-CSS via `@theme` in `globals.css`)
- **motion** `^12` (the `motion/react` package — NOT `framer-motion`; adapt any pasted `framer-motion` imports)
- **three** `^0.184` (+ `@types/three`) — used by ghost cursor, and the old ShaderLightning
- **clsx** + **tailwind-merge** (`cn()` helper in `src/lib/utils.ts`)
- Fonts via `next/font/google` (Archivo, Space_Grotesk)
- **NO** tsParticles (was tried for sparkles, removed — version hell; replaced with a custom canvas)

---

## 4. Completed Work — Landing Page (6 sections)

Page order in `src/app/page.tsx`: **Navbar → Hero → BasedIn → SelectedWork → Education → Marquee → Contact**, all over one fixed **Background**.

1. **Navbar** (`Navbar.tsx`) — floating glass pill, **logo-only** (no name), links Work/About/Contact + **blue "Let's talk →"** pill. Responsive: hamburger + animated dropdown on mobile.
2. **Hero** (`Hero.tsx`) — left-aligned editorial. Eyebrow "Multidisciplinary Designer", "● Technical + Creative" pill, huge **"CREATIVITY / ENGINEERED."** (ENGINEERED in blue gradient), 4 **capability pills** w/ line-icons (Brand Design/Motion Graphics/UI-UX/AI Creative) — **lift+blue glow on hover**, systems-first body copy, underlined "View work →". Transparent (uses global Background).
3. **BasedIn** (`BasedIn.tsx`) — "● Currently — MaktabiTech" pill, **"BASED IN / AMMAN & DUBAI"** (blue gradient), **work positions** list (Now MaktabiTech–Senior Designer / 2021–25 Independent / 2024 Canvas Art Furniture / 2022–23 Green Fields), stats (5+ Years · 40+ Projects · 8K→12K LinkedIn reach). **Interactive 3D globe** (`ui/interactive-globe.tsx`, canvas, drag-to-rotate, markers on Amman+Dubai + arcs) overlapping behind the headline, with a **scroll-driven 3D tilt** entrance. Globe is **masked to a circle** to avoid a square layer edge.
4. **SelectedWork** (`SelectedWork.tsx`) — 6 projects with a **permanent "View" switcher** (Rows / Masonry / Spotlight layouts; icons + aria-pressed). Each project: **in-view autoplay muted-loop video** (`ui/project-media.tsx`, IntersectionObserver), industry+discipline tags, index, year, "View project →" → `/work/[slug]`. Projects: Office Assembling (2026), Retractable Screen (2026, portrait), Audio Zoning (2026), PricyPal (2025), Triangle (2026), Canvas Home (2025). **All have real optimized video** in `public/work/`.
5. **Education** (`Education.tsx`) — "Education & Recognition", "Trained in the craft — trusted to shape it", 3 **glossy GlowCards** (BA Visual Arts · GPA 3.64/4.0 · Advisory Board Member) with **cursor-following blue spotlight** + lift + glow on hover.
6. **Marquee** (`Marquee.tsx`) — two CSS-keyframe tickers (`@keyframes marquee` in globals): brands row + tools row (incl. ChatGPT). **Never pauses**; each word **hovers blue**.
7. **Contact** (`Contact.tsx`, `#contact`) — statement climax **"LET'S MAKE / SOMETHING THAT WINS."** (mask reveal) → CTAs (Start a project = `mailto:`, blue LiquidButton; LinkedIn glass) → footer (Logo, Fuad Salma / Multidisciplinary Designer, Sitemap/Connect/Based-in cols, © 2026 + Back-to-top).

**Theme system:** `theme.tsx` (ThemeProvider + useTheme), `ThemeToggle.tsx` (fixed bottom-right sun/moon), tokens flip via `.dark` class + `@custom-variant dark` in `globals.css`. No-FOUC via external `public/theme-init.js` loaded with `<Script src strategy="beforeInteractive">` (defaults dark).

**Background (current):** `Background.tsx` (fixed `inset-0 -z-10`) = base wash + **Sparkles** (`ui/sparkles.tsx`, custom canvas drifting dots) + **GhostCursor** (`ui/ghost-cursor.tsx`, three.js smoky blue glowing cursor trail w/ UnrealBloom). Theme-aware. **This REPLACED the old cursor-lightning** (`ShaderLightning.tsx`, kept in repo for revert).

---

## 5. Remaining / Pending Work

1. **✅ Background DONE + APPROVED** — `Background.tsx` = `ui/cursor-aura.tsx`: a STATIC starfield (fixed, invisible) **revealed only where the cursor light passes** + a soft toned-down 2D "ghost" glow trailing the cursor. Lightweight (one 2D canvas, halts when idle); globe pauses off-screen. This replaced the old WebGL ghost + tsParticles (removed for lag/version issues). `ui/ghost-cursor.tsx`, `ui/sparkles.tsx`, `ShaderLightning.tsx` are UNUSED legacy (kept for reference). Tuning props on `<CursorAura>`: glowRgb, sparkColors, density, revealRadius, additive.
2. **▶ NEXT — SCROLL-ANIMATION PASS, Phase 1 (the immediate task).** Approach = HYBRID: refined-&-smooth baseline everywhere (never busy — his core value) + cinematic set-pieces only where they earn it.
   - **Phase 1 (do first):** install **Lenis** (`npm install lenis`) for smooth scroll + unify the per-section reveals into ONE choreographed system (consistent easing/timing, staggered eyebrow→headline→body→media, mask/clip headline reveals). Sections currently have ad-hoc `whileInView` — make them consistent.
   - **Phase 2:** Selected Work scroll-scrub **clip/un-clip + parallax** (ref `G:\Claude Code\Motion (Inspiration)\Scroll Animation.txt` = Aceternity ContainerScroll → adapt `framer-motion`→`motion/react`), hero headline **parallax**, optional Contact **pinned** climax.
   - **Phase 3:** **count-up stats** (Based-in + Education), **scroll-velocity marquee**, thin **scroll-progress** cue (FS motif).
   - GUARDRAILS: transform/opacity only (PROTECT the smoothness — don't reintroduce lag), `prefers-reduced-motion` fallbacks, 1-2 focal animations/viewport, build phase-by-phase, verify smoothness, Fuad approves each phase. Lenis + motion `useScroll` play well together.
3. **Inner pages:** `/work/[slug]` case studies (links exist, pages don't → 404), `/about`, `/contact` routes.
4. **Polish:** consider cookie-based SSR theme (currently fine via external script).

---

## 6. Key Decisions (chronological highlights)

- Stack = Next.js + Tailwind + motion (chosen over Astro/plain HTML).
- Direction pivoted **dark → light-dominant + blue-10% accent**, then hero became an **immersive dark** moment; final hero = light/dark themed editorial.
- Hero copy tone: **confident, self-marketing**, not CV-speak. Name NOT emphasized in blue.
- **Unified background:** the interactive cursor effect spans the WHOLE page (one fixed layer), not just the hero.
- Selected Work: **editorial rows chosen**, but **all 3 layouts kept** as a permanent visitor view-switcher. Video thumbnails autoplay **only in view**. No "freelance" labels.
- Background evolved from neon-diagonal-lightning → **ghost cursor + sparkles** (Fuad found the lightning distracting). Blue.
- Sparkles: **custom canvas, not tsParticles** (dependency version conflicts).
- Globe square-frame fixed by **masking the canvas to a circle** (removing `preserve-3d` alone wasn't enough).
- Theme-init: **external `/theme-init.js`** (inline `<script>` triggers a React 19 dev warning).

The full blow-by-blow lives in Claude's memory file (see §11).

---

## 7. Folder Structure (project on C:)

```
C:\Users\foadx\fuad-portfolio\
├── AGENTS.md / CLAUDE.md      (Next-16 breaking-changes warning)
├── PROJECT_HANDOFF.md         (this file)
├── next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
├── package.json
├── public/
│   ├── fs-logo.svg, fs-logo-dark.svg   (FS monogram)
│   ├── theme-init.js                   (no-FOUC theme script)
│   └── work/                           (6 projects × .mp4 + .jpg poster)
└── src/
    ├── app/
    │   ├── layout.tsx   (fonts, ThemeProvider, Background, GlassFilter, theme Script, metadata)
    │   ├── page.tsx     (section order)
    │   ├── globals.css  (@theme tokens, .dark vars, text-gradient, @keyframes marquee, reduced-motion)
    │   └── icon.svg     (favicon = blue FS monogram)
    ├── lib/utils.ts     (cn helper)
    └── components/
        ├── Background.tsx      (fixed bg: base + Sparkles + GhostCursor)   ← CURRENT
        ├── ShaderLightning.tsx (OLD lightning bg — kept for revert, unused)
        ├── Navbar.tsx, Hero.tsx, BasedIn.tsx, SelectedWork.tsx,
        ├── Education.tsx, Marquee.tsx, Contact.tsx
        ├── Logo.tsx (inline FS monogram, currentColor/gradient prop)
        ├── theme.tsx, ThemeToggle.tsx
        └── ui/
            ├── ghost-cursor.tsx      (three.js cursor trail)
            ├── sparkles.tsx          (custom canvas particles)
            ├── interactive-globe.tsx (canvas globe, Amman/Dubai)
            ├── liquid-glass-button.tsx (LiquidButton: ink/glass/blue tones + GlassFilter)
            └── project-media.tsx     (in-view autoplay video / image / placeholder)
```

Source assets on G: `G:\Claude Code\{Fuad CV, MaktabiTech\web-optimized, Selected Works\{PricyPal,Triangle,Canvas Home}, Inspirations, Motion (Inspiration), Based In section (Inspo), design-system\MASTER.md}`.

---

## 8. Files Modified/Created (all under `src/` unless noted)
Created: every component listed in §7, `globals.css` (rewritten), `layout.tsx`, `page.tsx`, `icon.svg`, `public/theme-init.js`, `public/work/*`, `public/fs-logo*.svg`, `lib/utils.ts`. The starter `page.tsx`/`globals.css`/`layout.tsx` were fully replaced.

---

## 9. Known Issues / Gotchas

- **Slow-drive Turbopack stalls are GONE** (project on C:). If a change ever doesn't appear: stop server → delete `.next` → restart, and have Fuad hard-refresh.
- **Preview console buffer is rolling and does NOT clear on reload** — stale errors persist. Verify fixes by inspecting the DOM or `preview_logs` (server-side), not just `preview_console_logs`.
- **`preview_screenshot` resets scroll to ~current and timing is finicky;** scroll via `preview_eval` then screenshot. Synthetic `PointerEvent`s drive cursor effects but are too sparse to capture trails well — judge cursor effects with a real mouse.
- **Ghost cursor / sparkles / globe** skip on touch + `prefers-reduced-motion`.
- Don't re-add `transform-style: preserve-3d` to a single flat canvas (causes a faint square edge).
- Don't reinstall tsParticles (version conflicts). Don't import `framer-motion` (use `motion/react`).
- Footer/inner-page routes (`/work`, `/about`, `/contact`) are linked but not built yet → 404s.

---

## 10. Commands Used (reference)

```powershell
# PATH refresh (prefix for any node/npm/ffmpeg PowerShell call)
$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine")+";"+[Environment]::GetEnvironmentVariable("Path","User")

# install deps (already done)
npm install motion clsx tailwind-merge three; npm install -D @types/three
# (tsParticles was installed then UNINSTALLED — do not reinstall)

# optimize a project video → public/work (example pattern, ffmpeg)
ffmpeg -y -i "IN.mp4" -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -vf "scale=1280:-2" -movflags +faststart "OUT.mp4"
ffmpeg -y -ss 00:00:03 -i "IN.mp4" -frames:v 1 -vf "scale=1280:-2" -q:v 3 "OUT.jpg"

# clean restart when needed
#  preview_stop → Remove-Item C:\Users\foadx\fuad-portfolio\.next -Recurse -Force → preview_start
```

Dev server is launched via the **Claude_Preview MCP** (`preview_start name="fuad-portfolio"`), NOT raw `npm run dev` in a tool (PATH issues). Port 3000.

---

## 11. How to Continue Seamlessly

1. Read this file + Claude's memory: `C:\Users\foadx\.claude\projects\G--Claude-Code\memory\project-portfolio-rebuild.md` (detailed, chronological) and `user-fuad-salma.md`.
2. **Always edit code on `C:\Users\foadx\fuad-portfolio`.** User assets are on `G:\Claude Code`.
3. Start preview: `preview_start` name `fuad-portfolio` (port 3000). Verify with `preview_eval` (DOM checks) + `preview_screenshot`; check errors with `preview_logs level:error`.
4. **Workflow preference:** Fuad likes to **brainstorm options before building**, iterate visually, and **approve before big changes**. Show him live results; he's very particular about motion/visual details. Get approval before running commands.
5. **Immediate next:** get his verdict on the ghost+sparkles intensity, then start the **scroll-animation pass** (Lenis + cinematic Selected-Work scroll-clip + choreographed reveals), then build `/work/[slug]` + `/about` + `/contact` pages.
6. Design source of truth: `G:\Claude Code\design-system\MASTER.md` (note: it predates some pivots — this handoff + memory are more current).
```
Blue: #1D4ED8 / #3B82F6 / #60A5FA. Ink ~#0A0B0D. Fonts Archivo + Space Grotesk. cn() for classes.
```
