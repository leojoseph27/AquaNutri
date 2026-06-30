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
  title: "AQUANUTRI — AI Skin Deficiency Detection & Sustainable Fish Nutrition",
  description:
    "AI-powered mobile platform that detects nutritional deficiencies from skin images using a fine-tuned ResNet50 CNN and recommends nutrient-rich, locally-suitable fish species for sustainable terrace aquaculture.",
  keywords: [
    "AQUANUTRI",
    "nutritional deficiency detection",
    "ResNet50",
    "DermNet",
    "skin image analysis",
    "sustainable aquaculture",
    "terrace fish farming",
    "mobile health",
    "precision nutrition",
  ],
  authors: [{ name: "AQUANUTRI Team" }],
  icons: {
    icon: "/aquanutri-icon.svg",
  },
  openGraph: {
    title: "AQUANUTRI — AI Skin Deficiency Detection & Sustainable Fish Nutrition",
    description:
      "Detect nutritional deficiencies from a skin image and get personalized fish-based dietary recommendations.",
    siteName: "AQUANUTRI",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
