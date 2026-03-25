import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSync(groupId: string | null, state: any, onSync: (state: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!groupId) return;

    // Connect to the same origin
    const socket = io();
    socketRef.current = socket;

    socket.emit('join-group', groupId);

    socket.on('sync-state', (newState: any) => {
      isRemoteUpdate.current = true;
      hasSynced.current = true;
      onSync(newState);
      // Reset after a short delay to allow state to settle
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });

    // If no sync received after 1s, assume we are the first and can start syncing
    const timeout = setTimeout(() => {
      hasSynced.current = true;
    }, 1000);

    return () => {
      socket.disconnect();
      clearTimeout(timeout);
    };
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current || !hasSynced.current) return;

    // Emit local changes to the group
    socketRef.current.emit('update-state', { groupId, state });
  }, [state, groupId]);
}
