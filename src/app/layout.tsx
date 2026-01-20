import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Newsreader } from "next/font/google";
import { AppProviders } from "@/shared/providers";
import "@/shared/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Legal Case Workspace",
  description: "A comprehensive legal case management workspace built with Next.js and FSD architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${newsreader.variable} antialiased h-full`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}