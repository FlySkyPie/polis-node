import { ElectronAPI } from '@electron-toolkit/preload'

import { RequestEventMap } from '../interfaces/request-event-map'
import { TypedEventEmitter } from '../utilities/typed-event-emitter'

declare global {
  interface Window {
    electron: ElectronAPI
    requestEventEmitter: TypedEventEmitter<RequestEventMap>
  }
}
