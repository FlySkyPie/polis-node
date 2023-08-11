import { SampleViewSource } from './sample-view-source'

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing()
  })
}

function doAThing(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#video')
  if (canvas) {
    new SampleViewSource(canvas)
  }
}

init()

window.requestEventEmitter.on('disconnect', (clientId) => {
  console.log('[Browser]', 'disconnect', clientId)
})

window.requestEventEmitter.on('connection', (clientId) => {
  console.log('[Browser', 'connection', clientId)
})
