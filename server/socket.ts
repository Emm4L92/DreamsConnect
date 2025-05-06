import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { parse } from "url";

// Create a global clients map for WebSocket connections
declare global {
  var wsClients: Map<number, WebSocket & { userId: number }>;
}

// Initialize global WebSocket client map if it doesn't exist
if (!global.wsClients) {
  global.wsClients = new Map();
}

export function setupWebSockets(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    // Extract user ID from query parameters
    const { query } = parse(req.url || '', true);
    const userId = parseInt(query.userId as string);

    if (isNaN(userId)) {
      console.log('WebSocket connection rejected: No valid userId provided');
      ws.close();
      return;
    }

    console.log(`WebSocket connected for user ${userId}`);

    // Store the client with user ID for future use
    const extendedWs = ws as WebSocket & { userId: number };
    extendedWs.userId = userId;
    global.wsClients.set(userId, extendedWs);

    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Message handlers can be added here if needed
        console.log(`Received message from user ${userId}:`, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      console.log(`WebSocket disconnected for user ${userId}`);
      global.wsClients.delete(userId);
    });
  });

  return wss;
}
