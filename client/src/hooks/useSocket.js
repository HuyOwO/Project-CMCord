import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export default function useSocket() {
  return useContext(SocketContext)?.socket;
}

export function useOnlineUsers() {
  return useContext(SocketContext)?.onlineUsers ?? new Set();
}

// Milestone 3: map userId -> trạng thái thủ công ('online' | 'idle' | 'away') cập nhật
// real-time. Kết hợp với useOnlineUsers() qua utils/status.js#getEffectiveStatus để ra
// trạng thái hiển thị cuối cùng.
export function useUserStatuses() {
  return useContext(SocketContext)?.userStatuses ?? new Map();
}
