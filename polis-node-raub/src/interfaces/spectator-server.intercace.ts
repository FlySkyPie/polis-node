export interface ISpectatorServer {
    icecandidate(clientId: string, candidate: RTCIceCandidate): void;

    offer(clientId: string, description: RTCSessionDescription): void;
};
