import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WarungKu AI - Konten Promosi UMKM",
  description: "Platform AI untuk membantu UMKM Indonesia membuat konten promosi profesional. Generate gambar, caption, dan carousel untuk sosial media dalam hitungan detik.",
  keywords: ["UMKM", "promosi", "konten", "generator", "Instagram", "TikTok", "social media", "UMKM Indonesia", "bisnis lokal"],
  authors: [{ name: "WarungKu Team" }],
  openGraph: {
    title: "WarungKu AI - Konten Promosi UMKM",
    description: "Platform AI untuk membantu UMKM Indonesia membuat konten promosi profesional",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%235A1E2A'/><text x='50' y='65' font-size='50' text-anchor='middle' fill='white'>W</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
