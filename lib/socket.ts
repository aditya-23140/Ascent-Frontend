let socket: WebSocket | null = null;

export const getSocket = (token?: string): WebSocket => {
  // If socket exists and is not closing or closed, return it
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Convert http(s) to ws(s)
  const wsUrl = apiUrl.replace(/^http/, 'ws') + `?token=${token}`;
  
  console.log(`Connecting to WebSocket: ${wsUrl.split('?')[0]}`);
  socket = new WebSocket(wsUrl);

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting WebSocket...");
    socket.close();
    socket = null;
  }
};
