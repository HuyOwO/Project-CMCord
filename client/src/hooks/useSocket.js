import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export default function useSocket() {
  return useContext(SocketContext)?.socket;
}

export function useOnlineUsers() {
  return useContext(SocketContext)?.onlineUsers ?? new Set();
<<<<<<< HEAD
}
=======
}
>>>>>>> milestone2-import
