export interface IRTCOfferableEventMap {
  offer: [RTCSessionDescriptionInit];
  icecandidate: [RTCIceCandidate];
}

/**
 * The interface from WebRTC connection handler perspect.
 */
export interface IRTCOfferable {
  on<K extends keyof IRTCOfferableEventMap>(
    type: K,
    listener: (...arg: IRTCOfferableEventMap[K]) => void
  ): void;

  answer(value: RTCSessionDescriptionInit): void;

  addIceCandidate(candidate: RTCIceCandidateInit): void;
}
