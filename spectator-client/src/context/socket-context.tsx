/* eslint-disable react-refresh/only-export-components */
import type { Socket } from "socket.io-client";
import { createContext, useContext, useMemo, useState } from "react";
import { io } from "socket.io-client";

interface ISocketContext {
  socket?: Socket;
}

const SocketContext = createContext<ISocketContext>({});

export const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket] = useState(() =>
    import.meta.env.DEV
      ? io(`ws://${import.meta.env.VITE_POLIS_SPECTATOR_WS_URL}`)
      : io()
  );

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const { socket } = useContext(SocketContext);

  return { socket };
};
