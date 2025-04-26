import React from 'react';
import Link from 'next/link';
import { DarkModeToggle } from './dark-mode-toggle';
import { Code, Home, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
           <Code className="h-6 w-6 text-primary" />
           <span className="hidden sm:inline text-lg font-semibold">Tailwind Layout Preview</span>
        </Link>
        <nav className="flex items-center gap-2">
           <Button variant="ghost" size="sm" asChild>
             <Link href="/">
                <Home className="h-4 w-4 mr-1" /> Home
             </Link>
           </Button>
            <Button variant="ghost" size="sm" asChild>
             <Link href="/preview">
                <Eye className="h-4 w-4 mr-1" /> Preview Layouts
             </Link>
           </Button>
            <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}