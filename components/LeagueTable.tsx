import React from 'react';
import { Team } from '../types';

interface LeagueTableProps {
  teams: Team[];
}

export const LeagueTable: React.FC<LeagueTableProps> = ({ teams }) => {
  // Sort teams: Points -> Goal Difference -> Goals For
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    const gdA = a.stats.gf - a.stats.ga;
    const gdB = b.stats.gf - b.stats.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.stats.gf - a.stats.gf;
  });

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M5 12h14"/><path d="M7 18h10"/></svg>
          League Standings
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 w-12 text-center">Pos</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">D</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">GF</th>
              <th className="px-4 py-3 text-center">GA</th>
              <th className="px-4 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center font-bold text-white">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const gd = team.stats.gf - team.stats.ga;
              return (
                <tr key={team.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 text-center text-slate-500 font-mono">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: team.color }}
                    ></span>
                    {team.name}
                  </td>
                  <td className="px-4 py-3 text-center">{team.stats.played}</td>
                  <td className="px-4 py-3 text-center text-green-400">{team.stats.won}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{team.stats.drawn}</td>
                  <td className="px-4 py-3 text-center text-red-400">{team.stats.lost}</td>
                  <td className="px-4 py-3 text-center">{team.stats.gf}</td>
                  <td className="px-4 py-3 text-center">{team.stats.ga}</td>
                  <td className={`px-4 py-3 text-center font-medium ${gd > 0 ? 'text-green-500' : gd < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {gd > 0 ? '+' : ''}{gd}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-brand-accent text-base">
                    {team.stats.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};