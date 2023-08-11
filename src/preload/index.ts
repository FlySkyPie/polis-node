import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { RequestEventMap } from '../interfaces/request-event-map'
import { TypedEventEmitter } from '../utilities/typed-event-emitter'

const requestEventEmitter = new TypedEventEmitter<RequestEventMap>()

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('requestEventEmitter', requestEventEmitter)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.requestEventEmitter = requestEventEmitter
}

ipcRenderer.on('connection', (_, clientId: string) => {
  requestEventEmitter.emit('connection', clientId)
})

ipcRenderer.on('disconnect', (_, clientId: string) => {
  requestEventEmitter.emit('disconnect', clientId)
})
