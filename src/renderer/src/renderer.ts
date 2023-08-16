import { SampleViewSource } from './sample-view-source'
import { StreamBroadcastor } from './stream-broadcastor'

window.addEventListener('DOMContentLoaded', () => {
  init()
})

function init(): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#video')
  if (!canvas) {
    return
  }

  new SampleViewSource(canvas)

  const stream = canvas.captureStream(20)
  const broadcastor = new StreamBroadcastor(stream)
}
