import { ElectronAPI } from '@electron-toolkit/preload'

import { RequestEventMap } from '../interfaces/request-event-map'
import { TypedEventEmitter } from '../utilities/typed-event-emitter'
import { ResponseEventMap } from '../interfaces/response-event-map'

declare global {
  interface Window {
    electron: ElectronAPI
    requestEventEmitter: TypedEventEmitter<RequestEventMap>
    responseEventEmitter: TypedEventEmitter<ResponseEventMap>
    // response: (event: string, ...args: unknown[]) => boolean
  }
}
