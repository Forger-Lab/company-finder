import { NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/companies-house';
import generateSearchVariants from '@/utils/searchQueries';
import normalizeUKCompanyName from '@/utils/normalizeName';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();
  if (!query) {
    return NextResponse.json([]);
  }

  const normalizedQuery = normalizeUKCompanyName(query);
  if (!normalizedQuery) {
    // Input had no distinctive content (e.g. "The Company UK Ltd").
    return NextResponse.json([]);
  }

  const variants = generateSearchVariants(query);
  console.log('variants:', variants);

  try {
    const results = await searchCompanies(variants);

    const exactMatches = results.filter(company => {
      const normalised = normalizeUKCompanyName(company.name);
      console.log(`${company.name}: ${normalised} === ${normalizedQuery}`);
      return normalised === normalizedQuery;
    });

    if (exactMatches.length > 0) {
      return NextResponse.json(exactMatches);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch companies', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
