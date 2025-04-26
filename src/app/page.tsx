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

  // Expanded list of keywords and potential categories
  const categoryKeywords: { [key: string]: string[] } = {
    'Hero Section': ['hero'],
    'Feature Section': ['feature', 'advantages', 'benefits'],
    'Pricing': ['pricing', 'plans'],
    'Testimonial': ['testimonial', 'review', 'quote'],
    'CTA': ['cta', 'call to action'],
    'Contact': ['contact'],
    'Footer': ['footer'],
    'Navigation': ['navigation', 'nav', 'header', 'menu'],
    'Blog': ['blog', 'article', 'post'],
    'E-commerce': ['ecommerce', 'product', 'shop', 'cart'],
    'FAQ': ['faq', 'questions'],
    'Team': ['team', 'member', 'staff'],
    'Portfolio': ['portfolio', 'gallery', 'work', 'showcase'],
    'About Us': ['about'],
    'Services': ['service'],
    'Form': ['form', 'input', 'signup', 'login', 'subscribe'],
    'Utility': ['utility', 'misc', '404', '500', 'maintenance', 'coming soon', 'search'],
    'Overlay': ['overlay', 'modal', 'popup', 'slide over', 'dialog'],
    'Content': ['content', 'text', 'image', 'masonry'],
    'Table': ['table', 'grid', 'list'],
    'Pagination': ['pagination', 'paging'],
    'Progress': ['progress', 'step', 'indicator'],
    'Status': ['status', 'alert', 'badge', 'indicator', 'notification', 'banner', 'toast'],
    'Card': ['card'],
    'Dashboard': ['dashboard', 'stats', 'panel'],
    'Login/Sign Up': ['login', 'signin', 'signup', 'register', 'auth'],
    'Stats': ['stats', 'metric', 'kpi'],
    'User Profile': ['profile', 'user', 'account'],
    'Settings': ['setting'],
    'Gallery': ['gallery', 'carousel', 'slider', 'images']
  };

  names.forEach(name => {
    let assignedCategory = 'Other'; // Default category

    // Handle placeholder separately
    if (name.toLowerCase() === 'placeholder layout') {
      assignedCategory = 'Placeholder'; // Assign specific category
    } else {
        const lowerCaseName = name.toLowerCase();
        // Iterate through categories to find the best match based on keywords
        for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(keyword => lowerCaseName.includes(keyword))) {
             // Prioritize longer matches or more specific keywords if needed
             // For now, first match assigns the category
             assignedCategory = categoryName;
             break; // Exit loop once a category is found
          }
        }
    }


    if (!categories[assignedCategory]) {
      categories[assignedCategory] = [];
    }
    categories[assignedCategory].push(name);
  });

  // Sort categories alphabetically, keeping 'Placeholder' and 'Other' at the end
  const sortedCategories = Object.keys(categories)
    .filter(cat => cat !== 'Other' && cat !== 'Placeholder')
    .sort((a, b) => a.localeCompare(b));

  const finalCategories: { [key: string]: string[] } = {};
  sortedCategories.forEach(cat => {
    finalCategories[cat] = categories[cat].sort((a, b) => a.localeCompare(b)); // Sort names within category
  });

   // Add Placeholder category if it exists
   if (categories['Placeholder']) {
        finalCategories['Placeholder'] = categories['Placeholder']; // No sorting needed for single item
    }

  // Add 'Other' category at the end if it exists
  if (categories['Other']) {
    finalCategories['Other'] = categories['Other'].sort((a, b) => a.localeCompare(b)); // Sort names within 'Other'
  }

  return finalCategories;
};


export default async function Home() {
  const allLayoutNames = await getLayoutNames();
  const categorizedLayouts = categorizeLayouts(allLayoutNames);
  // Fetch the first layout's content (from the first category, typically not 'Placeholder' or 'Other' unless they are the only ones)
  const firstMeaningfulCategory = Object.keys(categorizedLayouts).find(cat => cat !== 'Placeholder' && cat !== 'Other') || Object.keys(categorizedLayouts)[0] || 'Placeholder';
  const initialLayoutName = categorizedLayouts[firstMeaningfulCategory]?.[0] || 'Placeholder Layout';
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
                               {/* Display full name, categorization handles grouping */}
                               {name}
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

