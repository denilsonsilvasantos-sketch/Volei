import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Scoreboard } from './components/Scoreboard';
import { SettingsPage } from './components/SettingsPage';
import { PlayersPage } from './components/PlayersPage';
import { ShufflerPage } from './components/ShufflerPage';
import { HistoryPage } from './components/HistoryPage';
import { useSettings } from './hooks/useSettings';
import { usePlayers } from './hooks/usePlayers';
import { View } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('scoreboard');
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { players, addPlayer, togglePlayerActive, deletePlayer, loading: playersLoading } = usePlayers();

  if (settingsLoading || playersLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Preparando a quadra...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'scoreboard':
        return <Scoreboard settings={settings} />;
      case 'settings':
        return <SettingsPage settings={settings} onUpdate={updateSettings} />;
      case 'players':
        return <PlayersPage players={players} onAdd={addPlayer} onToggle={togglePlayerActive} onDelete={deletePlayer} />;
      case 'shuffler':
        return <ShufflerPage players={players} />;
      case 'history':
        return <HistoryPage />;
      default:
        return <Scoreboard settings={settings} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
