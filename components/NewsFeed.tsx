import React from 'react';
import { NewsItem } from '../types';

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/10 h-[400px] flex flex-col shadow-lg overflow-hidden">
      {/* Fixed Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/30">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8a4 4 0 0 1 4 4 8 8 0 0 1-8 8H6"/></svg>
          League News
        </h2>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {news.slice().reverse().map((item) => (
          <div key={item.id} className="border-l-4 border-brand-accent pl-4 py-1 bg-slate-900/50 rounded-r-md">
            <div className="text-xs text-brand-accent font-bold uppercase tracking-wider mb-1">
              Round {item.round} • {item.type.replace('_', ' ')}
            </div>
            <h3 className="text-white font-semibold mb-1">{item.headline}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};