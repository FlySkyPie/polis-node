import { TransmitterSession } from './transmitter-session'

const PRINT_LOG = false

export class StreamBroadcastor {
  private sessions = new Map<string, TransmitterSession>()

  constructor(private stream: MediaStream) {
    window.requestEventEmitter.on('disconnect', this.handeDisconnect)
    window.requestEventEmitter.on('connection', this.handleConnection)
    window.requestEventEmitter.on('answer', this.handleAnswer)
    window.requestEventEmitter.on('icecandidate', this.handleIcecandidate)
  }

  private handeDisconnect = (clientId: string): void => {
    PRINT_LOG && console.log('[Browser]', 'disconnect', clientId)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    session.dispose()
    this.sessions.delete(clientId)
  }

  private handleConnection = (clientId: string): void => {
    PRINT_LOG && console.log('[Browser', 'connection', clientId)

    const transmitter = new TransmitterSession()

    transmitter.on('icecandidate', (candidate) => {
      PRINT_LOG &&
        console.log('[transmitter->responseEventEmitter]', 'icecandidate', clientId, candidate)
      window.responseEventEmitter.emit('icecandidate', clientId, candidate.toJSON())
    })
    transmitter.on('offer', (description) => {
      PRINT_LOG &&
        console.log('[transmitter->responseEventEmitter]', 'offer', clientId, description)
      window.responseEventEmitter.emit(
        'offer',
        clientId,
        new RTCSessionDescription(description).toJSON()
      )
    })

    transmitter.attach(this.stream)
    transmitter.start()

    this.sessions.set(clientId, transmitter)
  }

  private handleAnswer = (clientId: string, description: RTCSessionDescriptionInit): void => {
    PRINT_LOG && console.log('[Browser]', 'answer', description)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }
    PRINT_LOG && console.log('[Session]', 'answer', description)
    session.answer(description)
  }

  private handleIcecandidate = (clientId: string, candidate: RTCIceCandidate): void => {
    PRINT_LOG && console.log('[Browser', 'icecandidate', candidate)

    const session = this.sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    PRINT_LOG && console.log('[Session]', 'addIceCandidate', candidate)
    session.addIceCandidate(candidate)
  }
}
