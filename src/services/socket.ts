import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://example-chatorder-socket.local';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity
    });
  }
  return socket;
};
