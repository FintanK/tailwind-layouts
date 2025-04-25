// src/app/api/layout/[name]/route.ts
import { NextResponse } from 'next/server';
import { getLayoutContent } from '@/lib/layouts';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const name = params.name;

  if (!name) {
    return NextResponse.json({ error: 'Layout name is required' }, { status: 400 });
  }

  try {
    const content = await getLayoutContent(decodeURIComponent(name)); // Decode name potentially URL encoded
     // Basic check if content indicates an error from lib/layouts
    if (content.includes('Error loading layout') || content.includes('Layout') && content.includes('not found')) {
       return NextResponse.json({ error: `Layout '${name}' not found or failed to load.` }, { status: 404 });
    }
    return NextResponse.json({ content });
  } catch (error) {
    console.error(`API error fetching layout ${name}:`, error);
    return NextResponse.json({ error: 'Failed to fetch layout content' }, { status: 500 });
  }
}
