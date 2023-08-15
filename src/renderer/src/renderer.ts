import { SampleViewSource } from './sample-view-source'
import { TransmitterSession } from './transmitter-session'

const sessions = new Map<string, TransmitterSession>()

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

  window.requestEventEmitter.on('disconnect', (clientId) => {
    console.log('[Browser]', 'disconnect', clientId)

    const session = sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    session.dispose()
    sessions.delete(clientId)
  })

  window.requestEventEmitter.on('connection', (clientId) => {
    console.log('[Browser', 'connection', clientId)

    const transmitter = new TransmitterSession()

    transmitter.on('icecandidate', (candidate) => {
      console.log('[transmitter->responseEventEmitter]', 'icecandidate', clientId, candidate)
      window.responseEventEmitter.emit('icecandidate', clientId, candidate.toJSON())
    })
    transmitter.on('offer', (description) => {
      console.log('[transmitter->responseEventEmitter]', 'offer', clientId, description)
      window.responseEventEmitter.emit(
        'offer',
        clientId,
        new RTCSessionDescription(description).toJSON()
      )
    })

    transmitter.attach(stream)
    transmitter.start()

    sessions.set(clientId, transmitter)
  })

  window.requestEventEmitter.on('answer', (clientId, description) => {
    console.log('[Browser]', 'answer', description)

    const session = sessions.get(clientId)
    if (!session) {
      throw new Error()
    }
    console.log('[Session]', 'answer', description)
    session.answer(description)
  })

  window.requestEventEmitter.on('icecandidate', (clientId, candidate) => {
    console.log('[Browser', 'icecandidate', candidate)

    const session = sessions.get(clientId)
    if (!session) {
      throw new Error()
    }

    console.log('[Session]', 'addIceCandidate', candidate)
    session.addIceCandidate(candidate)
  })
}
