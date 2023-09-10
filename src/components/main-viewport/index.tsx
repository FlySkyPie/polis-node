import { useEffect, useState } from "react";

import { useSocket } from "../../context/socket-context";
import { ReceiverSession } from "../../session/receiver-session";

import styles from "./styles.module.scss";

export const MainViewport: React.FC = () => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const { socket } = useSocket();

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

  return (
    <div className={styles.root}>
      <video ref={(ref) => setVideo(ref)} className={styles.video} autoPlay />
    </div>
  );
};
