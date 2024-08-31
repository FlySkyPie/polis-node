export interface IStreamBroadcastor {
    disconnect(clientId: string): void;

    connection(clientId: string, stream: MediaStream): void;

    answer(clientId: string, description: RTCSessionDescriptionInit): void;

    icecandidate(clientId: string, candidate: RTCIceCandidate): void;
};
