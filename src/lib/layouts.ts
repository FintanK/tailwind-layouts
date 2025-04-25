import { promises as fs } from 'fs';
import path from 'path';

// NOTE: This file should only contain server-side logic.
// Reading file system ('fs') is not available in client-side components.

const layoutsDirectory = path.join(process.cwd(), 'src/layouts');

// Simulates fetching layout names (e.g., from a Firestore collection index)
// This function is safe to run on the server (e.g., in page.tsx or API routes)
export async function getLayoutNames(): Promise<string[]> {
  try {
    // Ensure the directory exists, create if not (useful for initial setup)
    try {
      await fs.access(layoutsDirectory);
    } catch {
      await fs.mkdir(layoutsDirectory, { recursive: true });
      // Optional: Create a placeholder file if the directory was just created
       await fs.writeFile(path.join(layoutsDirectory, 'Placeholder Layout.md'), '<!-- Placeholder Layout -->\n<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground p-6 text-center text-muted-foreground"><p>Select a layout from the sidebar to preview it here.</p></div>', 'utf8');
       console.log(`Created layouts directory and placeholder file at: ${layoutsDirectory}`);
    }

    const filenames = await fs.readdir(layoutsDirectory);
    const layoutNames = filenames
      .filter((filename) => /\.(html|md)$/.test(filename)) // Allow .html or .md
      .map((filename) => filename.replace(/\.(html|md)$/, '')) // Remove extension
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    // Ensure 'Placeholder Layout' is included if the directory was initially empty or only contains it.
    if (layoutNames.length === 0 && filenames.includes('Placeholder Layout.md')) {
        return ['Placeholder Layout'];
    }
     if (layoutNames.length === 0) {
        // If still empty after filtering (e.g., directory exists but no .html/.md files)
        console.warn('No .html or .md layout files found in src/layouts. Serving placeholder.');
        // Attempt to create placeholder if it doesn't exist for some reason
         try {
            await fs.access(path.join(layoutsDirectory, 'Placeholder Layout.md'));
         } catch {
            await fs.writeFile(path.join(layoutsDirectory, 'Placeholder Layout.md'), '<!-- Placeholder Layout -->\n<div class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground p-6 text-center text-muted-foreground"><p>Select a layout from the sidebar to preview it here.</p></div>', 'utf8');
         }
        return ['Placeholder Layout'];
    }


    // Ensure 'Placeholder Layout' is last if it exists
    const placeholderIndex = layoutNames.indexOf('Placeholder Layout');
    if (placeholderIndex > -1) {
      layoutNames.splice(placeholderIndex, 1);
      layoutNames.push('Placeholder Layout');
    }


    return layoutNames;
  } catch (error) {
    console.error('Error reading layout directory:', error);
    // Attempt to return placeholder on error
    try {
       await fs.access(path.join(layoutsDirectory, 'Placeholder Layout.md'));
       return ['Placeholder Layout'];
    } catch (placeholderError) {
       console.error('Placeholder layout file also not found.');
       return []; // Return empty array as a last resort
    }
  }
}


// Removed getLayoutContent function.
// Its functionality is now handled by the API route src/app/api/layout/[name]/route.ts
// This prevents the 'fs' module from being bundled in client-side code.

// Function to read content specifically for the API route (server-side only)
export async function getLayoutContentForApi(name: string): Promise<string> {
  const potentialHtmlPath = path.join(layoutsDirectory, `${name}.html`);
  const potentialMdPath = path.join(layoutsDirectory, `${name}.md`);

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
