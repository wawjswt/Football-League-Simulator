import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_TEAMS, FIRST_NAMES, LAST_NAMES } from './constants';
import { Team, Match, LeagueState, NewsItem, Player } from './types';
import { LeagueTable } from './components/LeagueTable';
import { MatchCard } from './components/MatchCard';
import { NewsFeed } from './components/NewsFeed';
import { PlayerStatsTable } from './components/PlayerStatsTable';
import { ChampionModal } from './components/ChampionModal';
import { generateRoundRecap } from './services/geminiService';

// --- Logic Helpers ---

// Generate Random Players for a Team
const generatePlayers = (teamId: string): Player[] => {
  const players: Player[] = [];
  const positions: Array<'GK' | 'DF' | 'MF' | 'FW'> = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW'];
  // Add 4 subs
  positions.push('GK', 'DF', 'MF', 'FW');

  positions.forEach((pos, index) => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    players.push({
      id: `${teamId}-p${index}`,
      name: `${firstName} ${lastName}`,
      position: pos,
      stats: {
        goals: 0,
        assists: 0,
        appearances: 0
      }
    });
  });
  return players;
};

// Generate Round Robin Schedule
const generateSchedule = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  const numTeams = teams.length;
  const numRounds = (numTeams - 1) * 2; // Home and Away
  const roundsPerLoop = numTeams - 1;

  let teamIds = teams.map(t => t.id);

  // Round Robin Algorithm
  for (let round = 0; round < roundsPerLoop; round++) {
    for (let i = 0; i < numTeams / 2; i++) {
      const home = teamIds[i];
      const away = teamIds[numTeams - 1 - i];
      
      // First Leg
      matches.push({
        id: `m-${round + 1}-${home}-${away}`,
        round: round + 1,
        homeTeamId: home,
        awayTeamId: away,
        homeScore: null,
        awayScore: null,
        played: false
      });

      // Second Leg (Reverse fixtures later in season)
      matches.push({
        id: `m-${round + 1 + roundsPerLoop}-${away}-${home}`,
        round: round + 1 + roundsPerLoop,
        homeTeamId: away,
        awayTeamId: home,
        homeScore: null,
        awayScore: null,
        played: false
      });
    }

    // Rotate array (keep first fixed)
    const fixed = teamIds[0];
    const rest = teamIds.slice(1);
    const last = rest.pop();
    if(last) rest.unshift(last);
    teamIds = [fixed, ...rest];
  }

  // Sort by round
  return matches.sort((a, b) => a.round - b.round);
};

// Simulate a single match outcome based on team stats
const simulateMatchScore = (home: Team, away: Team) => {
  // Base advantage
  const homeAdvantage = 5;
  
  // Calculate relative strengths
  const homePower = home.attack * 0.4 + home.midfield * 0.4 + home.defense * 0.2 + homeAdvantage + (Math.random() * 20);
  const awayPower = away.attack * 0.4 + away.midfield * 0.4 + away.defense * 0.2 + (Math.random() * 20);

  // Determine winner bias
  const diff = homePower - awayPower;
  
  let homeGoals = 0;
  let awayGoals = 0;

  // Expected goals based on power difference and pure randomness
  const baseGoals = Math.floor(Math.random() * 3); // 0, 1, or 2 goals base

  if (diff > 15) {
     homeGoals = baseGoals + Math.floor(Math.random() * 4) + 1; // Strong win
     awayGoals = Math.floor(Math.random() * 2); 
  } else if (diff < -15) {
     awayGoals = baseGoals + Math.floor(Math.random() * 4) + 1;
     homeGoals = Math.floor(Math.random() * 2);
  } else {
     // Close match
     homeGoals = baseGoals + Math.floor(Math.random() * 2);
     awayGoals = baseGoals + Math.floor(Math.random() * 2);
  }
  
  return { homeScore: Math.max(0, homeGoals), awayScore: Math.max(0, awayGoals) };
};

