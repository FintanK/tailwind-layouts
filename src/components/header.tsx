import React from 'react';
import { DarkModeToggle } from './dark-mode-toggle';
import { Code } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
           <Code className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Tailwind Layout Preview</span>
        </div>
        <DarkModeToggle />
      </div>
    </header>
  );
}
