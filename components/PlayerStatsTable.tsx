import React from 'react';
import { Team, Player } from '../types';

interface PlayerWithTeam extends Player {
  teamName: string;
  teamColor: string;
}

interface PlayerStatsTableProps {
  teams: Team[];
}

export const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ teams }) => {
  const [activeTab, setActiveTab] = React.useState<'GOALS' | 'ASSISTS'>('GOALS');

  const allPlayers: PlayerWithTeam[] = teams.flatMap(team => 
    team.players.map(player => ({
      ...player,
      teamName: team.name,
      teamColor: team.color
    }))
  );

  const sortedPlayers = allPlayers.sort((a, b) => {
    if (activeTab === 'GOALS') {
      if (b.stats.goals !== a.stats.goals) return b.stats.goals - a.stats.goals;
      return a.stats.appearances - b.stats.appearances; // Tiebreaker: fewer games
    } else {
      if (b.stats.assists !== a.stats.assists) return b.stats.assists - a.stats.assists;
      return a.stats.appearances - b.stats.appearances;
    }
  }).slice(0, 10); // Top 10

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/10">
      <div className="flex border-b border-white/10">
        <button 
          onClick={() => setActiveTab('GOALS')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'GOALS' 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Top Scorers
        </button>
        <button 
          onClick={() => setActiveTab('ASSISTS')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'ASSISTS' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
          }`}
        >
          Top Assists
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 w-10 text-center">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center font-bold text-white">
                {activeTab === 'GOALS' ? 'G' : 'A'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-2 text-center text-slate-500 font-mono">{index + 1}</td>
                <td className="px-4 py-2 font-medium text-white">
                  <div>{player.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{player.position}</div>
                </td>
                <td className="px-4 py-2">
                   <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: player.teamColor }}
                    ></span>
                    <span className="text-xs text-slate-300">{player.teamName}</span>
                   </div>
                </td>
                <td className="px-4 py-2 text-center font-bold text-xl text-yellow-400">
                  {activeTab === 'GOALS' ? player.stats.goals : player.stats.assists}
                </td>
              </tr>
            ))}
            {sortedPlayers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No stats recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};