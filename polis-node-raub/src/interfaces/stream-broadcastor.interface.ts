export interface IStreamBroadcastor {
    disconnect(clientId: string): void;

    connection(clientId: string): void;

    answer(clientId: string, description: RTCSessionDescriptionInit): void;

    icecandidate(clientId: string, candidate: RTCIceCandidate): void;
};
