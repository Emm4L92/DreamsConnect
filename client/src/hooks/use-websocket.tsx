import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./use-auth";

type WebSocketContextType = {
  send: (message: any) => void;
  lastMessage: any;
  readyState: number;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  // Create default context values
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Safe auth checking
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.log("Auth context not available yet, WebSocket will connect when auth is ready");
  }

  useEffect(() => {
    // Don't try to connect if we're not authenticated yet
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
      
      console.log(`Attempting to connect WebSocket to: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        setReadyState(WebSocket.OPEN);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        setReadyState(WebSocket.CLOSED);
      };

      socket.onerror = (error) => {
        console.error("WebSocket connection error:", error);
      };

      return () => {
        socket.close();
      };
    } catch (error) {
      console.error("Error setting up WebSocket connection:", error);
    }
  }, [user]);

  const send = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ send, lastMessage, readyState }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
