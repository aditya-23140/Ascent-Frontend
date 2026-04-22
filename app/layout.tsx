import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { SocketProvider } from "@/components/SocketProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ascent - Productivity & Focus",
  description: "Modern productivity app with focus timer and task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white dark:bg-slate-950">
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
          }}
        >
          <SocketProvider>
            {children}
          </SocketProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
