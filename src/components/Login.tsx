import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, LogIn, Shield, LogOut } from 'lucide-react';
import { auth, signInWithGoogle } from '../firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

interface LoginProps {
  onJoin: (groupId: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onJoin }) => {
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao entrar com Google. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logado com o Google primeiro.');
      return;
    }
    if (groupId.trim().length < 3) {
      setError('O nome da turma deve ter pelo menos 3 caracteres.');
      return;
    }
    onJoin(groupId.trim().toLowerCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20 rotate-3">
            <Users size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Vôlei Pro</h1>
          <p className="text-slate-400">Entre no nome da sua turma para sincronizar o placar e sorteios.</p>
        </div>

        {!user ? (
          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Entrar com Google
            </button>
            <p className="text-xs text-slate-500 text-center">
              O login com Google é necessário para manter seus dados seguros e sincronizados entre dispositivos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/10" />
                <span className="text-sm text-white font-medium truncate max-w-[150px]">{user.displayName}</span>
              </div>
              <button 
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Nome da Turma</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text"
                  placeholder="Ex: TerçaNoite, AmigosVolei..."
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-800 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
            </div>

            <button 
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogIn size={20} />
              Entrar na Turma
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            Dica: Use o mesmo nome para que todos da sua turma vejam os mesmos dados em tempo real.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
