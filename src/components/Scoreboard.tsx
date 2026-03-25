import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Undo2, Play, Pause, RefreshCw, X, Save } from 'lucide-react';
import { Match, Settings } from '../types';
import { useTimer } from '../hooks/useTimer';
import { useSync } from '../hooks/useSync';
import { formatTime } from '../lib/utils';
import { cn } from '../lib/utils';

interface ScoreboardProps {
  settings: Settings;
  groupId: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ settings, groupId }) => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [setsA, setSetsA] = useState(0);
  const [setsB, setSetsB] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false);
  const [history, setHistory] = useState<{ a: number; b: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { seconds, isActive, toggleTimer, resetTimer, setSeconds, setIsActive } = useTimer();

  // Sync state with the group
  useSync(groupId, { scoreA, scoreB, setsA, setsB, isSwapped, seconds, isActive }, (newState) => {
    if (newState.scoreA !== undefined) setScoreA(newState.scoreA);
    if (newState.scoreB !== undefined) setScoreB(newState.scoreB);
    if (newState.setsA !== undefined) setSetsA(newState.setsA);
    if (newState.setsB !== undefined) setSetsB(newState.setsB);
    if (newState.isSwapped !== undefined) setIsSwapped(newState.isSwapped);
    if (newState.seconds !== undefined) setSeconds(newState.seconds);
    if (newState.isActive !== undefined) setIsActive(newState.isActive);
  });

  const saveMatch = async () => {
    if (setsA === 0 && setsB === 0 && scoreA === 0 && scoreB === 0) return;
    
    setIsSaving(true);
    const matchData = {
      team_a_score: scoreA,
      team_b_score: scoreB,
      sets_a: setsA,
      sets_b: setsB,
      created_at: new Date().toISOString()
    };

    if (groupId) {
      const localMatches = JSON.parse(localStorage.getItem('voley_matches_' + groupId) || '[]');
      localStorage.setItem('voley_matches_' + groupId, JSON.stringify([{
        id: crypto.randomUUID(),
        ...matchData
      }, ...localMatches]));
    }

    setIsSaving(false);
    resetGame();
    alert('Partida salva com sucesso no histórico!');
  };

  const addPoint = (team: 'A' | 'B') => {
    if (!isActive) toggleTimer();
    setHistory([...history, { a: scoreA, b: scoreB }]);
    if (team === 'A') {
      const newScore = scoreA + 1;
      setScoreA(newScore);
      checkSetWinner(newScore, scoreB, 'A');
    } else {
      const newScore = scoreB + 1;
      setScoreB(newScore);
      checkSetWinner(scoreA, newScore, 'B');
    }
  };

  const checkSetWinner = (sA: number, sB: number, lastScorer: 'A' | 'B') => {
    const target = settings.points_per_set;
    const diff = Math.abs(sA - sB);

    if ((sA >= target || sB >= target) && diff >= 2) {
      if (lastScorer === 'A') {
        setSetsA(prev => prev + 1);
      } else {
        setSetsB(prev => prev + 1);
      }
      resetSet();
    }
  };

  const resetSet = () => {
    setScoreA(0);
    setScoreB(0);
    setHistory([]);
    resetTimer();
  };

  const undoPoint = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setScoreA(last.a);
    setScoreB(last.b);
    setHistory(history.slice(0, -1));
  };

  const resetGame = () => {
    setScoreA(0);
    setScoreB(0);
    setSetsA(0);
    setSetsB(0);
    setHistory([]);
    resetTimer();
  };

  const TeamSide = ({ team, score, sets, color, name }: { 
    team: 'A' | 'B', 
    score: number, 
    sets: number, 
    color: string,
    name: string 
  }) => (
    <motion.div 
      onClick={() => addPoint(team)}
      className="relative flex-1 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden group"
      whileTap={{ scale: 0.98 }}
    >
      {/* Background with color overlay */}
      <div 
        className="absolute inset-0 opacity-20 transition-colors duration-500"
        style={{ backgroundColor: color }}
      />
      
      {/* Set indicators */}
      <div className="absolute top-8 flex gap-2">
        {Array.from({ length: Math.ceil(settings.max_sets / 2) + 1 }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "w-3 h-3 rounded-full border-2 transition-all duration-300",
              i < sets ? "bg-white border-white scale-125" : "border-white/30"
            )}
          />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-white/60 uppercase tracking-widest mb-4 z-10">
        {name}
      </h2>
      
      <motion.span 
        key={score}
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          scale: 1
        }}
        className={cn(
          "text-[10rem] sm:text-[12rem] md:text-[18rem] landscape:text-[7rem] landscape:md:text-[12rem] font-black text-white leading-none z-10 drop-shadow-2xl transition-opacity"
        )}
      >
        {score}
      </motion.span>

      <div className="absolute bottom-10 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 text-sm font-medium uppercase tracking-tighter">
        Toque para pontuar
      </div>
    </motion.div>
  );

  const teamAData = { team: 'A' as const, score: scoreA, sets: setsA, color: settings.team_a_color, name: settings.team_a_name };
  const teamBData = { team: 'B' as const, score: scoreB, sets: setsB, color: settings.team_b_color, name: settings.team_b_name };

  return (
    <div className="relative h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Court Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')]" />
      
      {/* Main Score Area */}
      <div className={cn(
        "flex-1 min-h-0 flex transition-all duration-700",
        isSwapped ? "flex-row-reverse" : "flex-row",
        "portrait:flex-col landscape:flex-row"
      )}>
        <TeamSide {...teamAData} />
        
        {/* Net / Divider */}
        <div className={cn(
          "relative bg-white/10 flex items-center justify-center z-20",
          "portrait:h-1 portrait:w-full landscape:w-1 landscape:h-full"
        )}>
          <div className={cn(
            "absolute bg-gradient-to-b from-transparent via-white/40 to-transparent",
            "portrait:w-full portrait:h-px landscape:h-full landscape:w-px"
          )} />
          <button 
            onClick={toggleTimer}
            className="bg-slate-900 px-6 py-3 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md active:scale-95 transition-transform cursor-pointer"
          >
            <span className="text-3xl md:text-4xl font-mono font-black text-orange-500 tabular-nums">
              {formatTime(seconds)}
            </span>
          </button>
        </div>

        <TeamSide {...teamBData} />
      </div>

      {/* Controls Bar */}
      <div className={cn(
        "bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4 md:gap-8 px-6 z-30 transition-all",
        "portrait:h-24 landscape:h-16"
      )}>
        <button 
          onClick={undoPoint}
          className="p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
          title="Desfazer ponto"
        >
          <Undo2 size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button 
          onClick={() => setIsSwapped(!isSwapped)}
          className="p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
          title="Inverter lados"
        >
          <RefreshCw size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button 
          onClick={toggleTimer}
          className={cn(
            "p-4 sm:p-6 rounded-3xl transition-all active:scale-95 shadow-lg",
            isActive ? "bg-red-500 text-white shadow-red-500/20" : "bg-green-500 text-white shadow-green-500/20"
          )}
        >
          {isActive ? <Pause size={28} className="sm:w-8 sm:h-8" fill="currentColor" /> : <Play size={28} className="sm:w-8 sm:h-8" fill="currentColor" />}
        </button>

        <button 
          onClick={saveMatch}
          disabled={isSaving}
          className={cn(
            "p-4 rounded-2xl transition-all active:scale-90 flex items-center gap-2",
            isSaving ? "bg-slate-700 text-slate-500" : "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
          )}
          title="Salvar Partida"
        >
          <Save size={24} />
          <span className="hidden md:inline font-bold">Finalizar Jogo</span>
        </button>

        <button 
          onClick={resetSet}
          className="p-3 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90"
          title="Resetar Set"
        >
          <RotateCcw size={20} className="sm:w-6 sm:h-6" />
        </button>

        <button 
          onClick={resetGame}
          className="p-3 sm:p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all active:scale-90"
          title="Resetar Jogo"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
