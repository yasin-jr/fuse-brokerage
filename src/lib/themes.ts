export type Theme = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  description: string;
  gradient: string; // CSS gradient for the hero
};

export const THEMES: Theme[] = [
  { id: "tech",       name: "Technology",          emoji: "💻", blurb: "The most valuable companies in the world are tech.", description: "Many of the most valuable companies in the world are technology companies. The following are some of the most dominant and impressive tech stocks.", gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)" },
  { id: "ai",         name: "AI & Machine Learning", emoji: "🤖", blurb: "Companies driving the AI revolution.", description: "Artificial intelligence is reshaping every industry. These companies build the chips, models and platforms powering the AI wave.", gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { id: "robotics",   name: "Robotics",            emoji: "🦾", blurb: "Automation and robotics leaders.", description: "From factory automation to surgical robots — these companies make machines that move, sense and decide.", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "quantum",    name: "Quantum Computing",   emoji: "⚛️", blurb: "Next-gen compute frontier.", description: "Quantum computing promises to break the limits of classical compute. These pure-play names are racing to commercialize.", gradient: "linear-gradient(135deg, #6366f1, #06b6d4)" },
  { id: "semis",      name: "Semiconductors",      emoji: "🔌", blurb: "Chips that power everything.", description: "Semiconductors are the foundation of modern technology — from phones and cars to AI training clusters.", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { id: "ev",         name: "Electric Vehicles",   emoji: "🚗", blurb: "The transition from oil to electric.", description: "The transition from oil to electric is underway. Automakers, battery makers and charging networks are all in play.", gradient: "linear-gradient(135deg, #84cc16, #22c55e)" },
  { id: "biotech",    name: "Biotech",             emoji: "🧬", blurb: "Gene editing, mRNA, and breakthroughs.", description: "Biotech moves fast — gene therapies, mRNA platforms and rare-disease drugs can re-rate names overnight.", gradient: "linear-gradient(135deg, #ec4899, #f43f5e)" },
  { id: "healthcare", name: "Healthcare",          emoji: "🏥", blurb: "As long as humans need medicine.", description: "Healthcare is one of the most defensive sectors. Insurers, device makers and pharma drive consistent demand.", gradient: "linear-gradient(135deg, #14b8a6, #06b6d4)" },
  { id: "dividend",   name: "Dividend Stocks",     emoji: "💵", blurb: "Companies that pay you to hold.", description: "Dividend stocks return cash to shareholders. They tend to be mature, profitable businesses with consistent cash flow.", gradient: "linear-gradient(135deg, #10b981, #14b8a6)" },
  { id: "recession",  name: "Recession Proof",     emoji: "🛡️", blurb: "Hold up when the cycle turns.", description: "The cyclic nature of macroeconomics means recessions happen. These names tend to hold up best when they do.", gradient: "linear-gradient(135deg, #64748b, #475569)" },
  { id: "food",       name: "Food & Beverage",     emoji: "🍔", blurb: "Snacks, drinks, restaurants.", description: "This theme covers the makers and sellers of food and beverage — from packaged goods to global restaurant chains.", gradient: "linear-gradient(135deg, #f97316, #f59e0b)" },
  { id: "energy",     name: "Energy",              emoji: "⛽", blurb: "Oil, gas and beyond.", description: "Energy producers, refiners and services. Commodity-driven, often dividend-rich.", gradient: "linear-gradient(135deg, #ef4444, #dc2626)" },
  { id: "financials", name: "Financials",          emoji: "🏦", blurb: "Banks, insurance and payments.", description: "Banks, broker-dealers, insurers and payment networks — the plumbing of global commerce.", gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
  { id: "consumer",   name: "Consumer",            emoji: "🛍️", blurb: "What people actually buy.", description: "Retailers, brands and consumer-tech companies that touch everyday life.", gradient: "linear-gradient(135deg, #d946ef, #a855f7)" },
  { id: "fintech",    name: "Fintech",             emoji: "💳", blurb: "Software eating finance.", description: "Fintech firms reinvent how money moves — payments, brokerages, neobanks and crypto rails.", gradient: "linear-gradient(135deg, #22d3ee, #6366f1)" },
  { id: "crypto",     name: "Crypto-Linked",       emoji: "₿",  blurb: "Public companies tied to crypto.", description: "Public companies whose performance is tied to crypto markets — miners, exchanges and treasury holders.", gradient: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { id: "cloud",      name: "Cloud",               emoji: "☁️", blurb: "Infrastructure software & SaaS.", description: "Cloud platforms and SaaS — the recurring-revenue backbone of modern business.", gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
  { id: "cyber",      name: "Cybersecurity",       emoji: "🛡️", blurb: "Defending the internet.", description: "As attacks grow, so does spend on cybersecurity. These names protect networks, endpoints and identities.", gradient: "linear-gradient(135deg, #1e293b, #0ea5e9)" },
  { id: "etf",        name: "ETFs",                emoji: "📊", blurb: "Diversified index baskets.", description: "Exchange-traded funds give you instant diversification across an index, theme or sector.", gradient: "linear-gradient(135deg, #475569, #1e293b)" },
];

export function findTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}
