import { promises as fs } from 'fs';
import path from 'path';

// NOTE: In a real application, these functions would interact with Firebase (Firestore/Storage)
// For this example, we'll read from local markdown/HTML files.

const layoutsDirectory = path.join(process.cwd(), 'src/layouts');

// Simulates fetching layout names (e.g., from a Firestore collection index)
export async function getLayoutNames(): Promise<string[]> {
  try {
    // Ensure the directory exists, create if not (useful for initial setup)
    try {
      await fs.access(layoutsDirectory);
    } catch {
      await fs.mkdir(layoutsDirectory, { recursive: true });
      // Optional: Create a placeholder file if the directory was just created
       await fs.writeFile(path.join(layoutsDirectory, 'placeholder.md'), '<!-- Placeholder Layout -->\n<div>Placeholder</div>', 'utf8');
       console.log(`Created layouts directory and placeholder file at: ${layoutsDirectory}`);
    }

    const filenames = await fs.readdir(layoutsDirectory);
    return filenames
      .filter((filename) => /\.(html|md)$/.test(filename)) // Allow .html or .md
      .map((filename) => filename.replace(/\.(html|md)$/, '')); // Remove extension
  } catch (error) {
    console.error('Error reading layout directory:', error);
    // Return an empty array or re-throw, depending on desired error handling
     // Returning a placeholder if the directory is empty or reading failed
    return ['Placeholder Layout']; // Return a default/placeholder if reading fails or dir is empty
  }
}

// Simulates fetching the content of a specific layout (e.g., from a Firestore document or Storage file)
export async function getLayoutContent(name: string): Promise<string> {
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
             // If Markdown also doesn't exist, throw a clearer error
             if (mdError.code === 'ENOENT') {
                console.error(`Layout file not found for: ${name}`);
                return `<p class="p-4 text-red-600">Layout '${name}' not found.</p>`;
             }
             // Rethrow other Markdown errors
             throw mdError;
         }
       }
      // Rethrow other HTML errors
      throw htmlError;
    }
  } catch (error) {
    console.error(`Error reading layout file for ${name}:`, error);
    return `<p class="p-4 text-red-600">Error loading layout '${name}'. Check server logs.</p>`; // Return error message
  }
}
