import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsType } from '../types';
import { Save, Palette } from 'lucide-react';

interface SettingsPageProps {
  settings: SettingsType;
  onUpdate: (settings: Partial<SettingsType>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState(settings);

  // Update local form if settings change from server
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="p-6 pt-20 md:pt-6 max-w-2xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Configurações</h1>
        <p className="text-slate-400 max-w-md mx-auto">Personalize as regras e o visual da sua partida de vôlei.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Pontos por Set</label>
              <input 
                type="number"
                value={formData.points_per_set}
                onChange={e => setFormData({ ...formData, points_per_set: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Máximo de Sets (Melhor de...)</label>
              <select 
                value={formData.max_sets}
                onChange={e => setFormData({ ...formData, max_sets: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value={1}>1 Set</option>
                <option value={3}>3 Sets</option>
                <option value={5}>5 Sets</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Palette size={20} className="text-orange-500" />
            Personalização de Times
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nome Time A</label>
                <input 
                  type="text"
                  value={formData.team_a_name}
                  onChange={e => setFormData({ ...formData, team_a_name: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Cor Time A</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={formData.team_a_color}
                    onChange={e => setFormData({ ...formData, team_a_color: e.target.value })}
                    className="h-12 w-20 bg-transparent border-none cursor-pointer"
                  />
                  <div className="flex-1 h-12 rounded-xl border border-white/10" style={{ backgroundColor: formData.team_a_color }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nome Time B</label>
                <input 
                  type="text"
                  value={formData.team_b_name}
                  onChange={e => setFormData({ ...formData, team_b_name: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Cor Time B</label>
                <div className="flex gap-2">
                  <input 
                    type="color"
                    value={formData.team_b_color}
                    onChange={e => setFormData({ ...formData, team_b_color: e.target.value })}
                    className="h-12 w-20 bg-transparent border-none cursor-pointer"
                  />
                  <div className="flex-1 h-12 rounded-xl border border-white/10" style={{ backgroundColor: formData.team_b_color }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={20} />
          Salvar Alterações
        </motion.button>
      </form>
    </div>
  );
};
