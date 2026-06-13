import { ImageResponse } from "next/og";

export const alt = "Fuad Salma — Multidisciplinary Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(130% 130% at 50% 0%, #0c1430 0%, #08090d 60%)",
          color: "#f4f6fb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#9aa1b2",
          }}
        >
          Multidisciplinary Designer
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: -4,
            }}
          >
            CREATIVITY
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: -4,
              backgroundImage: "linear-gradient(120deg,#1d4ed8,#3b82f6,#60a5fa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ENGINEERED.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 30,
          }}
        >
          <div style={{ display: "flex", fontWeight: 700 }}>Fuad Salma</div>
          <div style={{ display: "flex", color: "#9aa1b2", fontSize: 24 }}>
            Amman · Dubai
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
