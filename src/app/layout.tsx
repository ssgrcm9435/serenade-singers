import FloatingAIMascot from "@/components/FloatingAIMascot";
import Analytics from "@/components/Analytics";
import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Serenade Singers",
  description: "Modern premium choir and music community website.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <Analytics />
        {children}
        <Footer />
        <CookieBanner />
        <FloatingAIMascot />
      </body>
    </html>
  );
}
