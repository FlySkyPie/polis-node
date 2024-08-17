import { ipcRenderer } from 'electron'

import type { ResponseEventMap } from '../interfaces/response-event-map'
import type { RequestEventMap } from '../interfaces/request-event-map'
import { TypedEventEmitter } from '../utilities/typed-event-emitter'

const PRINT_LOG = false

export class Router {
  public requestEventEmitter = new TypedEventEmitter<RequestEventMap>()

  public responseEventEmitter = new TypedEventEmitter<ResponseEventMap>()

  constructor() {
    ipcRenderer.on('connection', (_, clientId: string) => {
      this.requestEventEmitter.emit('connection', clientId)
    })

    ipcRenderer.on('disconnect', (_, clientId: string) => {
      this.requestEventEmitter.emit('disconnect', clientId)
    })

    ipcRenderer.on('answer', (_, clientId: string, description: RTCSessionDescriptionInit) => {
      PRINT_LOG &&
        console.log('[ipcRenderer->requestEventEmitter]', 'answer', clientId, description)
      this.requestEventEmitter.emit('answer', clientId, description)
    })

    ipcRenderer.on('icecandidate', (_, clientId: string, candidate: RTCIceCandidate) => {
      PRINT_LOG &&
        console.log('[ipcRenderer->requestEventEmitter]', 'icecandidate', clientId, candidate)
      this.requestEventEmitter.emit('icecandidate', clientId, candidate)
    })

    this.responseEventEmitter.on(
      'icecandidate',
      (clientId: string, candidate: RTCIceCandidateInit) => {
        PRINT_LOG &&
          console.log('[responseEventEmitter->ipcRenderer]', 'icecandidate', clientId, candidate)
        ipcRenderer.send('icecandidate', clientId, candidate)
      }
    )

    this.responseEventEmitter.on(
      'offer',
      (clientId: string, description: RTCSessionDescriptionInit) => {
        PRINT_LOG &&
          console.log('[responseEventEmitter->ipcRenderer]', 'offer', clientId, description)
        ipcRenderer.send('offer', clientId, description)
      }
    )
  }
}
