import { promises as fs } from 'fs';
import path from 'path';

// NOTE: This file should only contain server-side logic.
// Reading file system ('fs') is not available in client-side components.

const layoutsDirectory = path.join(process.cwd(), 'src/layouts');
const placeholderFileName = 'placeholder.md'; // Ensure consistent filename
const placeholderLayoutName = 'Placeholder Layout'; // Match the display name

// Simulates fetching layout names (e.g., from a Firestore collection index)
// This function is safe to run on the server (e.g., in page.tsx or API routes)
export async function getLayoutNames(): Promise<string[]> {
  let filenames: string[];
  try {
    filenames = await fs.readdir(layoutsDirectory);
  } catch (error: any) {
     // If the directory doesn't exist, create it and the placeholder
     if (error.code === 'ENOENT') {
        console.log(`Layouts directory not found at ${layoutsDirectory}, creating it...`);
        try {
             await fs.mkdir(layoutsDirectory, { recursive: true });
             const placeholderContent = '<!-- Placeholder Layout -->\n<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground p-6 text-center text-muted-foreground"><p>Select a layout from the sidebar to preview it here.</p></div>';
             await fs.writeFile(path.join(layoutsDirectory, placeholderFileName), placeholderContent, 'utf8');
             console.log(`Created layouts directory and placeholder file.`);
             return [placeholderLayoutName]; // Return only placeholder initially
        } catch (creationError) {
             console.error('Error creating layout directory or placeholder file:', creationError);
             return []; // Return empty on creation error
        }
     }
    // Rethrow other errors during directory read
    console.error('Error reading layout directory:', error);
    return [];
  }

  let layoutNames = filenames
    .filter((filename) => /\.(html|md)$/.test(filename) && filename !== placeholderFileName)
    .map((filename) => filename.replace(/\.(html|md)$/, ''))
    .sort((a, b) => a.localeCompare(b));

  // Check if placeholder file exists and add it if it does
  const placeholderExists = filenames.includes(placeholderFileName);

  if (placeholderExists) {
     // Ensure placeholder is always present, typically last unless it's the only one
     if (layoutNames.length === 0) {
        return [placeholderLayoutName];
     } else {
         // Add placeholder if it's not already mapped (e.g., if named differently)
         if (!layoutNames.includes(placeholderLayoutName)){
              layoutNames.push(placeholderLayoutName); // Add placeholder, sort will handle placement later if needed
         }
     }
  } else if (layoutNames.length === 0) {
      console.warn('No layout files found and placeholder is missing.');
      return []; // Return empty if no files found at all
  }


  // Return sorted names, potentially including the placeholder added above
  // If placeholder needs to be strictly last, filter it out before sort and add back
  const hasPlaceholder = layoutNames.includes(placeholderLayoutName);
  let sortedNames = layoutNames.filter(name => name !== placeholderLayoutName).sort((a,b) => a.localeCompare(b));
  if (hasPlaceholder) {
    sortedNames.push(placeholderLayoutName);
  }


  return sortedNames;

}


// Function to read content specifically for the API route (server-side only)
export async function getLayoutContentForApi(name: string): Promise<string> {
  const potentialHtmlPath = path.join(layoutsDirectory, `${name}.html`);
  const potentialMdPath = path.join(layoutsDirectory, `${name}.md`);
  const placeholderPath = path.join(layoutsDirectory, placeholderFileName); // Use consistent placeholder name


   // Handle request for placeholder explicitly
   if (name === placeholderLayoutName) {
      try {
         // Attempt to read the placeholder file
         return await fs.readFile(placeholderPath, 'utf8');
      } catch (e) {
         console.error(`Error reading placeholder layout file (${placeholderFileName}):`, e);
         // If placeholder file doesn't exist, provide default content
         return '<!-- Placeholder Layout -->\n<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground p-6 text-center text-muted-foreground"><p>Placeholder layout file not found.</p></div>';
         // Alternatively, throw an error: throw new Error(`Layout '${name}' not found.`);
      }
   }


  try {
    // Try reading HTML first
    try {
      return await fs.readFile(potentialHtmlPath, 'utf8');
    } catch (htmlError: any) {
      // If HTML fails (specifically because it doesn't exist), try Markdown
       if (htmlError.code === 'ENOENT') {
         try {
             return await fs.readFile(potentialMdPath, 'utf8');
         } catch (mdError: any) {
             // If Markdown also doesn't exist, throw a specific error for the API handler
             if (mdError.code === 'ENOENT') {
                console.error(`Layout file not found for: ${name} (checked .html and .md)`);
                // Throw an error that the API route can catch and translate to a 404
                throw new Error(`Layout '${name}' not found.`);
             }
             // Rethrow other Markdown errors
             console.error(`Error reading Markdown layout file for ${name}:`, mdError);
             throw new Error(`Failed to read layout file '${name}.md'.`);
         }
       }
      // Rethrow other HTML errors
      console.error(`Error reading HTML layout file for ${name}:`, htmlError);
      throw new Error(`Failed to read layout file '${name}.html'.`);
    }
  } catch (error) {
     // Catch errors from reading attempts or the specific 'not found' error thrown above
    console.error(`Error retrieving layout content for ${name}:`, error);
     // Re-throw the original error or a new generic one for the API route to handle
    throw error instanceof Error ? error : new Error(`Failed to retrieve layout content for '${name}'.`);
  }
}

