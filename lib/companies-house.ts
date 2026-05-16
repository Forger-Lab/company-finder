export interface CompaniesResult {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  industry: string;
  employees: string;
  // Structured fields for the UI.
  companyNumber: string;
  companyStatus: string;       // e.g. "active", "dissolved", "liquidation"
  companyType: string;         // e.g. "ltd", "plc"
  dateOfCreation: string;      // ISO date, e.g. "2017-04-13"
  dateOfCessation?: string;    // ISO date if dissolved
}

const ADVANCED_STATUSES = [
  'active',
  'dissolved',
  'liquidation',
  'administration',
  'receivership',
  'voluntary-arrangement',
  'insolvency-proceedings',
  'open',
  'closed',
  'registered',
  'removed',
].join(',');

/**
 * Searches Companies House for each query string via BOTH the basic and
 * advanced search endpoints, merging and deduping results by company_number.
 *
 * - /search/companies (basic) — broader fuzzy/relevance match; surfaces
 *   exact-name hits the advanced endpoint sometimes misses (e.g. "HAPPY
 *   LIMITED" for query "happy").
 * - /advanced-search/companies — supports the dissolved-status filter, so
 *   we can detect collisions with dissolved-but-protected names.
 */
export async function searchCompanies(queries: string[]): Promise<CompaniesResult[]> {
  const apiKey = process.env.COMPANY_HOUSE_KEY;
  if (!apiKey) {
    throw new Error('COMPANY_HOUSE_KEY is not set in environment variables');
  }

  const authHeader = `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`;
  const headers = { Authorization: authHeader };

  const fetchAdvanced = async (query: string): Promise<any[]> => {
    const params = new URLSearchParams({
      company_name_includes: query,
      items_per_page: '10000',
      start_index: '0',
      company_status: ADVANCED_STATUSES,
    });
    const url = `https://api.company-information.service.gov.uk/advanced-search/companies?${params.toString()}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error(`Advanced search error for "${query}" (${res.status})`);
        return [];
      }
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.error(`Advanced fetch error for "${query}":`, err);
      return [];
    }
  };

  const fetchBasic = async (query: string): Promise<any[]> => {
    const params = new URLSearchParams({
      q: query,
      items_per_page: '100',
      start_index: '0',
    });
    const url = `https://api.company-information.service.gov.uk/search/companies?${params.toString()}`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error(`Basic search error for "${query}" (${res.status})`);
        return [];
      }
      const data = await res.json();
      // Basic search returns items with `title`, not `company_name`.
      // Normalise to the advanced-shape field names so the downstream
      // mapper is uniform.
      return (data.items || []).map((item: any) => ({
        company_number: item.company_number,
        company_name: item.title ?? item.company_name,
        company_status: item.company_status,
        company_type: item.company_type,
        date_of_creation: item.date_of_creation,
        date_of_cessation: item.date_of_cessation,
      }));
    } catch (err) {
      console.error(`Basic fetch error for "${query}":`, err);
      return [];
    }
  };

  const work: Promise<any[]>[] = [];
  for (const query of queries) {
    work.push(fetchAdvanced(query));
    work.push(fetchBasic(query));
  }
  const allResults = await Promise.all(work);

  // Dedupe by company_number.
  const seenIds = new Set<string>();
  const uniqueItems: any[] = [];
  for (const items of allResults) {
    for (const item of items) {
      const id = item.company_number;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        uniqueItems.push(item);
      }
    }
  }

  return uniqueItems
    .map((item: any): CompaniesResult | null => {
      try {
        return {
          id: item.company_number || Math.random().toString(),
          name: item.company_name || 'Unknown Company',
          description: `Status: ${item.company_status || 'N/A'}. Type: ${item.company_type?.replace(/-/g, ' ') || 'N/A'}. Created on: ${item.date_of_creation || 'Unknown'}`,
          website: `https://find-and-update.company-information.service.gov.uk/company/${item.company_number}`,
          logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.company_name || 'Company')}`,
          industry: item.company_type?.toUpperCase().replace(/-/g, ' ') || 'UK Company',
          employees: 'N/A',
          companyNumber: item.company_number || '',
          companyStatus: item.company_status || '',
          companyType: item.company_type || '',
          dateOfCreation: item.date_of_creation || '',
          dateOfCessation: item.date_of_cessation,
        };
      } catch (err) {
        console.error('Error mapping item:', item, err);
        return null;
      }
    })
    .filter((item: any): item is CompaniesResult => item !== null);
}
