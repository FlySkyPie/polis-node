import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import { Router } from './router'

const router = new Router()

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('requestEventEmitter', router.requestEventEmitter)
    contextBridge.exposeInMainWorld('responseEventEmitter', router.responseEventEmitter)
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
