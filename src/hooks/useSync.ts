import { useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export function useSync(groupId: string | null, state: any, onSync: (state: any) => void) {
  const isRemoteUpdate = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!groupId) return;

    const docRef = doc(db, 'groups', groupId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // We only care about the scoreState part for this hook
        if (data.scoreState) {
          isRemoteUpdate.current = true;
          hasSynced.current = true;
          onSync(data.scoreState);
          setTimeout(() => {
            isRemoteUpdate.current = false;
          }, 100);
        }
      } else {
        // If doc doesn't exist, we are the first
        hasSynced.current = true;
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${groupId}`);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    if (!groupId || isRemoteUpdate.current || !hasSynced.current) return;

    const docRef = doc(db, 'groups', groupId);
    
    // Use setDoc with merge to ensure the document exists
    setDoc(docRef, { scoreState: state }, { merge: true })
      .catch(error => handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}`));
  }, [state, groupId]);
}
