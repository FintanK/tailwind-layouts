'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Check, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';

interface LayoutPreviewProps {
  initialContent: string;
  initialLayoutName: string;
}

// Function to generate iframe content. Now takes theme as an argument.
const generateIframeContent = (htmlContent: string, theme: 'light' | 'dark' | 'system' | undefined) => {
  const effectiveTheme = theme === 'system' ? 'light' : theme || 'light'; // Default to light if undefined or system (can refine system detection later if needed)
  const strippedContent = htmlContent.replace(/<!--.*?-->/gs, ''); // Strip comments before injecting

  return `
    <!DOCTYPE html>
    <html lang="en" class="${effectiveTheme}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp,container-queries"></script>
      <script>
        // Minimal script to apply dark class based on the html tag
        tailwind.config = {
          darkMode: 'class',
          theme: {
             extend: {
                 colors: {
                    // Define HSL colors using CSS variables inherited from parent scope if needed,
                    // but primarily rely on Tailwind's dark: variant driven by the html class.
                    // This example assumes base Tailwind colors work well with the dark class.
                    // You could inject parent CSS variables here if needed, but it's complex.
                    border: 'hsl(var(--border))',
                    input: 'hsl(var(--input))',
                    ring: 'hsl(var(--ring))',
                    background: 'hsl(var(--background))',
                    foreground: 'hsl(var(--foreground))',
                    primary: {
                      DEFAULT: 'hsl(var(--primary))',
                      foreground: 'hsl(var(--primary-foreground))',
                    },
                    secondary: {
                      DEFAULT: 'hsl(var(--secondary))',
                      foreground: 'hsl(var(--secondary-foreground))',
                    },
                    destructive: {
                      DEFAULT: 'hsl(var(--destructive))',
                      foreground: 'hsl(var(--destructive-foreground))',
                    },
                    muted: {
                      DEFAULT: 'hsl(var(--muted))',
                      foreground: 'hsl(var(--muted-foreground))',
                    },
                    accent: {
                      DEFAULT: 'hsl(var(--accent))',
                      foreground: 'hsl(var(--accent-foreground))',
                    },
                    popover: {
                      DEFAULT: 'hsl(var(--popover))',
                      foreground: 'hsl(var(--popover-foreground))',
                    },
                    card: {
                      DEFAULT: 'hsl(var(--card))',
                      foreground: 'hsl(var(--card-foreground))',
                    },
                 }
               }
          }
        }
      </script>
       <style>
        /* Basic styles for preview isolation and theme */
         :root {
            /* Define HSL colors directly for Tailwind JIT - copy from globals.css */
             --background: 210 20% 98%; /* light */
             --foreground: 215 28% 17%;
             --card: 0 0% 100%;
             --card-foreground: 215 28% 17%;
             --popover: 0 0% 100%;
             --popover-foreground: 215 28% 17%;
             --primary: 168 76% 42%;
             --primary-foreground: 180 100% 98%;
             --secondary: 210 31% 91%;
             --secondary-foreground: 215 28% 17%;
             --muted: 210 31% 91%;
             --muted-foreground: 217 19% 47%;
             --accent: 25 95% 53%;
             --accent-foreground: 0 0% 100%;
             --destructive: 0 84% 60%;
             --destructive-foreground: 0 0% 100%;
             --border: 215 25% 88%;
             --input: 215 25% 88%;
             --ring: 168 76% 42%;
             --radius: 0.5rem;
         }
         .dark {
            --background: 220 13% 18%; /* dark */
            --foreground: 210 20% 98%;
            --card: 224 14% 14%;
            --card-foreground: 210 20% 98%;
            --popover: 224 14% 14%;
            --popover-foreground: 210 20% 98%;
            --primary: 168 76% 42%;
            --primary-foreground: 180 100% 98%;
            --secondary: 217 19% 27%;
            --secondary-foreground: 210 20% 98%;
            --muted: 217 19% 27%;
            --muted-foreground: 216 15% 65%;
            --accent: 25 95% 53%;
            --accent-foreground: 0 0% 100%;
            --destructive: 0 72% 51%;
            --destructive-foreground: 0 0% 100%;
            --border: 217 19% 27%;
            --input: 217 19% 27%;
            --ring: 168 76% 42%;
         }
         body {
            margin: 0;
            padding: 1rem; /* Add padding for better visibility */
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            font-family: sans-serif; /* Basic font */
            min-height: 100%; /* Ensure body takes minimum height */
            box-sizing: border-box;
        }
        /* Ensure links look reasonable */
        a { color: hsl(var(--primary)); }
        a:hover { text-decoration: underline; }
       </style>
    </head>
    <body class="antialiased">
      ${strippedContent}
    </body>
    </html>
  `;
};


