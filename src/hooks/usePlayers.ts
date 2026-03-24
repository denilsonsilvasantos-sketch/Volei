import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Player } from '../types';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    if (!isSupabaseConfigured) {
      const local = localStorage.getItem('voley_players');
      if (local) setPlayers(JSON.parse(local));
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (data) setPlayers(data);
    setLoading(false);
  }

  const addPlayer = async (name: string) => {
    const newPlayer = { name, active: true };
    if (!isSupabaseConfigured) {
      const updated = [...players, { ...newPlayer, id: crypto.randomUUID() }];
      setPlayers(updated);
      localStorage.setItem('voley_players', JSON.stringify(updated));
      return;
    }

    await supabase.from('players').insert([newPlayer]);
    fetchPlayers();
  };

  const togglePlayerActive = async (id: string) => {
    const player = players.find(p => p.id === id);
    if (!player) return;

    const updatedPlayers = players.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    );
    setPlayers(updatedPlayers);

    if (!isSupabaseConfigured) {
      localStorage.setItem('voley_players', JSON.stringify(updatedPlayers));
      return;
    }

    await supabase.from('players').update({ active: !player.active }).eq('id', id);
  };

  const deletePlayer = async (id: string) => {
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);

    if (!isSupabaseConfigured) {
      localStorage.setItem('voley_players', JSON.stringify(updated));
      return;
    }

    await supabase.from('players').delete().eq('id', id);
  };

  return { players, addPlayer, togglePlayerActive, deletePlayer, loading };
}
