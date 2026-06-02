/**
 * Catalog of investable tickers shown across the app.
 * Logos served via FMP's public CDN (no API key needed).
 */

export type CatalogItem = {
  symbol: string;
  name: string;
  sector: string;
};

export const LOGO_URL = (symbol: string) =>
  `https://financialmodelingprep.com/image-stock/${symbol.toUpperCase()}.png`;

// US technology — used as the seed test set per the user's request.
export const TECHNOLOGY: CatalogItem[] = [
  { symbol: "AAPL",  name: "Apple Inc.",                       sector: "Technology" },
  { symbol: "MSFT",  name: "Microsoft Corporation",            sector: "Technology" },
  { symbol: "NVDA",  name: "NVIDIA Corporation",               sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)",          sector: "Technology" },
  { symbol: "GOOG",  name: "Alphabet Inc. (Class C)",          sector: "Technology" },
  { symbol: "AMZN",  name: "Amazon.com, Inc.",                 sector: "Technology" },
  { symbol: "META",  name: "Meta Platforms, Inc.",             sector: "Technology" },
  { symbol: "TSLA",  name: "Tesla, Inc.",                      sector: "Technology" },
  { symbol: "AVGO",  name: "Broadcom Inc.",                    sector: "Technology" },
  { symbol: "ORCL",  name: "Oracle Corporation",               sector: "Technology" },
  { symbol: "ADBE",  name: "Adobe Inc.",                       sector: "Technology" },
  { symbol: "CRM",   name: "Salesforce, Inc.",                 sector: "Technology" },
  { symbol: "AMD",   name: "Advanced Micro Devices, Inc.",     sector: "Technology" },
  { symbol: "INTC",  name: "Intel Corporation",                sector: "Technology" },
  { symbol: "CSCO",  name: "Cisco Systems, Inc.",              sector: "Technology" },
  { symbol: "QCOM",  name: "QUALCOMM Incorporated",            sector: "Technology" },
  { symbol: "TXN",   name: "Texas Instruments Incorporated",   sector: "Technology" },
  { symbol: "IBM",   name: "International Business Machines",  sector: "Technology" },
  { symbol: "NOW",   name: "ServiceNow, Inc.",                 sector: "Technology" },
  { symbol: "INTU",  name: "Intuit Inc.",                      sector: "Technology" },
  { symbol: "AMAT",  name: "Applied Materials, Inc.",          sector: "Technology" },
  { symbol: "MU",    name: "Micron Technology, Inc.",          sector: "Technology" },
  { symbol: "LRCX",  name: "Lam Research Corporation",         sector: "Technology" },
  { symbol: "KLAC",  name: "KLA Corporation",                  sector: "Technology" },
  { symbol: "PANW",  name: "Palo Alto Networks, Inc.",         sector: "Technology" },
  { symbol: "SNOW",  name: "Snowflake Inc.",                   sector: "Technology" },
  { symbol: "PLTR",  name: "Palantir Technologies Inc.",       sector: "Technology" },
  { symbol: "SHOP",  name: "Shopify Inc.",                     sector: "Technology" },
  { symbol: "UBER",  name: "Uber Technologies, Inc.",          sector: "Technology" },
  { symbol: "NFLX",  name: "Netflix, Inc.",                    sector: "Technology" },
  { symbol: "ASML",  name: "ASML Holding N.V.",                sector: "Technology" },
  { symbol: "TSM",   name: "Taiwan Semiconductor Manufacturing", sector: "Technology" },
  { symbol: "ARM",   name: "Arm Holdings plc",                 sector: "Technology" },
  { symbol: "SMCI",  name: "Super Micro Computer, Inc.",       sector: "Technology" },
  { symbol: "DELL",  name: "Dell Technologies Inc.",           sector: "Technology" },
  { symbol: "HPQ",   name: "HP Inc.",                          sector: "Technology" },
  { symbol: "ANET",  name: "Arista Networks, Inc.",            sector: "Technology" },
  { symbol: "MRVL",  name: "Marvell Technology, Inc.",         sector: "Technology" },
  { symbol: "ADI",   name: "Analog Devices, Inc.",             sector: "Technology" },
  { symbol: "ADSK",  name: "Autodesk, Inc.",                   sector: "Technology" },
  { symbol: "WDAY",  name: "Workday, Inc.",                    sector: "Technology" },
  { symbol: "TEAM",  name: "Atlassian Corporation",            sector: "Technology" },
  { symbol: "DDOG",  name: "Datadog, Inc.",                    sector: "Technology" },
  { symbol: "NET",   name: "Cloudflare, Inc.",                 sector: "Technology" },
  { symbol: "CRWD",  name: "CrowdStrike Holdings, Inc.",       sector: "Technology" },
  { symbol: "ZS",    name: "Zscaler, Inc.",                    sector: "Technology" },
  { symbol: "MDB",   name: "MongoDB, Inc.",                    sector: "Technology" },
  { symbol: "FTNT",  name: "Fortinet, Inc.",                   sector: "Technology" },
  { symbol: "ON",    name: "ON Semiconductor Corporation",     sector: "Technology" },
  { symbol: "NXPI",  name: "NXP Semiconductors N.V.",          sector: "Technology" },
];

export const CATALOG: CatalogItem[] = [...TECHNOLOGY];

export const TRENDING = ["NVDA", "AAPL", "TSLA", "MSFT", "META", "AMD"];

/** Simple fuzzy search across ticker + name. */
export function searchCatalog(q: string, limit = 20): CatalogItem[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const scored = CATALOG.map((c) => {
    const t = c.symbol.toLowerCase();
    const n = c.name.toLowerCase();
    let score = 0;
    if (t === needle) score += 100;
    else if (t.startsWith(needle)) score += 50;
    else if (t.includes(needle)) score += 20;
    if (n.startsWith(needle)) score += 30;
    else if (n.includes(needle)) score += 10;
    return { c, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.c);
}

export function findCatalog(symbol: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
}
