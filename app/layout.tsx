// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/src/context/AuthContext";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Toaster } from "@/src/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

// Placeholder providers
function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export const metadata = {
  title: "VaultString",
  description: "Cross border payment and wallet system",
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/icons/favicon.svg",
    apple: "/icons/favicon.svg",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const messages = await getMessages();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProviders>{children}</AppProviders>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}