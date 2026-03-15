import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoiceIDO — OCR, Analyze, Transcribe, Video",
  description: "Business-oriented media-to-text pipeline",
  icons: {
    icon: "/logo-color.png",
    apple: "/logo-color.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} antialiased min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
