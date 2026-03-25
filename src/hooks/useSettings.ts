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

  useEffect(() => {
    fetchSettings();

    if (groupId) {
      const socket = io();
      socketRef.current = socket;
      socket.emit('join-group', groupId + '_settings');
      socket.on('sync-state', (newState: Settings) => {
        isRemoteUpdate.current = true;
        setSettings(newState);
        localStorage.setItem('voley_settings_' + groupId, JSON.stringify(newState));
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      });
      return () => { socket.disconnect(); };
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current || loading) return;
    socketRef.current.emit('update-state', { groupId: groupId + '_settings', state: settings });
  }, [settings, groupId]);

  async function fetchSettings() {
    if (groupId) {
      const local = localStorage.getItem('voley_settings_' + groupId);
      if (local) setSettings(JSON.parse(local));
    }
    setLoading(false);
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (groupId) localStorage.setItem('voley_settings_' + groupId, JSON.stringify(updated));
  };

  return { settings, updateSettings, loading };
}
