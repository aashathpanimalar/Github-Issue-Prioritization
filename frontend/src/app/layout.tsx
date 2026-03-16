import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "@/lib/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Hub | AI-Powered Repository Intelligence",
  description: "Visualize branches, analyze PRs, track contributors and manage your full GitHub workflow in one beautiful platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-themed text-themed min-h-screen font-jakarta`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-20">
            {children}
          </main>
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
