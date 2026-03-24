import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  points_per_set: 25,
  max_sets: 3,
  team_a_color: '#3b82f6', // blue-500
  team_b_color: '#ef4444', // red-500
  team_a_name: 'Time A',
  team_b_name: 'Time B',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      if (!isSupabaseConfigured) {
        const local = localStorage.getItem('voley_settings');
        if (local) setSettings(JSON.parse(local));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (data) {
        setSettings(data);
      } else if (error && error.code === 'PGRST116') {
        // No settings found, create default
        await supabase.from('settings').insert([DEFAULT_SETTINGS]);
      }
      setLoading(false);
    }

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (!isSupabaseConfigured) {
      localStorage.setItem('voley_settings', JSON.stringify(updated));
      return;
    }

    await supabase.from('settings').upsert(updated);
  };

  return { settings, updateSettings, loading };
}
