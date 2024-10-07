import type { MouseEventHandler, } from "react";
import { useCallback, useEffect, useState } from "react";

import { useSocket } from "../../context/socket-context";
import { ReceiverSession } from "../../session/receiver-session";

import styles from "./styles.module.scss";
import { useIsLock } from "./use-is-lock";

export const MainViewport: React.FC = () => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const { socket } = useSocket();
  const { isLock } = useIsLock({ lockTarget: video });
  // const [isLock, setLock] = useState(false);

  useEffect(() => {
    if (!video || !socket) {
      return;
    }

    const session = new ReceiverSession();
    const stream = new MediaStream();
    video.srcObject = stream;

    session.on("answer", (description) =>
      socket.emit("answer", new RTCSessionDescription(description).toJSON())
    );
    session.on("icecandidate", (candidate) =>
      socket.emit("icecandidate", candidate.toJSON())
    );
    session.on("track", (track) => stream.addTrack(track));

    socket.on("icecandidate", (candidate: RTCIceCandidate) => {
      console.log("[socket]", "icecandidate", candidate);
      session.addIceCandidate(candidate);
    });
    socket.on("offer", (description: RTCSessionDescriptionInit) => {
      console.log("[socket]", "offer", description);
      session.offer(description);
    });

    return () => {
      session.dispose();
      video.srcObject = null;
    };
  }, [socket, video]);

  const handleMouseMove = useCallback<MouseEventHandler>((event) => {
    if (!isLock || !socket) {
      return;
    }

    const { movementX, movementY } = event;
    socket.emit('Spectator.Control.Rotation', {
      movementX,
      movementY
    });
  }, [isLock, socket]);

  return (
    <div className={styles.root}>
      <video
        ref={(ref) => setVideo(ref)}
        className={styles.video}
        autoPlay
        onClick={({ currentTarget }) => currentTarget.requestPointerLock()}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};
