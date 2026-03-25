import { useState, useEffect, useRef } from 'react';
import { Match, Draw } from '../types';
import { io, Socket } from 'socket.io-client';

export function useHistory(groupId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (groupId) {
      const localMatches = JSON.parse(localStorage.getItem('voley_matches_' + groupId) || '[]');
      const localDraws = JSON.parse(localStorage.getItem('voley_draws_' + groupId) || '[]');
      setMatches(localMatches);
      setDraws(localDraws);

      const socket = io();
      socketRef.current = socket;
      socket.emit('join-group', groupId + '_history');
      
      socket.on('sync-state', (newState: { matches: Match[], draws: Draw[] }) => {
        isRemoteUpdate.current = true;
        hasSynced.current = true;
        if (newState.matches) {
          setMatches(newState.matches);
          localStorage.setItem('voley_matches_' + groupId, JSON.stringify(newState.matches));
        }
        if (newState.draws) {
          setDraws(newState.draws);
          localStorage.setItem('voley_draws_' + groupId, JSON.stringify(newState.draws));
        }
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      });

      const timeout = setTimeout(() => {
        hasSynced.current = true;
      }, 1000);

      return () => { 
        socket.disconnect(); 
        clearTimeout(timeout);
      };
    }
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current || loading || !hasSynced.current) return;
    socketRef.current.emit('update-state', { 
      groupId: groupId + '_history', 
      state: { matches, draws } 
    });
  }, [matches, draws, groupId]);

  const addMatch = (match: Match) => {
    const updated = [match, ...matches];
    setMatches(updated);
    if (groupId) localStorage.setItem('voley_matches_' + groupId, JSON.stringify(updated));
  };

  const addDraw = (draw: Draw) => {
    const updated = [draw, ...draws];
    setDraws(updated);
    if (groupId) localStorage.setItem('voley_draws_' + groupId, JSON.stringify(updated));
  };

  return { matches, draws, addMatch, addDraw, loading };
}
