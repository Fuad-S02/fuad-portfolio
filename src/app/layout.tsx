import type { Metadata } from "next";
import { Archivo, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GlassFilter } from "@/components/ui/liquid-glass-button";
import { ThemeProvider } from "@/components/theme";
import { Background } from "@/components/Background";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { WorkSheet } from "@/components/WorkSheet";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Body + label font — a clean, neutral grotesk.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-ink">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <GlassFilter />
        <ThemeProvider>
          <SmoothScroll>
            <Background />
            <Navbar />
            <WorkSheet />
            {children}
          </SmoothScroll>
          <LoadingScreen />
        </ThemeProvider>
      </body>
    </html>
  );
}
