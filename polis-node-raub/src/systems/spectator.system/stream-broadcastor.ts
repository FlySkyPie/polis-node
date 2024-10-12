import { RTCSessionDescription } from 'wrtc';

import type { ISpectatorServer } from './interfaces/spectator-server.interface'
import type { IStreamBroadcastor } from './interfaces/stream-broadcastor.interface'
import { TransmitterSession } from './transmitter-session'
import { logger } from '../../utilities/logger';

export class StreamBroadcastor implements IStreamBroadcastor {
  private sessions = new Map<string, TransmitterSession>()

  private server: ISpectatorServer | null = null;

  constructor() { }

  public setAnswerable(server: ISpectatorServer) {
    this.server = server;
  }

  public disconnect(clientId: string): void {
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
    const transmitter = new TransmitterSession();

    transmitter.on('icecandidate', (candidate) => {
      logger.debug(`[transmitter->responseEventEmitter] icecandidate`, clientId, candidate);

      server.icecandidate(clientId, candidate);
    });

    transmitter.on('offer', (description) => {
      logger.debug(`[transmitter->responseEventEmitter] offer`, clientId, description);

      server.offer(
        clientId,
        new RTCSessionDescription(description as any) as any);
    })

    transmitter.attach(stream);
    transmitter.start();

    this.sessions.set(clientId, transmitter);
  }

  public answer(clientId: string, description: RTCSessionDescriptionInit): void {
    logger.debug(`[Browser] answer`, description);

    const session = this.sessions.get(clientId);
    if (!session) {
      throw new Error();
    }
    logger.debug(`[Session] answer`, description);
    session.answer(description);
  }

  public icecandidate(clientId: string, candidate: RTCIceCandidate): void {
    logger.debug(`[Browser] icecandidate`, candidate);

    const session = this.sessions.get(clientId);
    if (!session) {
      throw new Error();
    }

    logger.debug(`[Session] addIceCandidate`, candidate);
    session.addIceCandidate(candidate);
  }
}
