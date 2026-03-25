import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Scoreboard } from './components/Scoreboard';
import { SettingsPage } from './components/SettingsPage';
import { PlayersPage } from './components/PlayersPage';
import { ShufflerPage } from './components/ShufflerPage';
import { HistoryPage } from './components/HistoryPage';
import { Login } from './components/Login';
import { useSettings } from './hooks/useSettings';
import { usePlayers } from './hooks/usePlayers';
import { useHistory } from './hooks/useHistory';
import { View } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('scoreboard');
  const [groupId, setGroupId] = useState<string | null>(localStorage.getItem('voley_group_id'));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { settings, updateSettings, loading: settingsLoading } = useSettings(groupId);
  const { players, addPlayer, togglePlayerActive, deletePlayer, loading: playersLoading } = usePlayers(groupId);
  const { matches, draws, addMatch, addDraw, loading: historyLoading } = useHistory(groupId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = (id: string) => {
    setGroupId(id);
    localStorage.setItem('voley_group_id', id);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGroupId(null);
      localStorage.removeItem('voley_group_id');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !groupId) {
    return <Login onJoin={handleJoin} />;
  }

  if (settingsLoading || playersLoading || historyLoading) {
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
        return <Scoreboard settings={settings} groupId={groupId} onSaveMatch={addMatch} />;
      case 'settings':
        return <SettingsPage settings={settings} onUpdate={updateSettings} />;
      case 'players':
        return <PlayersPage players={players} onAdd={addPlayer} onToggle={togglePlayerActive} onDelete={deletePlayer} />;
      case 'shuffler':
        return <ShufflerPage players={players} groupId={groupId} onSaveDraw={addDraw} />;
      case 'history':
        return <HistoryPage matches={matches} draws={draws} />;
      default:
        return <Scoreboard settings={settings} groupId={groupId} onSaveMatch={addMatch} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />
      
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
