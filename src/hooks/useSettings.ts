import { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  const isRemoteUpdate = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'groups', groupId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.settings) {
          isRemoteUpdate.current = true;
          hasSynced.current = true;
          setSettings(data.settings);
          setTimeout(() => {
            isRemoteUpdate.current = false;
          }, 100);
        }
      } else {
        hasSynced.current = true;
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}`);
    });

    return () => unsubscribe();
  }, [groupId]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!groupId) return;
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    const docRef = doc(db, 'groups', groupId);
    await setDoc(docRef, { settings: updated }, { merge: true })
      .catch(error => handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}`));
  };

  return { settings, updateSettings, loading };
}
