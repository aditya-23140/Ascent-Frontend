"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useAuth, useUser } from "@clerk/nextjs";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface SocketContextType {
  socket: Socket | null;
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
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (socketRef.current) {
        console.log("SocketProvider: User signed out, disconnecting socket.");
        disconnectSocket();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const initSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        console.log("SocketProvider: Initializing global socket.");
        const socket = getSocket(token);
        socketRef.current = socket;

        if (!socket.connected) {
          socket.connect();
        }

        const onConnect = () => {
          console.log("SocketProvider: Socket connected ID:", socket.id);
          setIsConnected(true);
        };

        const onDisconnect = () => {
          console.log("SocketProvider: Socket disconnected.");
          setIsConnected(false);
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        // Set initial state if already connected
        if (socket.connected) {
          setIsConnected(true);
        }

        return () => {
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
        };
      } catch (error) {
        console.error("SocketProvider error:", error);
      }
    };

    const cleanup = initSocket();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, [isSignedIn, getToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
