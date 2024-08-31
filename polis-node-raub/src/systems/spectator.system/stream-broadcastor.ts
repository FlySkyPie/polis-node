import { RTCSessionDescription } from 'wrtc';

import type { ISpectatorServer } from './spectator-server.interface'
import type { IStreamBroadcastor } from './stream-broadcastor.interface'
import { TransmitterSession } from './transmitter-session'

export class StreamBroadcastor implements IStreamBroadcastor {
  private sessions = new Map<string, TransmitterSession>()

  private server: ISpectatorServer | null = null;

  constructor() { }

  public setAnswerable(server: ISpectatorServer) {
    this.server = server;
  }

  public disconnect(clientId: string): void {
    console.log('[Browser]', 'disconnect', clientId)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    session.dispose()
    this.sessions.delete(clientId)
  }

  public connection(clientId: string, stream: MediaStream): void {
    if (!this.server) {
      return;
    }

    const server = this.server;

    console.log('[Browser', 'connection', clientId);

    const transmitter = new TransmitterSession();

    transmitter.on('icecandidate', (candidate) => {

      console.log('[transmitter->responseEventEmitter]', 'icecandidate', clientId, candidate);

      server.icecandidate(clientId, candidate);
    });

    transmitter.on('offer', (description) => {

      console.log('[transmitter->responseEventEmitter]', 'offer', clientId, description);

      server.offer(
        clientId,
        new RTCSessionDescription(description as any) as any);
    })

    transmitter.attach(stream);
    transmitter.start();

    this.sessions.set(clientId, transmitter);
  }

  public answer(clientId: string, description: RTCSessionDescriptionInit): void {
    console.log('[Browser]', 'answer', description);

    const session = this.sessions.get(clientId);
    if (!session) {
      throw new Error();
    }
    console.log('[Session]', 'answer', description);
    session.answer(description);
  }

  public icecandidate(clientId: string, candidate: RTCIceCandidate): void {
    console.log('[Browser', 'icecandidate', candidate);

    const session = this.sessions.get(clientId);
    if (!session) {
      throw new Error();
    }

    console.log('[Session]', 'addIceCandidate', candidate);
    session.addIceCandidate(candidate);
  }
}