// Attribute goals and assists to players
const updateMatchPlayerStats = (team: Team, goalsScored: number): Team => {
  // CRITICAL FIX: Deep copy players to avoid mutating read-only state objects
  const newPlayers = team.players.map(p => ({
    ...p,
    stats: { ...p.stats }
  }));
  
  // 1. Mark appearances (assume all played for simplicity)
  newPlayers.forEach(p => p.stats.appearances++);

  // 2. Assign Goals
  for (let i = 0; i < goalsScored; i++) {
    // Weighted random scorer: FW > MF > DF > GK
    const rand = Math.random();
    let positionWeight: 'FW' | 'MF' | 'DF' | 'GK' = 'FW';
    if (rand > 0.95) positionWeight = 'GK'; // 5% chance crazy goal
    else if (rand > 0.85) positionWeight = 'DF';
    else if (rand > 0.55) positionWeight = 'MF';
    
    // Find players of that position
    let candidates = newPlayers.filter(p => p.position === positionWeight);
    if (candidates.length === 0) candidates = newPlayers; // Fallback

    const scorer = candidates[Math.floor(Math.random() * candidates.length)];
    scorer.stats.goals++;

    // 3. Assign Assist (70% chance of assist)
    if (Math.random() > 0.3) {
      // Assist usually MF or FW, but anyone else really
      const potentialAssisters = newPlayers.filter(p => p.id !== scorer.id);
      if (potentialAssisters.length > 0) {
        const assister = potentialAssisters[Math.floor(Math.random() * potentialAssisters.length)];
        assister.stats.assists++;
      }
    }
  }

  return { ...team, players: newPlayers };
}


