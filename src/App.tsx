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
import { testSupabaseConnection } from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('scoreboard');
  const [groupId, setGroupId] = useState<string | null>(localStorage.getItem('voley_group_id'));
  const [forceLoad, setForceLoad] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  const { settings, updateSettings, loading: settingsLoading } = useSettings(groupId);
  const { players, addPlayer, togglePlayerActive, deletePlayer, loading: playersLoading } = usePlayers(groupId);
  const { matches, draws, addMatch, addDraw, loading: historyLoading } = useHistory(groupId);

  useEffect(() => {
    console.log('App: Loading States - Settings:', settingsLoading, 'Players:', playersLoading, 'History:', historyLoading, 'ForceLoad:', forceLoad);
  }, [settingsLoading, playersLoading, historyLoading, forceLoad]);

  useEffect(() => {
    if (groupId) {
      console.log('App: Testing Supabase connection...');
      testSupabaseConnection().then(result => {
        setSupabaseStatus(result.message);
        console.log('App: Supabase Status:', result);
      });
    }
  }, [groupId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (settingsLoading || playersLoading || historyLoading) {
        console.warn('Loading taking too long, enabling force load option');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [settingsLoading, playersLoading, historyLoading]);

  const handleJoin = (id: string) => {
    setGroupId(id);
    localStorage.setItem('voley_group_id', id);
  };

  const handleLogout = () => {
    setGroupId(null);
    localStorage.removeItem('voley_group_id');
  };

  if (!groupId) {
    return <Login onJoin={handleJoin} />;
  }

  if ((settingsLoading || playersLoading || historyLoading) && !forceLoad) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-2">
            <p className="text-slate-200 font-medium text-xl">Preparando a quadra...</p>
            <p className="text-slate-500 text-sm">Sincronizando dados com o grupo: <span className="text-orange-400 font-mono">{groupId}</span></p>
          </div>
          
          <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800 w-full">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Status do Sistema</p>
            <div className="space-y-1 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Configurações:</span>
                <span className={settingsLoading ? "text-orange-400 animate-pulse" : "text-emerald-400"}>{settingsLoading ? "Carregando..." : "Pronto"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Jogadores:</span>
                <span className={playersLoading ? "text-orange-400 animate-pulse" : "text-emerald-400"}>{playersLoading ? "Carregando..." : "Pronto"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Histórico:</span>
                <span className={historyLoading ? "text-orange-400 animate-pulse" : "text-emerald-400"}>{historyLoading ? "Carregando..." : "Pronto"}</span>
              </div>
              {supabaseStatus && (
                <div className="flex justify-between text-xs pt-1 border-t border-slate-800 mt-1">
                  <span className="text-slate-400">Supabase:</span>
                  <span className={supabaseStatus.includes('successfully') ? "text-emerald-400" : "text-orange-400"}>{supabaseStatus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button 
              onClick={() => {
                console.log('App: Force loading triggered');
                setForceLoad(true);
              }}
              className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            >
              Entrar de qualquer forma
            </button>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 text-xs transition-colors"
            >
              Sair desta turma e tentar outra
            </button>
          </div>
          <p className="mt-2 text-slate-500 text-[10px] uppercase tracking-widest">
            Use esta opção se a sincronização estiver demorando
          </p>
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
