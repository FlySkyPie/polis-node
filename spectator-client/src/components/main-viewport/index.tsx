import type { MouseEventHandler, } from "react";
import { useCallback, useEffect, useState } from "react";
import { useKeyPress } from "react-use";

import { EventType } from "@packages/spectator-protocol";

import { useSocket } from "../../context/socket-context";
import { ReceiverSession } from "../../session/receiver-session";

import styles from "./styles.module.scss";
import { useIsLock } from "./use-is-lock";

export const MainViewport: React.FC = () => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const { socket } = useSocket();
  const { isLock } = useIsLock({ lockTarget: video });
  const [isWPressed] = useKeyPress('w');
  const [isSPressed] = useKeyPress('s');
  const [isAPressed] = useKeyPress('a');
  const [isDPressed] = useKeyPress('d');

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (isWPressed && !isSPressed) {
      socket.emit(EventType.SpectatorControlMovment, {
        forward: 'forward',
      });
      return;
    }

    if (!isWPressed && isSPressed) {
      socket.emit(EventType.SpectatorControlMovment, {
        forward: 'backward',
      });
      return;
    }

    socket.emit(EventType.SpectatorControlMovment, {
      forward: null,
    });
  }, [socket, isWPressed, isSPressed,]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (isAPressed && !isDPressed) {
      socket.emit(EventType.SpectatorControlMovment, {
        sidemove: 'left',
      });
      return;
    }

    if (!isAPressed && isDPressed) {
      socket.emit(EventType.SpectatorControlMovment, {
        sidemove: 'right',
      });
      return;
    }

    socket.emit(EventType.SpectatorControlMovment, {
      sidemove: null,
    });
  }, [socket, isAPressed, isDPressed,]);

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
    socket.emit(EventType.SpectatorControlRotation, {
      moveAzimuthAngle: - movementX * 0.002,
      movePolarAngle: movementY * 0.002,
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
