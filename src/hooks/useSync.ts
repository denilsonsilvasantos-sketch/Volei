import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSync(groupId: string | null, state: any, onSync: (state: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!groupId) return;

    // Connect to the same origin
    const socket = io();
    socketRef.current = socket;

    socket.emit('join-group', groupId);

    socket.on('sync-state', (newState: any) => {
      isRemoteUpdate.current = true;
      onSync(newState);
      // Reset after a short delay to allow state to settle
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });

    return () => {
      socket.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !socketRef.current || isRemoteUpdate.current) return;

    // Emit local changes to the group
    socketRef.current.emit('update-state', { groupId, state });
  }, [state, groupId]);
}
