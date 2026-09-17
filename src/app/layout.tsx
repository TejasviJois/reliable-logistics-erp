import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Sans } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { AppToaster } from "@/components/app-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Reliable Logistics Solutions — Operations Control",
  description:
    "Enterprise logistics & transport management platform by Reliable Logistics Solutions Pvt. Ltd.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e31e24",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${plex.variable} antialiased`}>
        <TooltipProvider delayDuration={200}>
          <AppShell>{children}</AppShell>
          <AppToaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
