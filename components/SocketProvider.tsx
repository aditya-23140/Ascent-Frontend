"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (socketRef.current) {
        console.log("SocketProvider: User signed out, disconnecting WebSocket.");
        disconnectSocket();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let reconnectTimer: NodeJS.Timeout;
    let reconnectAttempts = 0;

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        console.log("SocketProvider: Initializing native WebSocket.");
        const socket = getSocket(token);
        socketRef.current = socket;

        const onOpen = () => {
          console.log("SocketProvider: WebSocket connected.");
          setIsConnected(true);
          reconnectAttempts = 0;
        };

        const onClose = () => {
          console.log("SocketProvider: WebSocket disconnected.");
          setIsConnected(false);
          // Auto-reconnect with backoff
          const backoff = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts++;
          console.log(`SocketProvider: Attempting to reconnect in ${backoff}ms (Attempt ${reconnectAttempts})`);
          reconnectTimer = setTimeout(() => {
            initSocket();
          }, backoff);
        };

        const onError = (e: Event) => {
          console.error("SocketProvider: WebSocket error:", e);
          setIsConnected(false);
        };

        socket.addEventListener("open", onOpen);
        socket.addEventListener("close", onClose);
        socket.addEventListener("error", onError);

        // Check current state in case it connected instantly
        if (socket.readyState === WebSocket.OPEN) {
          setIsConnected(true);
        }

        return () => {
          socket.removeEventListener("open", onOpen);
          socket.removeEventListener("close", onClose);
          socket.removeEventListener("error", onError);
        };
      } catch (error) {
        console.error("SocketProvider error:", error);
      }
    };

    let cleanupFn: (() => void) | undefined;
    initSocket().then((fn) => { cleanupFn = fn; });

    return () => {
      clearTimeout(reconnectTimer);
      if (cleanupFn) cleanupFn();
    };
  }, [isSignedIn, getToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};









