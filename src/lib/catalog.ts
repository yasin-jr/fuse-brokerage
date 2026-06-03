/**
 * Catalog of investable tickers. Logos via FMP CDN (no key needed).
 * Each item carries `themes` tags so a stock can appear in multiple themes.
 */

export type CatalogItem = {
  symbol: string;
  name: string;
  sector: string;
  themes: string[]; // theme ids from src/lib/themes.ts
};

export const LOGO_URL = (symbol: string) =>
  `https://financialmodelingprep.com/image-stock/${symbol.toUpperCase()}.png`;

const t = (...x: string[]) => x;

// Compact catalog. ~230 names across sectors/themes. Extend any time.
export const CATALOG: CatalogItem[] = [
  // Mega tech
  { symbol: "AAPL",  name: "Apple Inc.",                 sector: "Technology", themes: t("tech","mega") },
  { symbol: "MSFT",  name: "Microsoft Corporation",      sector: "Technology", themes: t("tech","mega","ai","cloud","dividend") },
  { symbol: "NVDA",  name: "NVIDIA Corporation",         sector: "Technology", themes: t("tech","mega","ai","semis") },
  { symbol: "GOOGL", name: "Alphabet Inc. (A)",          sector: "Technology", themes: t("tech","mega","ai") },
  { symbol: "GOOG",  name: "Alphabet Inc. (C)",          sector: "Technology", themes: t("tech","mega","ai") },
  { symbol: "AMZN",  name: "Amazon.com, Inc.",           sector: "Consumer",   themes: t("tech","mega","cloud","consumer") },
  { symbol: "META",  name: "Meta Platforms, Inc.",       sector: "Technology", themes: t("tech","mega","ai") },
  { symbol: "TSLA",  name: "Tesla, Inc.",                sector: "Auto",       themes: t("ev","ai","mega") },
  { symbol: "AVGO",  name: "Broadcom Inc.",              sector: "Technology", themes: t("tech","semis","mega","dividend") },
  { symbol: "ORCL",  name: "Oracle Corporation",         sector: "Technology", themes: t("tech","cloud","dividend") },
  { symbol: "BRK.B", name: "Berkshire Hathaway",         sector: "Financials", themes: t("mega","financials") },
  { symbol: "LLY",   name: "Eli Lilly and Co.",          sector: "Healthcare", themes: t("healthcare","mega","biotech") },
  { symbol: "JPM",   name: "JPMorgan Chase & Co.",       sector: "Financials", themes: t("financials","mega","dividend") },
  { symbol: "V",     name: "Visa Inc.",                  sector: "Financials", themes: t("financials","mega") },
  { symbol: "MA",    name: "Mastercard Incorporated",    sector: "Financials", themes: t("financials","mega") },
  { symbol: "WMT",   name: "Walmart Inc.",               sector: "Consumer",   themes: t("consumer","mega","recession","dividend") },
  { symbol: "XOM",   name: "Exxon Mobil Corporation",    sector: "Energy",     themes: t("energy","mega","dividend") },
  { symbol: "CVX",   name: "Chevron Corporation",        sector: "Energy",     themes: t("energy","mega","dividend") },
  { symbol: "JNJ",   name: "Johnson & Johnson",          sector: "Healthcare", themes: t("healthcare","dividend","recession") },
  { symbol: "PG",    name: "Procter & Gamble",           sector: "Consumer",   themes: t("consumer","dividend","recession") },
  { symbol: "KO",    name: "The Coca-Cola Company",      sector: "Consumer",   themes: t("food","dividend","recession") },
  { symbol: "PEP",   name: "PepsiCo, Inc.",              sector: "Consumer",   themes: t("food","dividend","recession") },
  { symbol: "COST",  name: "Costco Wholesale",           sector: "Consumer",   themes: t("consumer","recession") },
  { symbol: "HD",    name: "The Home Depot, Inc.",       sector: "Consumer",   themes: t("consumer","dividend") },
  { symbol: "MCD",   name: "McDonald's Corporation",     sector: "Consumer",   themes: t("food","dividend","recession") },
  { symbol: "BAC",   name: "Bank of America Corp.",      sector: "Financials", themes: t("financials","dividend") },
  { symbol: "WFC",   name: "Wells Fargo & Company",      sector: "Financials", themes: t("financials","dividend") },
  { symbol: "GS",    name: "Goldman Sachs",              sector: "Financials", themes: t("financials") },
  { symbol: "MS",    name: "Morgan Stanley",             sector: "Financials", themes: t("financials","dividend") },
  { symbol: "C",     name: "Citigroup Inc.",             sector: "Financials", themes: t("financials","dividend") },
  { symbol: "DIS",   name: "The Walt Disney Company",    sector: "Consumer",   themes: t("consumer") },
  { symbol: "NFLX",  name: "Netflix, Inc.",              sector: "Technology", themes: t("tech","consumer") },
  { symbol: "T",     name: "AT&T Inc.",                  sector: "Telecom",    themes: t("dividend") },
  { symbol: "VZ",    name: "Verizon Communications",     sector: "Telecom",    themes: t("dividend","recession") },
  { symbol: "TMUS",  name: "T-Mobile US, Inc.",          sector: "Telecom",    themes: t() },
  // Semis / AI
  { symbol: "AMD",   name: "Advanced Micro Devices",     sector: "Technology", themes: t("tech","semis","ai") },
  { symbol: "INTC",  name: "Intel Corporation",          sector: "Technology", themes: t("tech","semis") },
  { symbol: "QCOM",  name: "QUALCOMM Incorporated",      sector: "Technology", themes: t("tech","semis","dividend") },
  { symbol: "TXN",   name: "Texas Instruments",          sector: "Technology", themes: t("tech","semis","dividend") },
  { symbol: "AMAT",  name: "Applied Materials",          sector: "Technology", themes: t("tech","semis") },
  { symbol: "MU",    name: "Micron Technology",          sector: "Technology", themes: t("tech","semis","ai") },
  { symbol: "LRCX",  name: "Lam Research",               sector: "Technology", themes: t("tech","semis") },
  { symbol: "KLAC",  name: "KLA Corporation",            sector: "Technology", themes: t("tech","semis","dividend") },
  { symbol: "MRVL",  name: "Marvell Technology",         sector: "Technology", themes: t("tech","semis","ai") },
  { symbol: "ADI",   name: "Analog Devices",             sector: "Technology", themes: t("tech","semis","dividend") },
  { symbol: "NXPI",  name: "NXP Semiconductors",         sector: "Technology", themes: t("tech","semis") },
  { symbol: "ON",    name: "ON Semiconductor",           sector: "Technology", themes: t("tech","semis","ev") },
  { symbol: "ASML",  name: "ASML Holding",               sector: "Technology", themes: t("tech","semis") },
  { symbol: "TSM",   name: "Taiwan Semiconductor",       sector: "Technology", themes: t("tech","semis","ai") },
  { symbol: "ARM",   name: "Arm Holdings plc",           sector: "Technology", themes: t("tech","semis","ai") },
  { symbol: "SMCI",  name: "Super Micro Computer",       sector: "Technology", themes: t("tech","ai") },
  { symbol: "DELL",  name: "Dell Technologies",          sector: "Technology", themes: t("tech","ai") },
  { symbol: "ANET",  name: "Arista Networks",            sector: "Technology", themes: t("tech","ai","cloud") },
  // Software / SaaS / Cloud
  { symbol: "ADBE",  name: "Adobe Inc.",                 sector: "Technology", themes: t("tech","cloud") },
  { symbol: "CRM",   name: "Salesforce, Inc.",           sector: "Technology", themes: t("tech","cloud","ai") },
  { symbol: "NOW",   name: "ServiceNow, Inc.",           sector: "Technology", themes: t("tech","cloud","ai") },
  { symbol: "INTU",  name: "Intuit Inc.",                sector: "Technology", themes: t("tech","cloud") },
  { symbol: "PANW",  name: "Palo Alto Networks",         sector: "Technology", themes: t("tech","cloud","cyber") },
  { symbol: "SNOW",  name: "Snowflake Inc.",             sector: "Technology", themes: t("tech","cloud","ai") },
  { symbol: "PLTR",  name: "Palantir Technologies",      sector: "Technology", themes: t("tech","ai") },
  { symbol: "SHOP",  name: "Shopify Inc.",               sector: "Technology", themes: t("tech","consumer") },
  { symbol: "WDAY",  name: "Workday, Inc.",              sector: "Technology", themes: t("tech","cloud") },
  { symbol: "TEAM",  name: "Atlassian Corporation",      sector: "Technology", themes: t("tech","cloud") },
  { symbol: "DDOG",  name: "Datadog, Inc.",              sector: "Technology", themes: t("tech","cloud") },
  { symbol: "NET",   name: "Cloudflare, Inc.",           sector: "Technology", themes: t("tech","cloud","cyber") },
  { symbol: "CRWD",  name: "CrowdStrike Holdings",       sector: "Technology", themes: t("tech","cloud","cyber") },
  { symbol: "ZS",    name: "Zscaler, Inc.",              sector: "Technology", themes: t("tech","cloud","cyber") },
  { symbol: "MDB",   name: "MongoDB, Inc.",              sector: "Technology", themes: t("tech","cloud") },
  { symbol: "FTNT",  name: "Fortinet, Inc.",             sector: "Technology", themes: t("tech","cyber") },
  { symbol: "IBM",   name: "IBM",                        sector: "Technology", themes: t("tech","ai","cloud","dividend") },
  { symbol: "CSCO",  name: "Cisco Systems",              sector: "Technology", themes: t("tech","dividend") },
  { symbol: "ADSK",  name: "Autodesk, Inc.",             sector: "Technology", themes: t("tech","cloud") },
  { symbol: "HPQ",   name: "HP Inc.",                    sector: "Technology", themes: t("tech","dividend") },
  { symbol: "UBER",  name: "Uber Technologies",          sector: "Technology", themes: t("tech","consumer") },
  { symbol: "ABNB",  name: "Airbnb, Inc.",               sector: "Technology", themes: t("tech","consumer") },
  { symbol: "SPOT",  name: "Spotify Technology",         sector: "Technology", themes: t("tech","consumer") },
  { symbol: "SQ",    name: "Block, Inc.",                sector: "Financials", themes: t("tech","fintech") },
  { symbol: "PYPL",  name: "PayPal Holdings",            sector: "Financials", themes: t("tech","fintech") },
  { symbol: "HOOD",  name: "Robinhood Markets",          sector: "Financials", themes: t("fintech") },
  { symbol: "COIN",  name: "Coinbase Global",            sector: "Financials", themes: t("fintech","crypto") },
  { symbol: "AI",    name: "C3.ai, Inc.",                sector: "Technology", themes: t("tech","ai") },
  { symbol: "SOUN",  name: "SoundHound AI",              sector: "Technology", themes: t("tech","ai") },
  { symbol: "PATH",  name: "UiPath Inc.",                sector: "Technology", themes: t("tech","robotics","ai") },
  // Robotics
  { symbol: "ISRG",  name: "Intuitive Surgical",         sector: "Healthcare", themes: t("robotics","healthcare") },
  { symbol: "ABB",   name: "ABB Ltd",                    sector: "Industrials",themes: t("robotics") },
  { symbol: "ROK",   name: "Rockwell Automation",        sector: "Industrials",themes: t("robotics","dividend") },
  { symbol: "TER",   name: "Teradyne, Inc.",             sector: "Technology", themes: t("robotics","semis") },
  { symbol: "IRBT",  name: "iRobot Corporation",         sector: "Technology", themes: t("robotics") },
  // Quantum
  { symbol: "IONQ",  name: "IonQ, Inc.",                 sector: "Technology", themes: t("quantum","tech") },
  { symbol: "RGTI",  name: "Rigetti Computing",          sector: "Technology", themes: t("quantum","tech") },
  { symbol: "QBTS",  name: "D-Wave Quantum",             sector: "Technology", themes: t("quantum","tech") },
  { symbol: "QUBT",  name: "Quantum Computing Inc.",     sector: "Technology", themes: t("quantum","tech") },
  // EV / Auto
  { symbol: "F",     name: "Ford Motor Company",         sector: "Auto",       themes: t("ev","dividend") },
  { symbol: "GM",    name: "General Motors",             sector: "Auto",       themes: t("ev") },
  { symbol: "RIVN",  name: "Rivian Automotive",          sector: "Auto",       themes: t("ev") },
  { symbol: "LCID",  name: "Lucid Group",                sector: "Auto",       themes: t("ev") },
  { symbol: "NIO",   name: "NIO Inc.",                   sector: "Auto",       themes: t("ev") },
  { symbol: "XPEV",  name: "XPeng Inc.",                 sector: "Auto",       themes: t("ev") },
  { symbol: "LI",    name: "Li Auto Inc.",               sector: "Auto",       themes: t("ev") },
  { symbol: "CHPT",  name: "ChargePoint Holdings",       sector: "Auto",       themes: t("ev") },
  { symbol: "BLNK",  name: "Blink Charging",             sector: "Auto",       themes: t("ev") },
  // Biotech / Healthcare
  { symbol: "PFE",   name: "Pfizer Inc.",                sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "MRK",   name: "Merck & Co.",                sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "ABBV",  name: "AbbVie Inc.",                sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "TMO",   name: "Thermo Fisher Scientific",   sector: "Healthcare", themes: t("healthcare") },
  { symbol: "DHR",   name: "Danaher Corporation",        sector: "Healthcare", themes: t("healthcare") },
  { symbol: "UNH",   name: "UnitedHealth Group",         sector: "Healthcare", themes: t("healthcare","dividend") },
  { symbol: "BMY",   name: "Bristol-Myers Squibb",       sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "AMGN",  name: "Amgen Inc.",                 sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "GILD",  name: "Gilead Sciences",            sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "REGN",  name: "Regeneron Pharmaceuticals",  sector: "Healthcare", themes: t("biotech","healthcare") },
  { symbol: "VRTX",  name: "Vertex Pharmaceuticals",     sector: "Healthcare", themes: t("biotech","healthcare") },
  { symbol: "MRNA",  name: "Moderna, Inc.",              sector: "Healthcare", themes: t("biotech") },
  { symbol: "BNTX",  name: "BioNTech SE",                sector: "Healthcare", themes: t("biotech") },
  { symbol: "NVAX",  name: "Novavax, Inc.",              sector: "Healthcare", themes: t("biotech") },
  { symbol: "BIIB",  name: "Biogen Inc.",                sector: "Healthcare", themes: t("biotech","healthcare") },
  { symbol: "ILMN",  name: "Illumina, Inc.",             sector: "Healthcare", themes: t("biotech","healthcare") },
  { symbol: "CRSP",  name: "CRISPR Therapeutics",        sector: "Healthcare", themes: t("biotech") },
  { symbol: "NTLA",  name: "Intellia Therapeutics",      sector: "Healthcare", themes: t("biotech") },
  { symbol: "BEAM",  name: "Beam Therapeutics",          sector: "Healthcare", themes: t("biotech") },
  { symbol: "EDIT",  name: "Editas Medicine",            sector: "Healthcare", themes: t("biotech") },
  { symbol: "NVS",   name: "Novartis AG",                sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  { symbol: "AZN",   name: "AstraZeneca PLC",            sector: "Healthcare", themes: t("biotech","healthcare","dividend") },
  // Dividend aristocrats
  { symbol: "MMM",   name: "3M Company",                 sector: "Industrials",themes: t("dividend","recession") },
  { symbol: "CAT",   name: "Caterpillar Inc.",           sector: "Industrials",themes: t("dividend") },
  { symbol: "BA",    name: "The Boeing Company",         sector: "Industrials",themes: t() },
  { symbol: "GE",    name: "GE Aerospace",               sector: "Industrials",themes: t() },
  { symbol: "HON",   name: "Honeywell International",    sector: "Industrials",themes: t("dividend") },
  { symbol: "UPS",   name: "United Parcel Service",      sector: "Industrials",themes: t("dividend") },
  { symbol: "LMT",   name: "Lockheed Martin",            sector: "Defense",    themes: t("dividend","recession") },
  { symbol: "RTX",   name: "RTX Corporation",            sector: "Defense",    themes: t("dividend") },
  { symbol: "NOC",   name: "Northrop Grumman",           sector: "Defense",    themes: t("dividend") },
  { symbol: "GD",    name: "General Dynamics",           sector: "Defense",    themes: t("dividend") },
  { symbol: "DE",    name: "Deere & Company",            sector: "Industrials",themes: t("dividend") },
  { symbol: "ADP",   name: "Automatic Data Processing",  sector: "Industrials",themes: t("dividend") },
  { symbol: "LOW",   name: "Lowe's Companies",           sector: "Consumer",   themes: t("dividend","consumer") },
  { symbol: "TGT",   name: "Target Corporation",         sector: "Consumer",   themes: t("dividend","consumer") },
  { symbol: "CL",    name: "Colgate-Palmolive",          sector: "Consumer",   themes: t("dividend","consumer","recession") },
  { symbol: "KMB",   name: "Kimberly-Clark",             sector: "Consumer",   themes: t("dividend","recession") },
  { symbol: "MO",    name: "Altria Group",               sector: "Consumer",   themes: t("dividend") },
  { symbol: "PM",    name: "Philip Morris International",sector: "Consumer",   themes: t("dividend") },
  { symbol: "O",     name: "Realty Income Corp.",        sector: "REIT",       themes: t("dividend") },
  { symbol: "SPG",   name: "Simon Property Group",       sector: "REIT",       themes: t("dividend") },
  // Food & Beverage
  { symbol: "SBUX",  name: "Starbucks Corporation",      sector: "Consumer",   themes: t("food","consumer") },
  { symbol: "CMG",   name: "Chipotle Mexican Grill",     sector: "Consumer",   themes: t("food","consumer") },
  { symbol: "YUM",   name: "Yum! Brands",                sector: "Consumer",   themes: t("food","dividend") },
  { symbol: "MDLZ",  name: "Mondelez International",     sector: "Consumer",   themes: t("food","dividend") },
  { symbol: "GIS",   name: "General Mills",              sector: "Consumer",   themes: t("food","dividend","recession") },
  { symbol: "K",     name: "Kellanova",                  sector: "Consumer",   themes: t("food","dividend") },
  { symbol: "HSY",   name: "The Hershey Company",        sector: "Consumer",   themes: t("food","dividend") },
  { symbol: "MNST",  name: "Monster Beverage",           sector: "Consumer",   themes: t("food") },
  // Energy
  { symbol: "COP",   name: "ConocoPhillips",             sector: "Energy",     themes: t("energy","dividend") },
  { symbol: "SLB",   name: "Schlumberger",               sector: "Energy",     themes: t("energy","dividend") },
  { symbol: "EOG",   name: "EOG Resources",              sector: "Energy",     themes: t("energy","dividend") },
  { symbol: "OXY",   name: "Occidental Petroleum",       sector: "Energy",     themes: t("energy") },
  { symbol: "MPC",   name: "Marathon Petroleum",         sector: "Energy",     themes: t("energy","dividend") },
  { symbol: "PSX",   name: "Phillips 66",                sector: "Energy",     themes: t("energy","dividend") },
  { symbol: "VLO",   name: "Valero Energy",              sector: "Energy",     themes: t("energy","dividend") },
  // Crypto-adjacent
  { symbol: "MSTR",  name: "MicroStrategy",              sector: "Technology", themes: t("crypto") },
  { symbol: "MARA",  name: "Marathon Digital",           sector: "Technology", themes: t("crypto") },
  { symbol: "RIOT",  name: "Riot Platforms",             sector: "Technology", themes: t("crypto") },
  // ETFs
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",           sector: "ETF",        themes: t("etf") },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",          sector: "ETF",        themes: t("etf","tech") },
  { symbol: "IWM",   name: "iShares Russell 2000",       sector: "ETF",        themes: t("etf") },
  { symbol: "DIA",   name: "SPDR Dow Jones ETF",         sector: "ETF",        themes: t("etf") },
  { symbol: "VOO",   name: "Vanguard S&P 500 ETF",       sector: "ETF",        themes: t("etf") },
  { symbol: "VTI",   name: "Vanguard Total Market ETF",  sector: "ETF",        themes: t("etf") },
  { symbol: "ARKK",  name: "ARK Innovation ETF",         sector: "ETF",        themes: t("etf","tech") },
  { symbol: "ARKQ",  name: "ARK Autonomous & Robotics",  sector: "ETF",        themes: t("etf","robotics","ai") },
  { symbol: "SMH",   name: "VanEck Semiconductor ETF",   sector: "ETF",        themes: t("etf","semis") },
  { symbol: "XLF",   name: "Financial Select Sector",    sector: "ETF",        themes: t("etf","financials") },
  { symbol: "XLE",   name: "Energy Select Sector",       sector: "ETF",        themes: t("etf","energy") },
  { symbol: "XLK",   name: "Technology Select Sector",   sector: "ETF",        themes: t("etf","tech") },
  { symbol: "XLV",   name: "Health Care Select Sector",  sector: "ETF",        themes: t("etf","healthcare") },
  { symbol: "GLD",   name: "SPDR Gold Shares",           sector: "ETF",        themes: t("etf","recession") },
];

export const TRENDING = ["NVDA", "AAPL", "TSLA", "MSFT", "META", "AMD", "GOOGL", "AMZN"];

/** Fuzzy search across ticker + name. */
export function searchCatalog(q: string, limit = 25): CatalogItem[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const scored = CATALOG.map((c) => {
    const tt = c.symbol.toLowerCase();
    const n = c.name.toLowerCase();
    let score = 0;
    if (tt === needle) score += 100;
    else if (tt.startsWith(needle)) score += 50;
    else if (tt.includes(needle)) score += 20;
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

export function byTheme(themeId: string): CatalogItem[] {
  return CATALOG.filter((c) => c.themes.includes(themeId));
}
