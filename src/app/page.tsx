import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import LayoutPreview from '@/components/layout-preview';
import { getLayoutNames } from '@/lib/layouts'; // Keep getLayoutNames as it's server-side safe
import type { Metadata } from 'next';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'Tailwind Layout Preview',
  description: 'Browse and copy Tailwind CSS layouts.',
};

// Helper function to fetch layout content from the API route
// This needs to run server-side or be adapted if called client-side
async function fetchInitialLayoutContent(name: string): Promise<string> {
  if (!name) return '<p>No layout selected.</p>';
  try {
    // Construct the full URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:9002'; // Adjust port if necessary
    const apiUrl = `${baseUrl}/api/layout/${encodeURIComponent(name)}`;

    const response = await fetch(apiUrl, { cache: 'no-store' }); // Fetch fresh data

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
      console.error(`API error fetching initial layout (${name}): ${errorData.error}`);
      return `<p class="p-4 text-destructive">Error loading initial layout: ${errorData.error}</p>`;
    }
    const data = await response.json();
    return data.content;
  } catch (error: any) {
    console.error(`Fetch error for initial layout (${name}):`, error);
     return `<p class="p-4 text-destructive">Failed to fetch initial layout: ${error.message}</p>`;
  }
}


export default async function Home() {
  const layoutNames = await getLayoutNames();
  // Fetch the first layout's content using the API helper
  const initialLayoutName = layoutNames.length > 0 ? layoutNames[0] : 'Placeholder Layout'; // Use placeholder if no layouts
  const initialLayoutContent = await fetchInitialLayoutContent(initialLayoutName);


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" side="left">
        <SidebarHeader>
          <h2 className="text-lg font-semibold">Layouts</h2>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-theme(spacing.20))]"> {/* Adjust height based on header */}
            <SidebarMenu>
              {layoutNames.map((name) => (
                <SidebarMenuItem key={name}>
                  {/* Button triggers client-side state update and fetch in LayoutPreview */}
                  <SidebarMenuButton
                     className="layout-selector-button w-full justify-start truncate"
                     data-layout-name={name}
                     // Active state is handled client-side in LayoutPreview useEffect
                  >
                    {name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {/* Pass initial fetched data to the client component */}
        <LayoutPreview initialContent={initialLayoutContent} initialLayoutName={initialLayoutName} />
      </SidebarInset>
    </SidebarProvider>
  );
}
