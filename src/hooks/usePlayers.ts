import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Player } from '../types';
import { io, Socket } from 'socket.io-client';

export function usePlayers(groupId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    fetchPlayers();

    if (groupId) {
      const socket = io();
      socketRef.current = socket;
      socket.emit('join-group', groupId + '_players');
      socket.on('sync-state', (newState: Player[]) => {
        isRemoteUpdate.current = true;
        setPlayers(newState);
        localStorage.setItem('voley_players_' + groupId, JSON.stringify(newState));
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      });
      return () => { socket.disconnect(); };
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current || loading) return;
    socketRef.current.emit('update-state', { groupId: groupId + '_players', state: players });
  }, [players, groupId]);

  async function fetchPlayers() {
    if (groupId) {
      const local = localStorage.getItem('voley_players_' + groupId);
      if (local) setPlayers(JSON.parse(local));
    }
    setLoading(false);
  }

  const addPlayer = async (name: string) => {
    const updated = [...players, { name, active: true, id: crypto.randomUUID() }];
    setPlayers(updated);
    if (groupId) localStorage.setItem('voley_players_' + groupId, JSON.stringify(updated));
  };

  const togglePlayerActive = async (id: string) => {
    const updated = players.map(p => p.id === id ? { ...p, active: !p.active } : p);
    setPlayers(updated);
    if (groupId) localStorage.setItem('voley_players_' + groupId, JSON.stringify(updated));
  };

  const deletePlayer = async (id: string) => {
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    if (groupId) localStorage.setItem('voley_players_' + groupId, JSON.stringify(updated));
  };

  return { players, addPlayer, togglePlayerActive, deletePlayer, loading };
}
