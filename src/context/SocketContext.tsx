import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface NotificationData {
  type: string;
  message: string;
  data: any;
  timestamp: string;
  id: string; // Unique ID for UI rendering
}

interface SocketContextType {
  socket: Socket | null;
  notifications: NotificationData[];
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  clearNotifications: () => {},
  markAsRead: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Assuming backend is on port 5000 as per other configurations
    // The exact URL might differ based on environment variables
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected to backend');
      newSocket.emit('joinAdmin');
    });

    newSocket.on('adminNotification', (data: any) => {
      console.log('Received admin notification:', data);
      
      const newNotification = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substring(7)
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Play ting sound
      try {
        const audio = new Audio('/ting.mp3'); // Assuming ting.mp3 is placed in public folder
        audio.play().catch(e => console.error("Audio play failed:", e));
      } catch (err) {
        console.error("Error playing sound", err);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearNotifications = () => setNotifications([]);
  
  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications, markAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
