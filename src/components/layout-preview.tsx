'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Check } from 'lucide-react';
import { getLayoutContent } from '@/lib/layouts'; // Assuming this function can be used client-side or use server action

interface LayoutPreviewProps {
  initialContent: string;
  initialLayoutName: string;
}

export default function LayoutPreview({ initialContent, initialLayoutName }: LayoutPreviewProps) {
  const [layoutContent, setLayoutContent] = useState(initialContent);
  const [layoutName, setLayoutName] = useState(initialLayoutName);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stripHtmlComments = (html: string) => {
    return html.replace(/<!--.*?-->/gs, '');
  };

  const copyToClipboard = async () => {
    const contentToCopy = stripHtmlComments(layoutContent);
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
    try {
      // Ideally, use a Server Action here if getLayoutContent needs server access
      const content = await getLayoutContent(name);
      setLayoutContent(content);
    } catch (error) {
      console.error('Failed to fetch layout:', error);
      toast({
        title: 'Error',
        description: 'Failed to load layout content.',
        variant: 'destructive',
      });
      setLayoutContent('<p>Error loading layout.</p>');
    } finally {
      setIsLoading(false);
      // Force iframe reload
      if (iframeRef.current) {
          iframeRef.current.srcdoc = ' '; // Clear first
          setTimeout(() => {
             if (iframeRef.current) {
                iframeRef.current.srcdoc = generateIframeContent('');
             }
          }, 0); // Set in next tick
      }
    }
  }, [toast]);

  // Handle clicks on layout selector buttons
  useEffect(() => {
    const handleLayoutSelection = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.layout-selector-button');
      if (button instanceof HTMLButtonElement) {
        const name = button.dataset.layoutName;
        if (name) {
          fetchAndSetLayout(name);
           // Update active state visually
           document.querySelectorAll('.layout-selector-button').forEach(btn => btn.removeAttribute('data-active'));
           button.setAttribute('data-active', 'true');
        }
      }
    };

    // Use event delegation on a parent container if possible
    const sidebarContent = document.querySelector('[data-sidebar="content"]');
    sidebarContent?.addEventListener('click', handleLayoutSelection);

    // Set initial active state
    const initialButton = document.querySelector(`.layout-selector-button[data-layout-name="${initialLayoutName}"]`);
    initialButton?.setAttribute('data-active', 'true');


    return () => {
      sidebarContent?.removeEventListener('click', handleLayoutSelection);
    };
  }, [fetchAndSetLayout, initialLayoutName]);

  // Generate iframe content including Tailwind CDN and theme handling
 const generateIframeContent = (htmlContent: string) => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    return `
      <!DOCTYPE html>
      <html lang="en" class="${theme}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp,container-queries"></script>
        <script>
          tailwind.config = {
             darkMode: 'class', // Use class strategy
             theme: {
               extend: {
                 colors: {
                   primary: { DEFAULT: '#0d9488', foreground: '#f0fdfa' }, // teal-600
                   secondary: { DEFAULT: '#e5e7eb', foreground: '#111827' }, // coolGray-200
                   accent: { DEFAULT: '#f97316', foreground: '#ffffff' }, // orange-500
                   // Add other theme colors if needed by layouts
                 }
               }
             }
          }

           // Observer to sync theme changes
           const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target as HTMLElement;
                const isDark = targetElement.classList.contains('dark');
                document.documentElement.classList.toggle('dark', isDark);
              }
            }
          });

          // Observe the parent document's root element for class changes
           observer.observe(window.parent.document.documentElement, { attributes: true });

           // Initial theme sync
           document.documentElement.classList.toggle('dark', window.parent.document.documentElement.classList.contains('dark'));

        </script>
         <style>
            body { margin: 0; padding: 1rem; background-color: transparent; }
            /* Add any base styles needed for previews */
         </style>
      </head>
      <body class="bg-background text-foreground antialiased">
        ${stripHtmlComments(htmlContent)}
      </body>
      </html>
    `;
  };

   // Update iframe when layoutContent changes or theme changes
  useEffect(() => {
    if (iframeRef.current) {
       iframeRef.current.srcdoc = generateIframeContent(layoutContent);
    }

     // Add observer for theme changes on the main document
    const observer = new MutationObserver(() => {
        if (iframeRef.current) {
            iframeRef.current.srcdoc = generateIframeContent(layoutContent);
        }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();

  }, [layoutContent]); // Re-run when layoutContent changes


  return (
    <div ref={containerRef} className="flex h-full flex-col p-4 md:p-6">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
             <CardTitle className="text-lg">{layoutName}</CardTitle>
             <CardDescription>Preview of the selected layout</CardDescription>
          </div>

          <Button variant="outline" size="sm" onClick={copyToClipboard} aria-label="Copy HTML code">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Copy Code</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-6">
                <p>Loading layout...</p> {/* Add a spinner later if desired */}
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="Layout Preview"
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin" // Allow scripts for potential JS in layouts and same-origin for Tailwind CDN
                srcDoc={generateIframeContent(layoutContent)} // Initial load
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
