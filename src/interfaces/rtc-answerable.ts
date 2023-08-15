export interface IRTCAnswerableEventMap {
  answer: [RTCSessionDescriptionInit];
  icecandidate: [RTCIceCandidate];
}

/**
 * The interface from WebRTC connection handler perspect.
 */
export interface IRTCAnswerable {
  on<K extends keyof IRTCAnswerableEventMap>(
    type: K,
    listener: (...arg: IRTCAnswerableEventMap[K]) => void
  ): void;

  offer(value: RTCSessionDescriptionInit): void;

  addIceCandidate(candidate: RTCIceCandidate): void;
}
