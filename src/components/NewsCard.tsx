import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { NewsItem } from '../types/news';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const getImpactColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-shadow border border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-sm text-gray-400">
            {formatDistanceToNow(news.timestamp, { addSuffix: true })}
          </span>
          <span className="mx-2 text-gray-600">•</span>
          <span className="text-sm font-medium text-gray-300">{news.source}</span>
        </div>
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className={`font-semibold ${getImpactColor(news.marketImpactScore)}`}>
            {news.marketImpactScore}
          </span>
        </div>
      </div>
      
      <p className="text-gray-200 mb-3">{news.content}</p>
      
      {news.marketImpactScore >= 70 && (
        <div className="flex items-center mt-4 p-3 bg-red-900/30 rounded-md border border-red-700/50">
          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
          <span className="text-sm text-red-200">High market impact alert</span>
        </div>
      )}
      
      <div className="mt-4">
        <span className="inline-block bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded border border-blue-700/50">
          {news.category}
        </span>
      </div>
    </div>
  );
}