import { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export function usePlayers(groupId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'groups', groupId, 'players');

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const playersList: Player[] = [];
      snapshot.forEach((doc) => {
        playersList.push(doc.data() as Player);
      });
      setPlayers(playersList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}/players`);
    });

    return () => unsubscribe();
  }, [groupId]);

  const addPlayer = async (name: string) => {
    if (!groupId) return;
    const id = crypto.randomUUID();
    const player: Player = { name, active: true, id };
    
    const docRef = doc(db, 'groups', groupId, 'players', id);
    await setDoc(docRef, player)
      .catch(error => handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}/players/${id}`));
  };

  const togglePlayerActive = async (id: string) => {
    if (!groupId) return;
    const player = players.find(p => p.id === id);
    if (!player) return;

    const docRef = doc(db, 'groups', groupId, 'players', id);
    await updateDoc(docRef, { active: !player.active })
      .catch(error => handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}/players/${id}`));
  };

  const deletePlayer = async (id: string) => {
    if (!groupId) return;
    const docRef = doc(db, 'groups', groupId, 'players', id);
    await deleteDoc(docRef)
      .catch(error => handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}/players/${id}`));
  };

  return { players, addPlayer, togglePlayerActive, deletePlayer, loading };
}
