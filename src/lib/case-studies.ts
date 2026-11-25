/**
 * Case-study write-ups, shown under the full-screen video when a project is
 * opened from the work sphere. Keyed by project slug (see projects.ts).
 *
 * To write one: add an entry with your own sections. Anything without an
 * entry shows the draft outline below so the layout is visible meanwhile.
 */

export type CaseSection = { label: string; body: string };

export type CaseStudy = {
  /** One-line hook under the title. */
  summary?: string;
  /** Show the project's imagery right under the title, before the write-up. */
  mediaFirst?: boolean;
  sections: CaseSection[];
};

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "biggest-boardroom": {
    summary:
      "A teaser reel that reveals a landmark government boardroom, one piece of tech at a time.",
    sections: [
      {
        label: "Overview",
        body: "MaktabiTech is delivering a large-scale boardroom for a government entity in Saudi Arabia. The brief came from internal marketing: announce the project with a reveal moment that makes people stop scrolling.",
      },
      {
        label: "The idea",
        body: "Treat the reveal like a prize. The reel opens on a claw machine packed with the room's real technology (PTZ cameras, LED displays) and the claw picks them out before the real boardroom is revealed: \"Saudi's next landmark boardroom is now in motion.\"",
      },
      {
        label: "Craft & process",
        body: "My part was bringing the concept to screen. The claw-machine scenes are AI-generated: no stock footage, no downloaded 3D models. The reveal is the project's actual render of the boardroom, so the payoff is the real room, not an AI impression of it. I set the machine's colour mix (green, black and white) to match MaktabiTech's identity, so the scene reads as the brand at first glance. I built the frames in Higgsfield with Nano Banana Pro and GPT Image, animated them with Kling 3.0, and edited the final cut.",
      },
    ],
  },
  "tesla-trend": {
    summary:
      "A same-week trend reel with a wink: if cars can fly, why not meeting rooms?",
    sections: [
      {
        label: "Overview",
        body: "When the flying-car moment took over feeds, there was no formal brief, just a short window. The goal was to join the conversation while it was hot, with a playful nod to one of MaktabiTech's services: meeting rooms.",
      },
      {
        label: "The idea",
        body: "Shaped in a quick discussion with the marketing team and played for laughs: instead of a flying car, a flying meeting room. A fictional glass meeting room lifts off a lobby floor on its own thrusters, echoing the clip everyone was sharing. The humour carries the service, not a sales pitch.",
      },
      {
        label: "Craft & process",
        body: "I started the key frames in GPT Image, refined the meeting room and its environment with Nano Banana Pro, enhanced the details in Photoshop, then animated the take-off with Kling 3.0.",
      },
    ],
  },
  "smart-workplace": {
    summary:
      "A LinkedIn film for MaktabiTech's smart meeting rooms: what if the room set itself up?",
    sections: [
      {
        label: "Overview",
        body: "Part of MaktabiTech's Smart Workplace Solutions content on LinkedIn. The purpose was to explain the solution through the experience of the person in the room. Instead of listing AV, control and collaboration hardware, the film shows what it feels like to walk into a smart meeting room where everything simply works, so viewers can picture themselves in it.",
      },
      {
        label: "The idea",
        body: "The script, written by the team's copywriter, hangs on one hook: \"What if your meeting room sets itself up?\" An empty meeting room wakes up on its own (lights, screen, camera), then fills with people in the room and on screen while the technology fades out of view. \"Technology in the background. People in the front.\"",
      },
      {
        label: "Craft & process",
        body: "I led the creative direction and produced the film through an AI workflow. The room is real: a Saudi government meeting room MaktabiTech delivered. Using it as the reference, I rebuilt the space as close-to-real scenes with GPT Image and Nano Banana Pro to storyboard every shot, animated each scene with Kling 3.0, then cut them together in After Effects so the shots read as one continuous story. The voiceover was made in ElevenLabs and the music sourced from Pixabay.",
      },
    ],
  },
  "smartphone-talk-back": {
    summary:
      "A POV film for auditoriums: every seat gets a voice, straight from the attendee's phone.",
    sections: [
      {
        label: "Overview",
        body: "In a packed hall, speaking up has always meant a raised hand and a microphone passed down the rows. MaktabiTech integrates a system where attendees connect by QR code, then talk and vote from their own phones. The film had to show decision makers that experience, and position MaktabiTech as the integrator that designs the whole hall, from the stage to the last row.",
      },
      {
        label: "The idea",
        body: "We see the event through one attendee's eyes. He scans in at the door, sits in the very last row, taps \"Press to talk\", and the whole hall hears him. Then a live poll: one tap, and the results fill the big screen. No raised hands, no mic passed across rows.",
      },
      {
        label: "Craft & process",
        body: "I created visuals that align with the brief and speak to its message, using the same AI workflow as the Smart Workplace film: scenes built with GPT Image and Nano Banana Pro, animated with Kling 4.0, and cut together in After Effects. Everything stays in POV (his hands, his phone, what he sees) with quick hard cuts, and the voiceover was made in ElevenLabs. The phone screens were designed in-house, with no app or partner branding.",
      },
    ],
  },
  "command-center": {
    summary:
      "An illustrated motion film about long shifts in the control room, and the console built to keep operators sharp.",
    sections: [
      {
        label: "Overview",
        body: "Command-centre operators sit at their consoles for long hours, and fatigue wears down focus and response time. The motion-graphics video had to present MaktabiTech's command console through what it does for the person using it, as clear benefits rather than a spec sheet.",
      },
      {
        label: "The idea",
        body: "Tell it through one operator's shift. He starts at an ordinary desk, then the scene turns into MaktabiTech's console: it rises so he can stand, switches between each shift's operator, links to the LED video wall, and lights its edge to flag an alert. It closes on the full control room and three benefits: focused operators, faster response, operational reliability.",
      },
      {
        label: "Craft & process",
        body: "I took it in an illustration motion-graphics direction: a clean, isometric world in MaktabiTech's green and white, where each feature gets its own short, readable moment instead of a crowded explainer. The console isn't invented. It's a real console MaktabiTech offers, re-illustrated with GPT Image. I guided the generations with references from my own earlier illustration work and prompts written to match them, which kept the style consistent and the turnaround quick. I animated the scenes with Kling 4.0, built the motion graphics and final edit in After Effects, and made the voiceover in ElevenLabs.",
      },
    ],
  },
  "smart-parking": {
    summary:
      "A looping animation that shows, in seconds, how smart parking finds you a free space.",
    sections: [
      {
        label: "Overview",
        body: "People arriving at an office building lose time circling for a space. MaktabiTech's smart parking shows live availability, floor by floor, through an app for the people using the building and for the building itself. It isn't a booking system, just a clear view of what's free. The piece had to make that service easy to picture at a glance.",
      },
      {
        label: "The idea",
        body: "Open on the problem: \"Your parking lot isn't full. It's untracked.\" Then into a phone, where the app's floor map shows taken bays in red and free ones in green, and a car pulls into an open spot. It closes on the benefits: track occupancy, understand demand, use spaces better.",
      },
      {
        label: "Craft & process",
        body: "I made it in GIF format. The imagery and illustration were generated with GPT Image, guided by references I gathered, and the car's movement, the most detailed part, was animated with Kling 3.0. I brought it all together and finished it in After Effects.",
      },
    ],
  },
  "eid-mascot": {
    summary:
      "An Eid al-Fitr greeting that welcomes MaktabiTech's robot mascot into Saudi hospitality.",
    sections: [
      {
        label: "Overview",
        body: "A greeting for Eid al-Fitr, at the end of Ramadan. It centres on Saudi and Gulf hospitality, offering dates and Arabic coffee, and pairs it with MaktabiTech's robot mascot to keep the message warm, light and fun.",
      },
      {
        label: "The idea",
        body: "The concept came from the team: MaktabiTech's existing, approved robot mascot steps into the tradition. Dressed in a thobe and shemagh, it pours Arabic coffee beside a table of dates under an \"Eid Mubarak\" greeting, bringing the brand closer to Saudi culture.",
      },
      {
        label: "Craft & process",
        body: "My part was the craft. I created the imagery and frames with Nano Banana Pro, placing the mascot in a Saudi setting, and animated them with Kling 3.0. In After Effects I added the background and typography and set the composition and position of the mascot's animation.",
      },
    ],
  },
  triangle: {
    summary:
      "A bold identity for a Jordanian pizza spot that sells by the slice, made for young, social-first crowds.",
    mediaFirst: true,
    sections: [
      {
        label: "Overview",
        body: "Triangle is a new restaurant in Jordan serving pizza by the slice, each slice with its own flavour. There was no formal brief, so I started by asking the client about the audience and the voice. The answers set the direction: young, trendy, social-media-first people, and a tone that's bold and grabs attention.",
      },
      {
        label: "The idea",
        body: "The name is the idea: a slice is a triangle. A single bold slice shape stands in for the A in the wordmark, set in Microgramma Extended Bold on a strong red and white palette. It carries across every touchpoint, from the triangular slice box to the menu, signage, merch and Instagram, with the menu playing along through slices like Acute Margherita and Pythagorean BBQ.",
      },
      {
        label: "Craft & process",
        body: "I designed the logo and identity system in Illustrator and Photoshop, then brought the logo and brand to life in motion in After Effects. Some of the imagery was generated with Google Imagen 3 and art-directed to match the identity.",
      },
    ],
  },
  // "another-slug": {
  //   summary: "…",
  //   sections: [
  //     { label: "Overview", body: "…" },
  //     { label: "The idea", body: "…" },
  //     { label: "Craft & process", body: "…" },
  //   ],
  // },
};

/** Draft outline — guidance for what each section should cover. */
export const DRAFT_SECTIONS: CaseSection[] = [
  { label: "Overview", body: "What the brief was, who it was for, and why it mattered." },
  { label: "The idea", body: "The creative concept, and how it answers the brief." },
  { label: "Craft & process", body: "How it was made: tools, the AI workflow, key iterations." },
];

export function getCaseStudy(slug: string): { study: CaseStudy; draft: boolean } {
  const study = CASE_STUDIES[slug];
  return study ? { study, draft: false } : { study: { sections: DRAFT_SECTIONS }, draft: true };
}
