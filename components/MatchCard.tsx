import React, { useState } from 'react';
import { Match, Team } from '../types';
import { generateMatchCommentary } from '../services/geminiService';

interface MatchCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, homeTeam, awayTeam }) => {
  const [commentary, setCommentary] = useState<string | null>(match.commentary || null);
  const [loading, setLoading] = useState(false);

  const handleGetAnalysis = async () => {
    if (commentary) return;
    setLoading(true);
    const analysis = await generateMatchCommentary(match, homeTeam, awayTeam);
    setCommentary(analysis);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner" style={{backgroundColor: homeTeam.color}}>
            {homeTeam.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-200 hidden sm:inline">{homeTeam.name}</span>
          <span className="font-semibold text-slate-200 sm:hidden">{homeTeam.name.substring(0,3).toUpperCase()}</span>
        </div>

        {/* Score */}
        <div className="px-3 py-1 bg-slate-900 rounded-md font-mono text-xl font-bold tracking-widest text-white border border-slate-700 min-w-[80px] text-center">
          {match.played ? `${match.homeScore} - ${match.awayScore}` : 'v'}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-semibold text-slate-200 text-right hidden sm:inline">{awayTeam.name}</span>
           <span className="font-semibold text-slate-200 text-right sm:hidden">{awayTeam.name.substring(0,3).toUpperCase()}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner" style={{backgroundColor: awayTeam.color}}>
            {awayTeam.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {match.played && (
        <div className="mt-2 text-xs border-t border-slate-700 pt-2">
          {commentary ? (
            <div className="bg-slate-700/30 p-2 rounded text-slate-300 italic">
              <span className="text-brand-accent not-italic font-bold mr-1">AI Pundit:</span>
              "{commentary}"
            </div>
          ) : (
            <button 
              onClick={handleGetAnalysis}
              disabled={loading}
              className="text-brand-accent hover:text-blue-400 flex items-center gap-1 transition-colors w-full justify-center"
            >
              {loading ? (
                <span>Generating analysis...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Get AI Analysis
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};