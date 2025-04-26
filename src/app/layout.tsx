import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Correct import path for sans-serif
import { GeistMono } from 'geist/font/mono'; // Correct import path for mono
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header'; // Keep Header import if used site-wide
import ThreeBackground from '@/components/three-background';
import './globals.css';

// The imported GeistSans and GeistMono objects contain the necessary config like variable names.
// No need to call them as functions here.

export const metadata: Metadata = {
  title: { // Allow individual pages to set their own title
    template: '%s | Tailwind Layout Preview',
    default: 'Tailwind Layout Preview',
  },
  description: 'Preview Tailwind CSS layouts and copy the code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font variables directly from the imported objects
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        // Use Tailwind's font-sans utility, CSS variables from html tag handle the specific font
        className={`antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThreeBackground /> {/* Background for all pages */}
          <div className="relative z-10 flex min-h-screen flex-col">
             {/* Header is rendered here so it's present on all pages derived from this layout */}
            <Header />
            {/* main tag is now part of individual page layouts or the landing page */}
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
