export interface NewsItem {
  id: string;
  source: string;
  content: string;
  timestamp: Date;
  marketImpactScore: number;
  category: NewsCategory;
}

export type NewsCategory = 'geopolitical' | 'economic' | 'technology' | 'environmental' | 'other';