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

  // Define keywords and their associated categories. Order matters for specificity.
  // Expanded list to cover new components
  const categoryKeywords: { keyword: string[], category: string }[] = [
    // Most specific first
    { keyword: ['hero section animated elements', 'hero section full width image', 'hero section gradient background', 'hero section left align text', 'hero section minimalist', 'hero section parallax effect', 'hero section right align text', 'hero section simple centered', 'hero section with call to action buttons (two)', 'hero section with search bar', 'hero section with app screenshot', 'hero section split with signup', 'hero section with image', 'hero section'], category: 'Hero Section' },
    { keyword: ['feature blocks overlapping', 'feature comparison table', 'feature grid circular icons', 'feature grid four column minimal', 'feature grid three column icons left', 'feature grid three column icons top', 'feature grid two column split', 'feature grid with call to action', 'feature grid with numbering', 'feature grid with shadow effect', 'feature list expandable', 'feature list stacked', 'feature list with bullet points', 'feature list with progress bars', 'feature section - alternating image text', 'feature section gradient cards', 'feature section image left text right', 'feature section with image collage', 'feature section with side image', 'feature section zigzag layout', 'feature showcase carousel', 'feature grid', 'feature list', 'feature section', 'feature comparison', 'feature showcase', 'feature blocks'], category: 'Feature Section' },
    { keyword: ['pricing cards basic highlighted', 'pricing cards full width row', 'pricing cards minimalist design', 'pricing cards monthly yearly switch', 'pricing cards stacked mobile', 'pricing cards with discount badge', 'pricing cards with feature comparison', 'pricing cards with trial offer', 'pricing table simple', 'pricing cards', 'pricing table'], category: 'Pricing Section' },
    { keyword: ['testimonial section simple centered', 'testimonials - alternating backgrounds', 'testimonials blockquote style', 'testimonials carousel full width', 'testimonials grid three column avatar top', 'testimonials grid two column quote style', 'testimonials list simple quotes', 'testimonials slider with arrows', 'testimonials slider with dots', 'testimonials with company logos', 'testimonials with star ratings', 'testimonial card', 'testimonials grid', 'testimonials list', 'testimonials carousel', 'testimonials slider', 'testimonial section', 'testimonials with'], category: 'Testimonial Section' },
    { keyword: ['cta section - dark background', 'cta simple justified', 'call to action full width banner', 'call to action minimal text only', 'call to action with form integrated', 'call to action with icon and text', 'call to action with image background left', 'cta - section with gradient background', 'cta - section image left text right', 'call to action', 'cta'], category: 'CTA Section' },
    { keyword: ['contact details list icons', 'contact details with opening hours', 'contact form centered', 'contact form side by side map', 'utility - contact form inline', 'contact simple with map background', 'contact section with social links', 'contact split two tone', 'contact form', 'contact details', 'contact map', 'contact section'], category: 'Contact Section' },
    { keyword: ['footer - sitemap columns', 'footer simple copyright left', 'footer'], category: 'Footer Section' },
    { keyword: ['navigation bar bottom fixed mobile', 'navigation bar sticky top', 'navigation bar - simple centered', 'navigation bar with search', 'navigation bar', 'navbar', 'header with centered search bar'], category: 'Navigation Bar' },
    { keyword: ['blog post - compact list', 'blog post - featured image top', 'blog post list with sidebar right', 'blog post simple layout', 'blog post - simple image left', 'blog post - grid view three columns', 'blog post list', 'blog post single', 'blog post'], category: 'Blog Layout' },
    { keyword: ['e-commerce - product detail simple', 'e-commerce - product quick view modal', 'e-commerce - shopping cart panel', 'e-commerce product grid four column small', 'e-commerce - wishlist view', 'e-commerce - order confirmation', 'e-commerce - product listing filter sidebar', 'product page with image gallery', 'product grid', 'product details', 'checkout form', 'shopping cart', 'order confirmation', 'product listing', 'product quick view', 'wishlist'], category: 'E-commerce Layout' },
    { keyword: ['faq accordion basic single', 'faq accordion multiple open allowed', 'faq grid two column question answer', 'faq searchable section', 'faq section basic', 'faq list simple questions', 'faq section accordion', 'faq'], category: 'FAQ Section' },
    { keyword: ['team list with photo and bio', 'team section 4 columns', 'team section with job titles', 'team grid', 'team list', 'team carousel', 'team section'], category: 'Team Section' },
    { keyword: ['portfolio - centered text grid', 'portfolio grid hover effects', 'portfolio masonry with lightbox', 'portfolio grid', 'portfolio masonry', 'portfolio carousel', 'portfolio list'], category: 'Portfolio Section' },
    { keyword: ['about us with company history timeline', 'about us with mission and values', 'about us with stats and numbers', 'about us with team introduction', 'about us with video presentation', 'about us section with image', 'about us'], category: 'About Us Section' },
    { keyword: ['services section with icons', 'services list', 'services grid', 'services carousel', 'services section'], category: 'Services Section' },
    { keyword: ['login form - dark theme example', 'login form full screen background', 'login form simple', 'sign up form - minimalist', 'sign up form split image', 'form - multi step form', 'form floating label', 'form simple stacked', 'form - profile settings', 'form - registration form', 'form - forgot password', 'login form', 'registration form', 'forgot password', 'profile settings', 'user account', 'sign up form'], category: 'Form Layout' },
    { keyword: ['utility - coming soon page', 'utility - error page custom', 'utility - maintenance mode page', 'utility - newsletter signup popup', 'utility - search bar only', 'utility 404 page simple', 'utility 404 page with image', 'utility - page not found (404)', 'utility - server error (500)', 'coming soon', '404 error', 'search results', 'maintenance mode', 'empty state'], category: 'Utility Page' },
    { keyword: ['modal centered with image', 'modal simple with action', 'overlay - slide over right panel', 'modal', 'sidebar navigation', 'overlay', 'notification dropdown', 'slide over', 'newsletter signup popup'], category: 'Overlay/Modal' },
    { keyword: ['content - article with sidebar', 'content - overlapping image section', 'content - section with heading', 'content grid images and text', 'content masonry dynamic height', 'content grid with featured post', 'content section with author bio', 'content section with callout quote', 'content section with tabs', 'content two columns with images', 'content with image gallery inline', 'content grid', 'content with sidebar', 'content masonry', 'content single column', 'content section'], category: 'Content Layout' },
    { keyword: ['gallery - carousel slider', 'gallery masonry layout', 'gallery - image gallery masonry', 'gallery - fullscreen image slider', 'gallery - thumbnail image gallery', 'image gallery', 'video gallery', 'mixed media gallery', 'fullscreen image slider', 'thumbnail image gallery'], category: 'Gallery Layout' },
    { keyword: ['table - compact with avatars', 'table list with filters', 'table responsive scrollable', 'table - sortable columns', 'table - striped rows', 'table - simple bordered', 'table'], category: 'Table Layout' },
    { keyword: ['breadcrumbs with separators', 'pagination numbered links', 'pagination infinite scroll', 'pagination previous next buttons', 'pagination dropdown select', 'breadcrumbs', 'pagination - card footer', 'pagination - showing x-y of z', 'pagination simple centered', 'pagination'], category: 'Navigation/Pagination' },
    { keyword: ['progress - linear bar with steps', 'progress - step indicator', 'progress bar with percentage', 'progress - loading spinner centered', 'progress - stepper navigation horizontal', 'progress - circle with percentage', 'progress bar', 'progress circle', 'stepper navigation', 'loading spinner'], category: 'Progress/Status Indicator' },
    { keyword: ['alert - action buttons', 'alert - dismissible banner', 'alert - floating top right dismissible', 'alert - simple accent border', 'alert - top banner fixed', 'alert - with description', 'notification - floating alerts', 'notification - simple banner', 'notification - toast style bottom right', 'status indicator with text', 'status badges', 'alert banner', 'alert modal', 'notification list', 'toast notification', 'snackbar', 'alert', 'notification'], category: 'Alert/Notification' },
    { keyword: ['card - announcement card', 'card - blog post card', 'card - image overlay card', 'card - product card horizontal', 'card - profile card with stats', 'card - testimonial card', 'card - user profile small', 'card grid 3 columns', 'card'], category: 'Card Layout' },
    { keyword: ['stats section simple centered', 'stats section split with image', 'stats section with description list', 'dashboard activity feed widget', 'dashboard main area with chart', 'dashboard recent orders table widget', 'dashboard settings panel example', 'dashboard simple header', 'dashboard simple stat cards', 'dashboard to-do list widget', 'dashboard user profile widget', 'dashboard welcome banner', 'dashboard with mini cards and chart', 'dashboard - stats cards grid', 'dashboard layout with sidebar', 'stats section', 'dashboard layout', 'dashboard'], category: 'Dashboard/Stats' },
    { keyword: ['user profile - cover photo header', 'user profile - tabbed content', 'user profile card', 'user profile'], category: 'User Profile Layout' },
    { keyword: ['settings page with tabs', 'settings page'], category: 'Settings Layout' },
    { keyword: ['landing page with split image', 'landing page feature grid', 'landing page hero with signup form', 'landing page pricing table', 'landing page testimonials', 'landing page with call to action', 'landing page'], category: 'Landing Page' }, // Specific page types
    { keyword: ['other layouts - vertical timeline', 'other layouts - horizontal scrolling', 'other layouts - fullscreen slider', 'other layouts - split screen', 'utility - cookie consent banner', 'empty state - with action button', 'empty state - simple text only', 'status page - incident history', 'split screen', 'fullscreen slider', 'vertical timeline', 'horizontal scrolling', 'snackbar bottom full width', 'notification list right sidebar', 'alert modal confirmation', 'alert banner top sticky', 'content with sidebar left fixed', ], category: 'Other Layouts' }, // Keep this broader category towards the end
     // Add more specific keywords and categories as needed
  ];

  names.forEach(name => {
    let assignedCategory = 'Other'; // Default category
    const lowerCaseName = name.toLowerCase().replace(/-/g, ' '); // Normalize name for matching

     // Handle placeholder separately
    if (lowerCaseName === 'placeholder layout') {
      assignedCategory = 'Placeholder';
    } else {
      for (const { keyword, category } of categoryKeywords) {
        if (keyword.some(k => lowerCaseName.includes(k))) {
          assignedCategory = category;
          break; // Assign the first matching category (most specific first)
        }
      }
    }

    if (!categories[assignedCategory]) {
      categories[assignedCategory] = [];
    }
    // Avoid duplicates if a name matches multiple keywords leading to the same category
    if (!categories[assignedCategory].includes(name)) {
        categories[assignedCategory].push(name);
    }
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
          <h2 class="text-lg font-semibold">Layout Categories</h2>
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
                               {name.replace(/^(Landing Page|FAQ Section|...)\s/,'')} {/* Optionally shorten name */}
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

