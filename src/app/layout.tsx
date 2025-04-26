import type { Metadata } from 'next';
import { GeistSans, GeistMono } from 'geist/font'; // Corrected import name
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header'; // Keep Header import if used site-wide
import ThreeBackground from '@/components/three-background';
import './globals.css';

// Initialize the fonts by calling the imported functions
const geistSans = GeistSans({ // Use corrected name here
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({ // Use corrected name here
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    // Apply the font variables to the html tag
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}> {/* Use corrected name here */}
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
