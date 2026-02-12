import { commerceGraphQL } from "@/src/lib/commerce/client";
import { GET_COUNTRIES_QUERY } from "@/src/lib/commerce/queries";

export type CountryRegion = {
  id: number | null;
  code: string;
  name: string;
};

type CountryRegionNode = {
  id?: string | number | null;
  code?: string | null;
  name?: string | null;
};

type CountryNode = {
  id?: string | null;
  two_letter_abbreviation?: string | null;
  available_regions?: CountryRegionNode[] | null;
};

type CountriesResponse = {
  countries?: CountryNode[] | null;
};

function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase();
}

function mapCountryRegion(node: CountryRegionNode): CountryRegion | null {
  const code = String(node.code ?? "").trim().toUpperCase();
  const name = String(node.name ?? "").trim();
  const idRaw = Number(node.id);
  if (!code || !name) {
    return null;
  }
  return {
    id: Number.isInteger(idRaw) && idRaw > 0 ? idRaw : null,
    code,
    name
  };
}

export async function getCountryRegions(countryCode: string): Promise<CountryRegion[]> {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!normalizedCountryCode) {
    return [];
  }

  const data = await commerceGraphQL<CountriesResponse>(GET_COUNTRIES_QUERY);
  const countries = Array.isArray(data.countries) ? data.countries : [];
  const matchedCountry = countries.find((country) => {
    const byId = normalizeCountryCode(String(country.id ?? ""));
    const byAbbreviation = normalizeCountryCode(String(country.two_letter_abbreviation ?? ""));
    return byId === normalizedCountryCode || byAbbreviation === normalizedCountryCode;
  });

  const regions = Array.isArray(matchedCountry?.available_regions)
    ? matchedCountry.available_regions
    : [];

  return regions
    .map(mapCountryRegion)
    .filter((region): region is CountryRegion => region !== null);
}
