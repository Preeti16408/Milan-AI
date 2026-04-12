import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { NuqsAdapter } from "nuqs/adapters/next";


import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Milan.AI",
  description: "An AI meeting assistant that helps you manage and summarize your meetings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
      <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
    </TRPCReactProvider>
    </NuqsAdapter>
    
    
  );
}
