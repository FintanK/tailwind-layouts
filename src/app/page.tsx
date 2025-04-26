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
import { getLayoutNames } from '@/lib/layouts';
import type { Metadata } from 'next';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Function to categorize layout names
const categorizeLayouts = (names: string[]): { [key: string]: string[] } => {
  const categories: { [key: string]: string[] } = {};
  const knownCategories = [
    'Hero Section', 'Feature Section', 'Pricing', 'Testimonial', 'CTA', 'Contact', 'Footer',
    'Navigation Bar', 'Blog Post', 'E-commerce', 'FAQ', 'Team', 'Portfolio', 'About Us',
    'Services', 'Form', 'Utility', 'Overlay', 'Modal', 'Content', 'Gallery', 'Table',
    'Pagination', 'Progress', 'Status', 'Card', 'Alert', 'Notification', 'Dashboard', 'Login',
    'Sign Up', 'Stats', 'User Profile', 'Settings'
    // Add more prefixes as needed
  ];

  names.forEach(name => {
     // Handle placeholder separately
     if (name.toLowerCase() === 'placeholder layout') {
        if (!categories['Other']) categories['Other'] = [];
        categories['Other'].push(name);
        return;
     }

    let foundCategory = false;
    // Iterate through known categories and check if the name starts with the category prefix
    for (const catPrefix of knownCategories.sort((a, b) => b.length - a.length)) { // Sort by length descending to match longer prefixes first
      if (name.toLowerCase().startsWith(catPrefix.toLowerCase() + ' ')) { // Check with a space for better matching
        if (!categories[catPrefix]) {
          categories[catPrefix] = [];
        }
        categories[catPrefix].push(name);
        foundCategory = true;
        break;
      }
    }

     // Fallback check without space if no match with space was found
     if (!foundCategory) {
      for (const catPrefix of knownCategories.sort((a, b) => b.length - a.length)) {
        if (name.toLowerCase().startsWith(catPrefix.toLowerCase())) {
           if (!categories[catPrefix]) {
            categories[catPrefix] = [];
           }
           categories[catPrefix].push(name);
           foundCategory = true;
           break;
        }
      }
     }


    if (!foundCategory) {
      if (!categories['Other']) {
        categories['Other'] = [];
      }
      categories['Other'].push(name);
    }
  });

    // Sort categories alphabetically, keeping 'Other' last
    const sortedCategories = Object.keys(categories)
        .filter(cat => cat !== 'Other')
        .sort((a, b) => a.localeCompare(b));

    const finalCategories: { [key: string]: string[] } = {};
    sortedCategories.forEach(cat => {
        finalCategories[cat] = categories[cat].sort((a, b) => a.localeCompare(b)); // Sort names within category
    });

    if (categories['Other']) {
        finalCategories['Other'] = categories['Other'].sort((a, b) => a.localeCompare(b)); // Sort names within 'Other'
    }


  return finalCategories;
};


export default async function Home() {
  const allLayoutNames = await getLayoutNames();
  const categorizedLayouts = categorizeLayouts(allLayoutNames);
  // Fetch the first layout's content (alphabetically first from the first category, excluding Placeholder if others exist)
  const firstCategory = Object.keys(categorizedLayouts)[0] || 'Other';
  const initialLayoutName = categorizedLayouts[firstCategory]?.[0] || 'Placeholder Layout';
  const initialLayoutContent = await fetchInitialLayoutContent(initialLayoutName);


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" side="left">
        <SidebarHeader>
          <h2 className="text-lg font-semibold">Layout Categories</h2>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-[calc(100vh-theme(spacing.20))]"> {/* Adjust height based on header */}
             {/* Use Accordion for categories */}
             <Accordion type="multiple" className="w-full px-2">
                {Object.entries(categorizedLayouts).map(([category, names]) => (
                  <AccordionItem value={category} key={category} className="border-b-0">
                     <AccordionTrigger className="py-2 px-2 text-sm font-medium hover:bg-sidebar-accent rounded-md [&[data-state=open]>svg]:rotate-180">
                        {category} ({names.length})
                     </AccordionTrigger>
                     <AccordionContent className="pb-0 pl-4"> {/* Remove padding bottom, add left padding */}
                       <SidebarMenu className="ml-2 border-l border-sidebar-border pl-2"> {/* Add indent */}
                         {names.map((name) => (
                           <SidebarMenuItem key={name} className="py-1">
                             <SidebarMenuButton
                                className="layout-selector-button h-7 w-full justify-start truncate rounded-md px-2 py-1 text-xs hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent" // Adjusted styling
                                data-layout-name={name}
                                // Active state is handled client-side in LayoutPreview useEffect
                             >
                               {/* Optionally remove category prefix from display name if desired */}
                               {name.startsWith(category + ' ') ? name.substring(category.length + 1) : name}
                             </SidebarMenuButton>
                           </SidebarMenuItem>
                         ))}
                       </SidebarMenu>
                     </AccordionContent>
                  </AccordionItem>
                ))}
             </Accordion>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {/* Pass initial fetched data to the client component
            LayoutPreview now controls its own height and scrolling */}
        <LayoutPreview initialContent={initialLayoutContent} initialLayoutName={initialLayoutName} />
      </SidebarInset>
    </SidebarProvider>
  );
}
