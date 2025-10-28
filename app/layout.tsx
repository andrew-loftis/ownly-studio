import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthEffect from "@/components/AuthEffect";
import AuthModal from "@/components/AuthModal";
import RouteTransition from "@/components/RouteTransition";
import ThemeBackdrop from "@/components/ThemeBackdrop";
import MobileTabBar from "@/components/layout/MobileTabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ownly.studio'),
  title: "Ownly Studio — All your digital, one place.",
  description:
    "Web, apps, AI, automations, and payments—unified under one subscription. Cinematic design. Serious engineering.",
  openGraph: {
    title: "Ownly Studio — All your digital, one place.",
    description:
      "Web, apps, AI, automations, and payments—unified under one subscription. Cinematic design. Serious engineering.",
    url: "https://ownly.studio",
    siteName: "Ownly Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ownly Studio OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ownly Studio — All your digital, one place.",
    description:
      "Web, apps, AI, automations, and payments—unified under one subscription. Cinematic design. Serious engineering.",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href="https://ownly.studio" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Skip link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <AuthEffect />
        <AuthModal />
        <Header />
        {/* Global liquid glass + dotted grid backdrop */}
        <ThemeBackdrop />
        <RouteTransition>
          <main id="main-content" className="sm:pb-0 pb-20">
            {children}
          </main>
        </RouteTransition>
        <MobileTabBar />
        <Footer />
      </body>
    </html>
  );
}
