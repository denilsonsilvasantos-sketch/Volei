import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, LogIn, Shield } from 'lucide-react';

interface LoginProps {
  onJoin: (groupId: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onJoin }) => {
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId.trim().length < 3) {
      setError('O nome da turma deve ter pelo menos 3 caracteres.');
      return;
    }
    onJoin(groupId.trim().toLowerCase());
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            Dica: Use o mesmo nome para que todos da sua turma vejam os mesmos dados em tempo real.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
