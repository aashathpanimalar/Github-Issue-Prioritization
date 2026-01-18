import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IssuePrioritizer | AI-Powered GitHub Issue Analysis",
  description: "Prioritize your GitHub issues using advanced machine learning and automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-white min-h-screen`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
        <Chatbot />
      </body>
    </html>
  );
}
