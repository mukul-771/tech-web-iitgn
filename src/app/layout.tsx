import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Technical Council - IIT Gandhinagar",
  description: "Official website of the Technical Council, IIT Gandhinagar. Explore our clubs, read Torque magazine, and discover our achievements.",
  keywords: ["IIT Gandhinagar", "Technical Council", "Torque Magazine", "Tech Clubs", "Innovation"],
  authors: [{ name: "Technical Council, IITGN" }],
  icons: {
    icon: [
      { url: "/tech-logo-dark.svg", type: "image/svg+xml" }
    ],
    apple: "/tech-logo-dark.svg",
  },
  openGraph: {
    title: "Technical Council - IIT Gandhinagar",
    description: "Official website of the Technical Council, IIT Gandhinagar",
    type: "website",
    images: [{ url: "/tech-logo-dark.svg" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <ConditionalLayout>{children}</ConditionalLayout>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
