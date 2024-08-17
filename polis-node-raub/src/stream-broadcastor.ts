import { RTCSessionDescription } from 'wrtc';

import type { ISpectatorServer } from './interfaces/spectator-server.intercace'
import type { IStreamBroadcastor } from './interfaces/stream-broadcastor.interface'
import { TransmitterSession } from './transmitter-session'

const PRINT_LOG = false

export class StreamBroadcastor implements IStreamBroadcastor {
  private sessions = new Map<string, TransmitterSession>()

  private server: ISpectatorServer | null = null;

  constructor(private stream: MediaStream) {
    // window.requestEventEmitter.on('disconnect', this.handeDisconnect)
    // window.requestEventEmitter.on('connection', this.handleConnection)
    // window.requestEventEmitter.on('answer', this.handleAnswer)
    // window.requestEventEmitter.on('icecandidate', this.handleIcecandidate)
  }

  public setAnswerable(server: ISpectatorServer) {
    this.server = server;
  }

  public disconnect(clientId: string): void {
    PRINT_LOG && console.log('[Browser]', 'disconnect', clientId)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    session.dispose()
    this.sessions.delete(clientId)
  }

  public connection(clientId: string): void {
    if (!this.server) {
      return;
    }

    const server = this.server;

    PRINT_LOG && console.log('[Browser', 'connection', clientId)

    const transmitter = new TransmitterSession();

    transmitter.on('icecandidate', (candidate) => {
      PRINT_LOG &&
        console.log('[transmitter->responseEventEmitter]', 'icecandidate', clientId, candidate);

      server.icecandidate(clientId, candidate);
      // window.responseEventEmitter.emit('icecandidate', clientId, candidate.toJSON())
    });

    transmitter.on('offer', (description) => {
      PRINT_LOG &&
        console.log('[transmitter->responseEventEmitter]', 'offer', clientId, description)

      server.offer(
        clientId,
        new RTCSessionDescription(description as any) as any);
      // window.responseEventEmitter.emit(
      //   'offer',
      //   clientId,
      //   new RTCSessionDescription(description).toJSON()
      // )
    })

    transmitter.attach(this.stream)
    transmitter.start()

    this.sessions.set(clientId, transmitter)
  }

  public answer(clientId: string, description: RTCSessionDescriptionInit): void {
    PRINT_LOG && console.log('[Browser]', 'answer', description)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }
    PRINT_LOG && console.log('[Session]', 'answer', description)
    session.answer(description)
  }

  public icecandidate(clientId: string, candidate: RTCIceCandidate): void {
    PRINT_LOG && console.log('[Browser', 'icecandidate', candidate)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    PRINT_LOG && console.log('[Session]', 'addIceCandidate', candidate)
    session.addIceCandidate(candidate)
  }
}
