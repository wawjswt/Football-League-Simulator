import React from 'react';
import { Team } from '../types';

interface ChampionModalProps {
  team: Team;
  onClose: () => void;
}

export const ChampionModal: React.FC<ChampionModalProps> = ({ team, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Confetti/Firework Styles */}
      <style>{`
        @keyframes firework {
          0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
          50% { width: 0.5vmin; opacity: 1; }
          100% { width: var(--finalSize); opacity: 0; }
        }
        .firework,
        .firework::before,
        .firework::after {
          --initialSize: 0.5vmin;
          --finalSize: 45vmin;
          --particleSize: 0.2vmin;
          --color1: yellow;
          --color2: khaki;
          --color3: white;
          --color4: lime;
          --color5: gold;
          --color6: mediumseagreen;
          --y: -30vmin;
          --x: -50%;
          --initialY: 60vmin;
          content: "";
          animation: firework 2s infinite;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, var(--y));
          width: var(--initialSize);
          aspect-ratio: 1;
          background: 
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
            /* bottom right */
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
            /* bottom left */
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 20% 90%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 5% 90%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 10% 70%,
            /* top left */
            radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 20% 10%,
            radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 5% 10%,
            radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 10% 30%,
            /* top right */
            radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 80% 10%,
            radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 95% 10%,
            radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 90% 30%;
        }
        .firework::before {
          --x: -50%;
          --y: -50%;
          --initialY: -50%;
          transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
        }
        .firework::after {
          --x: -50%;
          --y: -50%;
          --initialY: -50%;
          transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
        }
        .firework:nth-child(2) {
          --x: 30vmin;
          --initialY: -20vmin;
        }
        .firework:nth-child(2)::before {
          transform: translate(-50%, -50%) rotate(10deg) scale(0.9) rotateY(10deg);
        }
        .firework:nth-child(2)::after {
          transform: translate(-50%, -50%) rotate(140deg) scale(0.95) rotateY(-50deg);
        }
      `}</style>
      
      <div className="firework"></div>
      <div className="firework"></div>

      {/* Modal Content */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-300">
        
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full p-4 shadow-lg shadow-yellow-500/50 animate-bounce">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
        </div>

        <h2 className="text-3xl font-black text-yellow-400 mt-8 mb-2 tracking-tight uppercase drop-shadow-sm">
          Season Champions!
        </h2>
        
        <div className="text-slate-300 mb-6">
          Congratulations to the winners of the Gemini League
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5 mb-8">
           <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-xl" style={{backgroundColor: team.color}}>
              {team.name.substring(0, 2).toUpperCase()}
           </div>
           <h3 className="text-2xl font-bold text-white mb-1">{team.name}</h3>
           <p className="text-sm text-slate-400">
             {team.stats.points} Points • {team.stats.won} Wins
           </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold rounded-lg shadow-lg shadow-yellow-900/20 transition-all active:scale-95"
        >
          Close Celebration
        </button>

      </div>
    </div>
  );
};