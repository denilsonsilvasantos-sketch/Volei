import { useState, useEffect, useRef } from 'react';
import { Match, Draw } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';

export function useHistory(groupId: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setLoading(false);
      return;
    }

    const matchesCol = collection(db, 'groups', groupId, 'matches');
    const matchesQuery = query(matchesCol, orderBy('created_at', 'desc'));

    const unsubscribeMatches = onSnapshot(matchesQuery, (snapshot) => {
      const matchesList: Match[] = [];
      snapshot.forEach((doc) => {
        matchesList.push(doc.data() as Match);
      });
      setMatches(matchesList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}/matches`);
    });

    const drawsCol = collection(db, 'groups', groupId, 'draws');
    const drawsQuery = query(drawsCol, orderBy('created_at', 'desc'));

    const unsubscribeDraws = onSnapshot(drawsQuery, (snapshot) => {
      const drawsList: Draw[] = [];
      snapshot.forEach((doc) => {
        drawsList.push(doc.data() as Draw);
      });
      setDraws(drawsList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}/draws`);
    });

    return () => {
      unsubscribeMatches();
      unsubscribeDraws();
    };
  }, [groupId]);

  const addMatch = async (match: Match) => {
    if (!groupId) return;
    const docRef = doc(db, 'groups', groupId, 'matches', match.id);
    await setDoc(docRef, match)
      .catch(error => handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}/matches/${match.id}`));
  };

  const addDraw = async (draw: Draw) => {
    if (!groupId) return;
    const docRef = doc(db, 'groups', groupId, 'draws', draw.id);
    await setDoc(docRef, draw)
      .catch(error => handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}/draws/${draw.id}`));
  };

  return { matches, draws, addMatch, addDraw, loading };
}
