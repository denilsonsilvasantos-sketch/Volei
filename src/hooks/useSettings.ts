import { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { io, Socket } from 'socket.io-client';

const DEFAULT_SETTINGS: Settings = {
  points_per_set: 25,
  max_sets: 3,
  team_a_color: '#3b82f6', // blue-500
  team_b_color: '#ef4444', // red-500
  team_a_name: 'Time A',
  team_b_name: 'Time B',
  enable_sounds: true,
  enable_voice: true,
};

export function useSettings(groupId: string | null) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    console.log('useSettings: Initializing for groupId:', groupId);
    fetchSettings();

    if (groupId) {
      try {
        const socket = io();
        socketRef.current = socket;
        socket.emit('join-group', groupId + '_settings');
        socket.on('sync-state', (newState: Settings) => {
          console.log('useSettings: Received sync-state:', newState);
          isRemoteUpdate.current = true;
          hasSynced.current = true;
          setSettings(newState);
          try {
            localStorage.setItem('voley_settings_' + groupId, JSON.stringify(newState));
          } catch (e) {
            console.error('useSettings: Error saving to localStorage:', e);
          }
          setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        const timeout = setTimeout(() => {
          console.log('useSettings: Sync timeout reached');
          hasSynced.current = true;
        }, 1000);

        return () => { 
          console.log('useSettings: Disconnecting socket');
          socket.disconnect(); 
          clearTimeout(timeout);
        };
      } catch (e) {
        console.error('useSettings: Error initializing socket:', e);
        hasSynced.current = true; // Allow local mode if socket fails
      }
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current || loading || !hasSynced.current) return;
    socketRef.current.emit('update-state', { groupId: groupId + '_settings', state: settings });
  }, [settings, groupId]);

  async function fetchSettings() {
    console.log('useSettings: Fetching settings...');
    if (groupId) {
      try {
        const local = localStorage.getItem('voley_settings_' + groupId);
        if (local) {
          const parsed = JSON.parse(local);
          setSettings(parsed);
          console.log('useSettings: Loaded from localStorage:', parsed);
        }
      } catch (e) {
        console.error('useSettings: Error parsing from localStorage:', e);
      }
    }
    setLoading(false);
    console.log('useSettings: Loading set to false');
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (groupId) {
      try {
        localStorage.setItem('voley_settings_' + groupId, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving settings to localStorage:', e);
      }
    }
  };

  return { settings, updateSettings, loading };
}
