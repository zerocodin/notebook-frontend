import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Derive socket URL from API URL. Fallback is explicit.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // try websocket first
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('[socket] connected', socket.id, '→', socketUrl);
      socket.emit('register', user.id);
      setConnected(true);
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error:', err.message, '→', socketUrl);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);