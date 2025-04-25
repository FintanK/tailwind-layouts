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
import { getLayoutContent, getLayoutNames } from '@/lib/layouts';
import type { Metadata } from 'next';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
  title: 'Tailwind Layout Preview',
  description: 'Browse and copy Tailwind CSS layouts.',
};

export default async function Home() {
  const layoutNames = await getLayoutNames();
  // Fetch the first layout's content as default
  const initialLayoutContent = layoutNames.length > 0 ? await getLayoutContent(layoutNames[0]) : '';

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
                  {/* Use a button or div instead of link if navigation is handled by state */}
                  <SidebarMenuButton
                     className="layout-selector-button w-full justify-start truncate"
                     data-layout-name={name}
                     // Add isActive prop based on selected layout state if needed
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
        <LayoutPreview initialContent={initialLayoutContent} initialLayoutName={layoutNames[0] || 'No Layouts Available'} />
      </SidebarInset>
    </SidebarProvider>
  );
}
