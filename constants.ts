import { Team } from './types';

export const INITIAL_TEAMS: Omit<Team, 'players'>[] = [
  {
    id: 't1',
    name: 'Nebula United',
    attack: 88,
    midfield: 85,
    defense: 82,
    color: '#3b82f6', // Blue
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't2',
    name: 'Red Star Nova',
    attack: 92,
    midfield: 88,
    defense: 75,
    color: '#ef4444', // Red
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't3',
    name: 'Iron Clad FC',
    attack: 70,
    midfield: 78,
    defense: 95,
    color: '#64748b', // Slate
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't4',
    name: 'Emerald City',
    attack: 80,
    midfield: 82,
    defense: 80,
    color: '#10b981', // Emerald
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't5',
    name: 'Golden Eagles',
    attack: 85,
    midfield: 85,
    defense: 60,
    color: '#eab308', // Yellow
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't6',
    name: 'Void Walkers',
    attack: 76,
    midfield: 70,
    defense: 75,
    color: '#8b5cf6', // Violet
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
   {
    id: 't7',
    name: 'Solar Flares',
    attack: 90,
    midfield: 60,
    defense: 60,
    color: '#f97316', // Orange
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  },
  {
    id: 't8',
    name: 'Lunar Tides',
    attack: 65,
    midfield: 90,
    defense: 85,
    color: '#06b6d4', // Cyan
    stats: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
  }
];

export const FIRST_NAMES = [
  "Kai", "Jay", "Leo", "Ash", "Max", "Rex", "Sam", "Tom", "Ben", "Dan",
  "Luca", "Milo", "Noah", "Finn", "Cole", "Zane", "Jude", "Axel", "Rian", "Omar",
  "Hiro", "Yuri", "Sven", "Lars", "Otto", "Hugo", "Enzo", "Nico", "Ravi", "Chen"
];

export const LAST_NAMES = [
  "Storm", "Steel", "Frost", "Blaise", "Power", "Swift", "Strong", "Wolfe", "Drake", "Hawk",
  "Rivers", "Woods", "Stone", "Banks", "Fields", "Gates", "Walls", "Knight", "King", "Prince",
  "Mercer", "Vance", "Reeve", "Cross", "March", "North", "West", "Stark", "Wayne", "Kent"
];