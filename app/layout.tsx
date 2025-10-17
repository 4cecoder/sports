import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Fastbreak Event Dashboard | Sports Event Management",
    template: "%s | Fastbreak Event Dashboard",
  },
  description:
    "Manage your sports events with ease. Create, view, edit, and organize sports events with comprehensive venue information. Import events from ESPN and track your schedule.",
  keywords: [
    "sports events",
    "event management",
    "sports scheduling",
    "venue management",
    "ESPN integration",
    "basketball events",
    "football events",
    "baseball events",
    "hockey events",
  ],
  authors: [{ name: "Fastbreak" }],
  creator: "Fastbreak",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "Fastbreak Event Dashboard | Sports Event Management",
    description:
      "Manage your sports events with ease. Create, view, edit, and organize events with venue information.",
    siteName: "Fastbreak Event Dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastbreak Event Dashboard",
    description:
      "Manage your sports events with ease. Create, view, edit, and organize events with venue information.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
