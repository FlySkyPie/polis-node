import type { Socket } from 'socket.io-client'
import { create } from 'zustand'
import { io } from 'socket.io-client'

interface ISocketStore {
    socket?: Socket;
    connect: () => void;
}

export const useSokcetStore = create<ISocketStore>()(
    (set) => ({
        connect: () => set(({ socket }) => {
            if (socket) {
                return {};
            }

            const _socket = import.meta.env.DEV
                ? io(`ws://${import.meta.env.VITE_POLIS_SPECTATOR_WS_URL}`, {})
                : io();

            return { socket: _socket }
        }),
    }),
);
