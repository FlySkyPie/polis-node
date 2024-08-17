export interface RequestEventMap {
  connection: [clientId: string]
  disconnect: [clientId: string]
  answer: [clientId: string, description: RTCSessionDescriptionInit]
  icecandidate: [clientId: string, candidate: RTCIceCandidate]
}