const App: React.FC = () => {
  const [state, setState] = useState<LeagueState>(() => {
    const teamsWithPlayers = INITIAL_TEAMS.map(t => ({
      ...t,
      players: generatePlayers(t.id)
    }));
    return {
      teams: teamsWithPlayers,
      matches: [],
      currentRound: 1,
      news: [],
      isSimulating: false,
      isGeneratingAI: false
    };
  });

  const [halfSeasonChampion, setHalfSeasonChampion] = useState<Team | null>(null);
  const [seasonChampion, setSeasonChampion] = useState<Team | null>(null);
  const [showChampionModal, setShowChampionModal] = useState(false);

  const TOTAL_ROUNDS = (INITIAL_TEAMS.length - 1) * 2; // 14 for 8 teams
  const HALF_SEASON_ROUND = TOTAL_ROUNDS / 2; // 7

  // Initialize Schedule on Mount
  useEffect(() => {
    setState(prev => {
      if (prev.matches.length > 0) return prev;
      return {
        ...prev,
        matches: generateSchedule(prev.teams)
      };
    });
  }, []);

  // Recalculate Table Stats (Wins/Losses/Points) whenever matches change
  useEffect(() => {
    if (state.matches.length === 0) return;

    setState(prev => {
      const newTeams = prev.teams.map(team => {
        const teamMatches = prev.matches.filter(m => m.played && (m.homeTeamId === team.id || m.awayTeamId === team.id));
        
        const stats = {
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0
        };
  
        teamMatches.forEach(m => {
          stats.played++;
          const isHome = m.homeTeamId === team.id;
          const goalsFor = isHome ? m.homeScore! : m.awayScore!;
          const goalsAgainst = isHome ? m.awayScore! : m.homeScore!;
  
          stats.gf += goalsFor;
          stats.ga += goalsAgainst;
  
          if (goalsFor > goalsAgainst) {
            stats.won++;
            stats.points += 3;
          } else if (goalsFor === goalsAgainst) {
            stats.drawn++;
            stats.points += 1;
          } else {
            stats.lost++;
          }
        });
        return { ...team, stats };
      });
      
      const currentPoints = JSON.stringify(prev.teams.map(t => t.stats.points));
      const newPoints = JSON.stringify(newTeams.map(t => t.stats.points));
      
      if (currentPoints === newPoints) return prev;
      return { ...prev, teams: newTeams };
    });

  }, [state.matches]);

  const simulateRound = useCallback(async () => {
    if (state.currentRound > TOTAL_ROUNDS) return;

    setState(prev => ({ ...prev, isSimulating: true }));

    const roundMatches = state.matches.filter(m => m.round === state.currentRound);
    
    await new Promise(r => setTimeout(r, 800));

    // Temporary storage for updating player stats this round
    let updatedTeamsMap = new Map<string, Team>();
    state.teams.forEach(t => updatedTeamsMap.set(t.id, t));

    const updatedMatches = state.matches.map(m => {
      if (m.round === state.currentRound) {
        let home = updatedTeamsMap.get(m.homeTeamId)!;
        let away = updatedTeamsMap.get(m.awayTeamId)!;

        // 1. Get Score
        const result = simulateMatchScore(home, away);

        // 2. Update Players (Goals/Assists)
        home = updateMatchPlayerStats(home, result.homeScore);
        away = updateMatchPlayerStats(away, result.awayScore);

        // Save back to map
        updatedTeamsMap.set(home.id, home);
        updatedTeamsMap.set(away.id, away);

        return { ...m, ...result, played: true };
      }
      return m;
    });

    // Convert map back to array
    const newTeamState = Array.from(updatedTeamsMap.values());

    // Sort to determine leaders
    const sortedTeams = [...newTeamState].sort((a, b) => {
        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        const gdA = a.stats.gf - a.stats.ga;
        const gdB = b.stats.gf - b.stats.ga;
        return gdB - gdA;
    });

    // Check for Champions
    let newsToAdd: NewsItem[] = [];

    // Half Season Check
    if (state.currentRound === HALF_SEASON_ROUND) {
      const leader = sortedTeams[0];
      setHalfSeasonChampion(leader);
      newsToAdd.push({
         id: `half-champ-${Date.now()}`,
         round: state.currentRound,
         headline: `Halfway Point Reached!`,
         body: `${leader.name} lead the pack as 'Winter Champions' at the halfway stage of the season. Can they hold on?`,
         type: 'LEAGUE_UPDATE'
      });
    }

    // Final Season Check
    let nextRound = state.currentRound + 1;
    if (state.currentRound === TOTAL_ROUNDS) {
       const winner = sortedTeams[0];
       setSeasonChampion(winner);
       setShowChampionModal(true);
       nextRound = state.currentRound; // Don't increment past max
       newsToAdd.push({
        id: `champ-${Date.now()}`,
        round: state.currentRound,
        headline: `CHAMPIONS: ${winner.name.toUpperCase()}!`,
        body: `${winner.name} have been crowned champions of the Gemini Football League after a thrilling season!`,
        type: 'LEAGUE_UPDATE'
     });
    }

    setState(prev => ({
       ...prev, 
       teams: newTeamState,
       matches: updatedMatches,
       isGeneratingAI: true 
    }));

    try {
      const recentMatches = updatedMatches.filter(m => m.round === state.currentRound);
      const recap = await generateRoundRecap(state.currentRound, recentMatches, newTeamState);
      
      const newNews: NewsItem = {
        id: `news-${state.currentRound}`,
        round: state.currentRound,
        headline: recap.headline,
        body: recap.body,
        type: 'LEAGUE_UPDATE'
      };

      setState(prev => ({
        ...prev,
        news: [...prev.news, ...newsToAdd, newNews],
        currentRound: nextRound,
        isSimulating: false,
        isGeneratingAI: false
      }));

    } catch (e) {
      console.error(e);
      setState(prev => ({
        ...prev,
        news: [...prev.news, ...newsToAdd],
        currentRound: nextRound,
        isSimulating: false,
        isGeneratingAI: false
      }));
    }

  }, [state.currentRound, state.matches, state.teams, TOTAL_ROUNDS, HALF_SEASON_ROUND]);

  // View Helpers
  // If season is finished, display the last round
  const isSeasonFinished = seasonChampion !== null;
  const displayRound = isSeasonFinished ? TOTAL_ROUNDS : state.currentRound;
  
  const currentRoundMatches = state.matches.filter(m => m.round === displayRound);
  
  return (
    <div className="bg-transparent font-sans pb-10">
      
      {showChampionModal && seasonChampion && (
        <ChampionModal team={seasonChampion} onClose={() => setShowChampionModal(false)} />
      )}

      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-green-900/50 border border-green-400/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md hidden sm:block">Gemini Football Manager</h1>
            <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md sm:hidden">GFM</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-green-200 uppercase tracking-wider font-semibold">Current Season</span>
                <span className="text-white font-bold text-lg">
                  {isSeasonFinished ? "Finished" : `Round ${state.currentRound}`}
                </span>
             </div>
             
             {!isSeasonFinished ? (
               <button
                onClick={simulateRound}
                disabled={state.isSimulating || state.isGeneratingAI}
                className={`
                  px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2 border border-white/10
                  ${state.isSimulating 
                    ? 'bg-slate-700 cursor-wait opacity-80' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/50'
                  }
                `}
              >
                {state.isSimulating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Simulating...
                  </>
                ) : state.isGeneratingAI ? (
                  <>
                      <svg className="animate-pulse h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      Writing Press...
                  </>
                ) : (
                  <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>
                      Simulate Round
                  </>
                )}
              </button>
             ) : (
               <div className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 cursor-default">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                 Season Completed
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Standings & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Half Season Champion Banner */}
          {halfSeasonChampion && !seasonChampion && (
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-xl p-4 border border-amber-500/30 flex items-center gap-4 shadow-lg animate-in slide-in-from-top duration-500">
               <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-amber-500 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
               </div>
               <div>
                 <div className="text-xs text-amber-200 uppercase tracking-widest font-bold">Half-Season Leader</div>
                 <div className="text-xl font-bold text-white">{halfSeasonChampion.name}</div>
               </div>
            </div>
          )}

          {/* Full Season Champion Banner */}
          {seasonChampion && (
            <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-xl p-6 border border-yellow-300/50 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
               <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-bold text-yellow-700 bg-white shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
               </div>
               <div className="relative z-10 text-center md:text-left">
                 <div className="text-sm text-yellow-900 uppercase tracking-widest font-black">Season Champions</div>
                 <div className="text-3xl font-black text-white drop-shadow-sm">{seasonChampion.name}</div>
                 <div className="text-yellow-100 font-medium mt-1">
                   {seasonChampion.stats.points} Points • {seasonChampion.stats.won} Wins • {seasonChampion.stats.gf} Goals
                 </div>
               </div>
               <button 
                 onClick={() => setShowChampionModal(true)}
                 className="relative z-10 ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg border border-white/40 transition-colors"
               >
                 Replay Celebration
               </button>
            </div>
          )}

          {/* League Table */}
          <section>
             <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/10">
                <LeagueTable teams={state.teams} />
             </div>
          </section>

          {/* Player Stats (Golden Boot / Assists) */}
          <section>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 drop-shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Player Stats
              </h3>
              <PlayerStatsTable teams={state.teams} />
          </section>

        </div>

        {/* Right Column: Fixtures & News */}
        <div className="space-y-8">
          
          {/* Fixtures */}
          <section className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h3 className="text-lg font-bold text-white">Round {displayRound}</h3>
              <span className={`text-xs px-2 py-1 rounded font-bold border ${isSeasonFinished ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' : 'bg-black/30 text-green-300 border-green-500/30'}`}>
                {isSeasonFinished ? 'SEASON END' : (currentRoundMatches[0]?.played ? 'COMPLETED' : 'UPCOMING')}
              </span>
            </div>
            
            <div className="space-y-3">
              {currentRoundMatches.map(match => {
                 const home = state.teams.find(t => t.id === match.homeTeamId)!;
                 const away = state.teams.find(t => t.id === match.awayTeamId)!;
                 return <MatchCard key={match.id} match={match} homeTeam={home} awayTeam={away} />;
              })}
            </div>
            {isSeasonFinished && (
               <div className="mt-4 text-center text-sm text-slate-400 italic">
                 Season has concluded.
               </div>
            )}
          </section>

          {/* AI News Feed */}
          <section>
             <NewsFeed news={state.news} />
          </section>

        </div>

      </main>

    </div>
  );
};

export default App;