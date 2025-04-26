import { promises as fs } from 'fs';
import path from 'path';

// NOTE: This file should only contain server-side logic.
// Reading file system ('fs') is not available in client-side components.

const layoutsDirectory = path.join(process.cwd(), 'src/layouts');
const placeholderFileName = 'Placeholder Layout.md';
const placeholderLayoutName = 'Placeholder Layout';

// Simulates fetching layout names (e.g., from a Firestore collection index)
// This function is safe to run on the server (e.g., in page.tsx or API routes)
export async function getLayoutNames(): Promise<string[]> {
  try {
    // Ensure the directory exists, create if not
    try {
      await fs.access(layoutsDirectory);
    } catch {
      await fs.mkdir(layoutsDirectory, { recursive: true });
       // Create placeholder file if directory was just created
       await fs.writeFile(path.join(layoutsDirectory, placeholderFileName), '<!-- Placeholder Layout -->\n<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground p-6 text-center text-muted-foreground"><p>Select a layout from the sidebar to preview it here.</p></div>', 'utf8');
       console.log(`Created layouts directory and placeholder file at: ${layoutsDirectory}`);
       return [placeholderLayoutName]; // Return only placeholder initially
    }

    const filenames = await fs.readdir(layoutsDirectory);
    let layoutNames = filenames
      .filter((filename) => /\.(html|md)$/.test(filename) && filename !== placeholderFileName) // Exclude placeholder for now
      .map((filename) => filename.replace(/\.(html|md)$/, '')) // Remove extension
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    // Check if placeholder file exists and add it to the end if it does
    try {
        await fs.access(path.join(layoutsDirectory, placeholderFileName));
        layoutNames.push(placeholderLayoutName); // Add placeholder to the end
    } catch {
        // Placeholder file doesn't exist, do nothing
        if (layoutNames.length === 0) {
             console.warn('No layout files found and placeholder is missing.');
        }
    }


    // If the directory is empty except for potentially the placeholder, ensure placeholder is returned
    if (layoutNames.length === 0 && filenames.includes(placeholderFileName)) {
        return [placeholderLayoutName];
    }
     if (layoutNames.length === 0) {
        console.warn('No .html or .md layout files found in src/layouts. Returning empty.');
        return []; // Return empty if no files found at all
    }

    return layoutNames;
  } catch (error) {
    console.error('Error reading layout directory:', error);
    // Attempt to return placeholder on error if it exists
    try {
       await fs.access(path.join(layoutsDirectory, placeholderFileName));
       return [placeholderLayoutName];
    } catch (placeholderError) {
       console.error('Placeholder layout file also not found on error.');
       return []; // Return empty array as a last resort
    }
  }
}


// Function to read content specifically for the API route (server-side only)
export async function getLayoutContentForApi(name: string): Promise<string> {
  const potentialHtmlPath = path.join(layoutsDirectory, `${name}.html`);
  const potentialMdPath = path.join(layoutsDirectory, `${name}.md`);
  const placeholderPath = path.join(layoutsDirectory, placeholderFileName);


   // Handle request for placeholder explicitly
   if (name === placeholderLayoutName) {
      try {
         return await fs.readFile(placeholderPath, 'utf8');
      } catch (e) {
         console.error(`Error reading placeholder layout file:`, e);
         throw new Error(`Layout '${name}' not found.`); // Treat as not found if placeholder file missing
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
