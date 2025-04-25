// src/app/api/layout/[name]/route.ts
import { NextResponse } from 'next/server';
// Import the specific function for API use
import { getLayoutContentForApi } from '@/lib/layouts';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const name = params.name;

  if (!name) {
    return NextResponse.json({ error: 'Layout name is required' }, { status: 400 });
  }

  try {
    // Use the dedicated function for API routes
    const decodedName = decodeURIComponent(name); // Decode name potentially URL encoded
    const content = await getLayoutContentForApi(decodedName);
    return NextResponse.json({ content });
  } catch (error: any) {
    // Handle specific 'Layout not found' error from getLayoutContentForApi
    if (error.message.includes('not found')) {
        console.warn(`API: Layout '${name}' not found.`);
        return NextResponse.json({ error: `Layout '${name}' not found.` }, { status: 404 });
    }
    // Handle other potential errors during file reading
    console.error(`API error fetching layout ${name}:`, error);
    return NextResponse.json({ error: 'Failed to fetch layout content. Check server logs.' }, { status: 500 });
  }
}
