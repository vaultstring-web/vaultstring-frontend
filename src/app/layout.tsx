// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/src/context/AuthContext";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Toaster } from "@/src/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import DashboardLayoutWrapper from "@/src/components/shared/DashboardLayoutWrapper";

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
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProviders>
              <DashboardLayoutWrapper>
                {children}
              </DashboardLayoutWrapper>
            </AppProviders>
            <Toaster />
            <Sonner position="top-right" expand={true} richColors />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
