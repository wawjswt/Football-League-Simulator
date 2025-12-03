export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  stats: {
    goals: number;
    assists: number;
    appearances: number;
  };
}

export interface Team {
  id: string;
  name: string;
  attack: number; // 1-100
  defense: number; // 1-100
  midfield: number; // 1-100
  color: string;
  players: Player[]; // Roster
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number; // Goals For
    ga: number; // Goals Against
    points: number;
  };
}

export interface Match {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  played: boolean;
  commentary?: string; // AI Generated summary
}

export interface NewsItem {
  id: string;
  round: number;
  headline: string;
  body: string;
  type: 'MATCH_REPORT' | 'TRANSFER_RUMOR' | 'INJURY' | 'LEAGUE_UPDATE';
}

export interface LeagueState {
  teams: Team[];
  matches: Match[];
  currentRound: number;
  news: NewsItem[];
  isSimulating: boolean;
  isGeneratingAI: boolean;
}