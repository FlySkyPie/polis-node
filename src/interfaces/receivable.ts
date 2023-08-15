export interface IReceivableEventMap {
  track: [MediaStreamTrack];
}

export interface IReceivable {
  on<K extends keyof IReceivableEventMap>(
    type: K,
    listener: (...arg: IReceivableEventMap[K]) => void
  ): void;
}
