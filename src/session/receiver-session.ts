import type {
  IRTCAnswerable,
  IRTCAnswerableEventMap,
} from "../interfaces/rtc-answerable";
import type { IReceivable, IReceivableEventMap } from "../interfaces/receivable";
import { TypedEventEmitter } from "../utilities/typed-event-emitter";

type IEventMap = IRTCAnswerableEventMap & IReceivableEventMap;

export class ReceiverSession implements IReceivable, IRTCAnswerable {
  private peerConnection = new RTCPeerConnection();
  private eventEmitter = new TypedEventEmitter<IEventMap>();

  constructor() {
    this.peerConnection.addEventListener(
      "icecandidate",
      this.handleIceCandidate
    );

    this.peerConnection.addEventListener("track", this.handleTrack);
  }

  public offer(value: RTCSessionDescriptionInit): void {
    this.peerConnection.setRemoteDescription(value)
    this.peerConnection.createAnswer().then((asnwer) => {
      this.peerConnection.setLocalDescription(asnwer)
      this.eventEmitter.emit("answer", asnwer);
    });
  }

  public addIceCandidate(candidate: RTCIceCandidateInit) {
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public on<K extends keyof IEventMap>(
    type: K,
    listener: (...eventArg: IEventMap[K]) => void
  ): void {
    this.eventEmitter.on(type, listener);
  }

  public dispose() {
    this.peerConnection.close();
    this.peerConnection.removeEventListener("track", this.handleTrack);
    this.peerConnection.removeEventListener(
      "icecandidate",
      this.handleIceCandidate
    );
    this.eventEmitter.removeAllListeners();
  }

  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    const { candidate } = event;
    candidate && this.eventEmitter.emit("icecandidate", candidate);
  };

  private handleTrack = ({ track }: RTCTrackEvent) => {
    this.eventEmitter.emit("track", track);
  };
}
