'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Check, Loader2 } from 'lucide-react';
// Removed direct import of getLayoutContent as it uses 'fs'
// import { getLayoutContent } from '@/lib/layouts';

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
      // Fetch content from the API route
      const response = await fetch(`/api/layout/${encodeURIComponent(name)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch layout: ${response.statusText}`);
      }
      const data = await response.json();
      setLayoutContent(data.content);
    } catch (error: any) {
      console.error('Failed to fetch layout:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load layout content.',
        variant: 'destructive',
      });
      setLayoutContent(`<p class="p-4 text-destructive">Error loading layout: ${error.message || 'Unknown error'}</p>`);
    } finally {
      setIsLoading(false);
      // Force iframe reload by updating srcdoc. Clear first, then set.
      if (iframeRef.current) {
          iframeRef.current.srcdoc = ' '; // Clear first
          setTimeout(() => {
             if (iframeRef.current) {
                // Use a temporary state variable to avoid potential race condition with layoutContent update
                const currentContent = layoutContent;
                iframeRef.current.srcdoc = generateIframeContent(currentContent);
             }
          }, 0); // Set in next tick
      }
    }
  }, [toast, layoutContent]); // Include layoutContent in dependency to regenerate iframe doc correctly

  // Handle clicks on layout selector buttons
  useEffect(() => {
    const handleLayoutSelection = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.layout-selector-button');
      if (button instanceof HTMLButtonElement) {
        const name = button.dataset.layoutName;
        if (name && name !== layoutName) { // Only fetch if name is different
          fetchAndSetLayout(name);
           // Update active state visually
           document.querySelectorAll('.layout-selector-button').forEach(btn => btn.removeAttribute('data-active'));
           button.setAttribute('data-active', 'true');
        }
      }
    };

    // Use event delegation on a parent container if possible
    // Ensure the selector is specific enough. Assuming the sidebar content area has this attribute.
    const sidebarContentElement = document.querySelector('[data-sidebar="content"]');
    sidebarContentElement?.addEventListener('click', handleLayoutSelection);

    // Set initial active state for the first layout
    const initialButton = document.querySelector(`.layout-selector-button[data-layout-name="${initialLayoutName}"]`);
    initialButton?.setAttribute('data-active', 'true');


    return () => {
      sidebarContentElement?.removeEventListener('click', handleLayoutSelection);
    };
  }, [fetchAndSetLayout, initialLayoutName, layoutName]); // Add layoutName to prevent refetching same layout

  // Generate iframe content including Tailwind CDN and theme handling
 const generateIframeContent = (htmlContent: string) => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    // Use CSS variables from the parent document for consistency
    const parentStyle = getComputedStyle(document.documentElement);
    const primaryColor = parentStyle.getPropertyValue('--primary').trim(); // e.g., 168 76% 42%
    const primaryFgColor = parentStyle.getPropertyValue('--primary-foreground').trim();
    const secondaryColor = parentStyle.getPropertyValue('--secondary').trim();
    const secondaryFgColor = parentStyle.getPropertyValue('--secondary-foreground').trim();
    const accentColor = parentStyle.getPropertyValue('--accent').trim();
    const accentFgColor = parentStyle.getPropertyValue('--accent-foreground').trim();
    const bgColor = parentStyle.getPropertyValue('--background').trim();
    const fgColor = parentStyle.getPropertyValue('--foreground').trim();
    const cardColor = parentStyle.getPropertyValue('--card').trim();
    const cardFgColor = parentStyle.getPropertyValue('--card-foreground').trim();
    const mutedColor = parentStyle.getPropertyValue('--muted').trim();
    const mutedFgColor = parentStyle.getPropertyValue('--muted-foreground').trim();


    return `
      <!DOCTYPE html>
      <html lang="en" class="${theme}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp,container-queries"></script>
        <style>
         :root {
            /* Define HSL colors directly for Tailwind JIT */
            --background-hsl: ${bgColor};
            --foreground-hsl: ${fgColor};
            --card-hsl: ${cardColor};
            --card-foreground-hsl: ${cardFgColor};
            --popover-hsl: ${parentStyle.getPropertyValue('--popover').trim()};
            --popover-foreground-hsl: ${parentStyle.getPropertyValue('--popover-foreground').trim()};
            --primary-hsl: ${primaryColor};
            --primary-foreground-hsl: ${primaryFgColor};
            --secondary-hsl: ${secondaryColor};
            --secondary-foreground-hsl: ${secondaryFgColor};
            --muted-hsl: ${mutedColor};
            --muted-foreground-hsl: ${mutedFgColor};
            --accent-hsl: ${accentColor};
            --accent-foreground-hsl: ${accentFgColor};
            --destructive-hsl: ${parentStyle.getPropertyValue('--destructive').trim()};
            --destructive-foreground-hsl: ${parentStyle.getPropertyValue('--destructive-foreground').trim()};
            --border-hsl: ${parentStyle.getPropertyValue('--border').trim()};
            --input-hsl: ${parentStyle.getPropertyValue('--input').trim()};
            --ring-hsl: ${parentStyle.getPropertyValue('--ring').trim()};
          }
          /* Basic styles for preview isolation */
          body { margin: 0; padding: 1rem; background-color: hsl(var(--background-hsl)); color: hsl(var(--foreground-hsl)); font-family: sans-serif; }
          /* Ensure links look reasonable */
          a { color: hsl(var(--primary-hsl)); }
          a:hover { text-decoration: underline; }
        </style>
        <script>
          // Function to convert HSL string to HSL object
          function parseHsl(hslString) {
            const match = hslString.match(/([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%/);
            if (match) return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
            return { h: 0, s: 0, l: 0 }; // Default fallback
          }

          // Function to format HSL object back to string for CSS
          function formatHsl(hslObj) {
            return \`hsl(\${hslObj.h}, \${hslObj.s}%, \${hslObj.l}%)\`;
          }

          // Apply parsed HSL values to Tailwind config
          tailwind.config = {
             darkMode: 'class', // Use class strategy
             theme: {
               extend: {
                 colors: {
                    border: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--border-hsl'))),
                    input: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--input-hsl'))),
                    ring: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--ring-hsl'))),
                    background: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--background-hsl'))),
                    foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--foreground-hsl'))),
                    primary: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--primary-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground-hsl'))),
                    },
                    secondary: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--secondary-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--secondary-foreground-hsl'))),
                    },
                    destructive: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--destructive-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--destructive-foreground-hsl'))),
                    },
                    muted: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--muted-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground-hsl'))),
                    },
                    accent: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--accent-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--accent-foreground-hsl'))),
                    },
                    popover: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--popover-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--popover-foreground-hsl'))),
                    },
                    card: {
                      DEFAULT: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--card-hsl'))),
                      foreground: formatHsl(parseHsl(getComputedStyle(document.documentElement).getPropertyValue('--card-foreground-hsl'))),
                    },
                 }
               }
             }
          }

           // Observer to sync theme changes from parent
          const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                // Ensure targetElement is an Element before accessing classList
                if (targetElement instanceof Element) {
                   const isDark = targetElement.classList.contains('dark');
                   document.documentElement.classList.toggle('dark', isDark);
                   // We might need to re-apply styles or trigger a Tailwind update if possible,
                   // but often just toggling the class is enough if Tailwind CSS is watching it.
                   // Re-applying config might be too heavy.
                }
              }
            }
          });

          // Observe the parent document's root element for class changes
          try {
           if(window.parent && window.parent.document) {
             observer.observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ['class'] });
             // Initial theme sync
             document.documentElement.classList.toggle('dark', window.parent.document.documentElement.classList.contains('dark'));
           }
          } catch (e) {
            console.warn("Could not observe parent document:", e); // Handle cross-origin issues if they arise
          }

        </script>

      </head>
      <body class="antialiased">
        ${stripHtmlComments(htmlContent)}
      </body>
      </html>
    `;
  };

   // Update iframe when layoutContent changes or theme changes on the main document
  useEffect(() => {
    if (iframeRef.current) {
       iframeRef.current.srcdoc = generateIframeContent(layoutContent);
    }

     // Add observer for theme changes on the main document to re-render iframe content
    const observer = new MutationObserver(() => {
        if (iframeRef.current) {
            // Regenerate content with potentially new theme-derived colors
            iframeRef.current.srcdoc = generateIframeContent(layoutContent);
        }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();

  }, [layoutContent]); // Re-run ONLY when layoutContent changes. Theme changes handled by observer.


  return (
    <div ref={containerRef} className="flex h-full flex-col p-4 md:p-6">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6">
          <div>
             <CardTitle className="text-lg">{layoutName || 'Select a Layout'}</CardTitle>
             <CardDescription>Preview of the selected layout</CardDescription>
          </div>

          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={isLoading || !layoutContent || layoutContent.startsWith('<p class="p-4 text-destructive">')} aria-label="Copy HTML code">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Copy Code</span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading layout...</span>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                title="Layout Preview"
                className="h-full w-full border-0 bg-background" // Use background color for iframe itself
                sandbox="allow-scripts allow-same-origin" // Allow scripts for potential JS in layouts and same-origin for Tailwind CDN + parent observer
                srcDoc={generateIframeContent(layoutContent)} // Use effect to manage srcDoc
              />
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
