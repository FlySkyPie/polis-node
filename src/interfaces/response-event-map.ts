export interface ResponseEventMap {
  offer: [clientId: string, description: RTCSessionDescriptionInit]
  icecandidate: [clientId: string, candidate: RTCIceCandidateInit]
}
