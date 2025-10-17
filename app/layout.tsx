import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// Primary font for body text - Inter is clean and highly readable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display font for headings - Space Grotesk has a modern, sporty feel
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
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
