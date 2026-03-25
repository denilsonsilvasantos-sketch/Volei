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
    console.log('useHistory: Initializing for groupId:', groupId);
    if (groupId) {
      try {
        const localMatches = JSON.parse(localStorage.getItem('voley_matches_' + groupId) || '[]');
        const localDraws = JSON.parse(localStorage.getItem('voley_draws_' + groupId) || '[]');
        setMatches(localMatches);
        setDraws(localDraws);
        console.log('useHistory: Loaded from localStorage');
      } catch (e) {
        console.error('useHistory: Error parsing from localStorage:', e);
      }

      try {
        const socket = io();
        socketRef.current = socket;
        socket.emit('join-group', groupId + '_history');
        
        socket.on('sync-state', (newState: { matches: Match[], draws: Draw[] }) => {
          console.log('useHistory: Received sync-state:', newState);
          isRemoteUpdate.current = true;
          hasSynced.current = true;
          if (newState.matches) {
            setMatches(newState.matches);
            try {
              localStorage.setItem('voley_matches_' + groupId, JSON.stringify(newState.matches));
            } catch (e) {
              console.error('useHistory: Error saving matches to localStorage:', e);
            }
          }
          if (newState.draws) {
            setDraws(newState.draws);
            try {
              localStorage.setItem('voley_draws_' + groupId, JSON.stringify(newState.draws));
            } catch (e) {
              console.error('useHistory: Error saving draws to localStorage:', e);
            }
          }
          setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        const timeout = setTimeout(() => {
          console.log('useHistory: Sync timeout reached');
          hasSynced.current = true;
        }, 1000);

        return () => { 
          console.log('useHistory: Disconnecting socket');
          socket.disconnect(); 
          clearTimeout(timeout);
        };
      } catch (e) {
        console.error('useHistory: Error initializing socket:', e);
        hasSynced.current = true;
      }
    }
    setLoading(false);
    console.log('useHistory: Loading set to false');
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
    if (groupId) {
      try {
        localStorage.setItem('voley_matches_' + groupId, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving matches to localStorage:', e);
      }
    }
  };

  const addDraw = (draw: Draw) => {
    const updated = [draw, ...draws];
    setDraws(updated);
    if (groupId) {
      try {
        localStorage.setItem('voley_draws_' + groupId, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving draws to localStorage:', e);
      }
    }
  };

  return { matches, draws, addMatch, addDraw, loading };
}
