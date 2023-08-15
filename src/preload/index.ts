import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import type { ResponseEventMap } from '../interfaces/response-event-map'
import type { RequestEventMap } from '../interfaces/request-event-map'
import { TypedEventEmitter } from '../utilities/typed-event-emitter'

const requestEventEmitter = new TypedEventEmitter<RequestEventMap>()
const responseEventEmitter = new TypedEventEmitter<ResponseEventMap>()
// const responseEventEmitter = new EventEmitter<ResponseEventMap>()

console.log('responseEventEmitter', responseEventEmitter)

// const response = (event: string, ...args: unknown[]): boolean =>
//   responseEventEmitter.emit(event, ...args)

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('requestEventEmitter', requestEventEmitter)
    contextBridge.exposeInMainWorld('responseEventEmitter', responseEventEmitter)
    // contextBridge.exposeInMainWorld('response', response)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.requestEventEmitter = requestEventEmitter
  // @ts-ignore (define in dts)
  window.responseEventEmitter = responseEventEmitter
  // @ts-ignore (define in dts)
  // window.response = response
}

ipcRenderer.on('connection', (_, clientId: string) => {
  requestEventEmitter.emit('connection', clientId)
})

ipcRenderer.on('disconnect', (_, clientId: string) => {
  requestEventEmitter.emit('disconnect', clientId)
})

ipcRenderer.on('answer', (_, clientId: string, description: RTCSessionDescriptionInit) => {
  console.log('[ipcRenderer->requestEventEmitter]', 'answer', clientId, description)
  requestEventEmitter.emit('answer', clientId, description)
})

ipcRenderer.on('icecandidate', (_, clientId: string, candidate: RTCIceCandidate) => {
  console.log('[ipcRenderer->requestEventEmitter]', 'icecandidate', clientId, candidate)
  requestEventEmitter.emit('icecandidate', clientId, candidate)
})

responseEventEmitter.on('icecandidate', (clientId: string, candidate: RTCIceCandidateInit) => {
  console.log('[responseEventEmitter->ipcRenderer]', 'icecandidate', clientId, candidate)
  ipcRenderer.send('icecandidate', clientId, candidate)
})

responseEventEmitter.on('offer', (clientId: string, description: RTCSessionDescriptionInit) => {
  console.log('[responseEventEmitter->ipcRenderer]', 'offer', clientId, description)
  ipcRenderer.send('offer', clientId, description)
})
