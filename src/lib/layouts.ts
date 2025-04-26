import { promises as fs } from 'fs';
import path from 'path';

// NOTE: This file should only contain server-side logic.
// Reading file system ('fs') is not available in client-side components.

const layoutsDirectory = path.join(process.cwd(), 'src/layouts');

// Simulates fetching layout names (e.g., from a Firestore collection index)
// This function is safe to run on the server (e.g., in page.tsx or API routes)
export async function getLayoutNames(): Promise<string[]> {
  let filenames: string[];
  try {
    filenames = await fs.readdir(layoutsDirectory);
  } catch (error: any) {
     // If the directory doesn't exist, create it
     if (error.code === 'ENOENT') {
        console.log(`Layouts directory not found at ${layoutsDirectory}, creating it...`);
        try {
             await fs.mkdir(layoutsDirectory, { recursive: true });
             console.log(`Created layouts directory.`);
             return []; // Return empty as no layouts exist yet
        } catch (creationError) {
             console.error('Error creating layout directory:', creationError);
             return []; // Return empty on creation error
        }
     }
    // Rethrow other errors during directory read
    console.error('Error reading layout directory:', error);
    return [];
  }

  let layoutNames = filenames
    .filter((filename) => /\.(html|md)$/.test(filename)) // Keep only html or md files
    .map((filename) => filename.replace(/\.(html|md)$/, ''))
    .sort((a, b) => a.localeCompare(b));

  if (layoutNames.length === 0) {
      console.warn('No layout files found in the directory.');
  }

  return layoutNames;

}


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