export default function LayoutPreview({ initialContent, initialLayoutName }: LayoutPreviewProps) {
  const [layoutContent, setLayoutContent] = useState(initialContent);
  const [layoutName, setLayoutName] = useState(initialLayoutName);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme(); // Use resolvedTheme
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');

  const stripHtmlComments = (html: string) => {
    return html.replace(/<!--.*?-->/gs, '');
  };

  const copyToClipboard = async () => {
     // Ensure layoutContent is up-to-date before copying
    const currentLayout = layoutContent; // Read from state directly
    if (!currentLayout || currentLayout.startsWith('<p class="p-4 text-destructive">')) {
        toast({ title: 'Nothing to copy', description: 'Load a valid layout first.', variant: 'destructive' });
        return;
    }
    const contentToCopy = stripHtmlComments(currentLayout);
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Layout HTML copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: 'Error',
        description: 'Failed to copy layout HTML.',
        variant: 'destructive',
      });
    }
  };

  const fetchAndSetLayout = useCallback(async (name: string) => {
    setIsLoading(true);
    setLayoutName(name);
    setLayoutContent(''); // Clear previous content immediately
    setIframeSrcDoc(''); // Clear iframe immediately
    try {
      const response = await fetch(`/api/layout/${encodeURIComponent(name)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
        throw new Error(errorData.error || `Failed to fetch layout: ${response.statusText}`);
      }
      const data = await response.json();
      // Update layoutContent state - the useEffect watching this will update the iframe
      setLayoutContent(data.content);
    } catch (error: any) {
      console.error('Failed to fetch layout:', error);
      const errorMessage = `<p class="p-4 text-destructive">Error loading layout: ${error.message || 'Unknown error'}</p>`;
      setLayoutContent(errorMessage); // Set error message in state
      toast({
        title: 'Error',
        description: error.message || 'Failed to load layout content.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Removed layoutContent dependency

  // Handle clicks on layout selector buttons (Client-side only)
  useEffect(() => {
    const handleLayoutSelection = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.layout-selector-button');
      if (button instanceof HTMLButtonElement) {
        const name = button.dataset.layoutName;
         // Check name exists and is different from the current layout name
         if (name && name !== layoutNameRef.current) { // Use ref for current name check
          layoutNameRef.current = name; // Update ref immediately
          fetchAndSetLayout(name);
           // Update active state visually
           document.querySelectorAll('.layout-selector-button').forEach(btn => btn.removeAttribute('data-active'));
           button.setAttribute('data-active', 'true');
        }
      }
    };

    // Use event delegation on the sidebar content area
    const sidebarContentElement = document.querySelector('[data-sidebar="content"]');
    sidebarContentElement?.addEventListener('click', handleLayoutSelection);

     // Ref to track current layout name to prevent redundant fetches from rapid clicks
     const layoutNameRef = { current: initialLayoutName };

     // Set initial active state
    const initialButton = document.querySelector(`.layout-selector-button[data-layout-name="${initialLayoutName}"]`);
    initialButton?.setAttribute('data-active', 'true');


    return () => {
      sidebarContentElement?.removeEventListener('click', handleLayoutSelection);
    };
    // initialLayoutName ensures the initial active state is set correctly on mount
    // fetchAndSetLayout is stable due to useCallback
  }, [fetchAndSetLayout, initialLayoutName]);


  // Effect to update iframe srcDoc when layoutContent or theme changes (Client-side only)
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
       const newSrcDoc = generateIframeContent(layoutContent, resolvedTheme as 'light' | 'dark');
       setIframeSrcDoc(newSrcDoc); // Update state, which triggers iframe update
    }
  }, [layoutContent, resolvedTheme]);


  return (
    // Increased height using h-screen and subtracting header height (approx h-14) + padding (p-4/p-6)
    <div ref={containerRef} className="flex h-[calc(100vh-theme(spacing.14)-2rem)] flex-col p-4 md:p-6 md:h-[calc(100vh-theme(spacing.14)-3rem)]">
      <Card className="flex flex-1 flex-col overflow-hidden"> {/* Ensure card flexes and handles overflow */}
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6 flex-shrink-0"> {/* Prevent header from shrinking */}
          <div>
             <CardTitle className="text-lg">{layoutName || 'Select a Layout'}</CardTitle>
             <CardDescription>Preview of the selected layout</CardDescription>
          </div>

          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={isLoading || !layoutContent || layoutContent.startsWith('<p class="p-4 text-destructive">')} aria-label="Copy HTML code">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Copy Code</span>
          </Button>
        </CardHeader>
        {/* Removed padding from CardContent, iframe container takes full space */}
        <CardContent className="flex-1 p-0 overflow-auto"> {/* Allow content to scroll if needed */}
           {/* Container for iframe ensures it takes full height */}
           <div className="h-full w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading layout...</span>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="Layout Preview"
                className="h-full w-full border-0" // Removed bg-background, let iframe body handle it
                sandbox="allow-scripts allow-same-origin"
                srcDoc={iframeSrcDoc} // Set srcDoc from state
              />
            )}
         </div>
        </CardContent>
      </Card>
    </div>
  );
}

    