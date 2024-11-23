import React from 'react';
import { NewsCard } from './NewsCard';
import type { NewsItem } from '../types/news';

interface NewsFeedProps {
  news: NewsItem[];
}

export function NewsFeed({ news }: NewsFeedProps) {
  return (
    <div className="space-y-4">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}