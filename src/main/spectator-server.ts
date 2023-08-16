import type { Socket } from 'socket.io'
import express from 'express'
import http from 'http'
import chalk from 'chalk'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { ipcMain } from 'electron'

const PRINT_LOG = false

export class SpectatorServer {
  private secssions = new Map<string, Socket>()
  constructor(webContents: Electron.WebContents) {
    const app = express()
    const server = http.createServer(app)

    app.use(express.static('public'))

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:5174',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      const clientId = nanoid()
      this.secssions.set(clientId, socket)
      PRINT_LOG && console.log('a user connected', clientId)

      webContents.send('connection', clientId)

      socket.on('disconnect', () => {
        this.secssions.delete(clientId)
        PRINT_LOG && console.log('user disconnected', clientId)

        webContents.send('disconnect', clientId)
      })

      socket.on('answer', (description: RTCSessionDescriptionInit) => {
        PRINT_LOG && console.log(chalk.red('[socket->webContents]'), 'answer', description)
        webContents.send('answer', clientId, description)
      })

      socket.on('icecandidate', (candidate: RTCIceCandidate) => {
        PRINT_LOG && console.log(chalk.red('[socket->webContents]'), 'icecandidate', candidate)
        webContents.send('icecandidate', clientId, candidate)
      })
    })

    server.listen(0, () => {
      console.log('listening on *:', server.address())
    })

    ipcMain.on('icecandidate', (_, clientId: string, candidate: RTCIceCandidate) => {
      const socket = this.secssions.get(clientId)
      if (!socket) {
        throw new Error()
      }

      PRINT_LOG && console.log(chalk.red('[ipcMain->Socket]'), 'icecandidate', candidate)
      socket.emit('icecandidate', candidate)
    })

    ipcMain.on('offer', (_, clientId: string, description: RTCSessionDescriptionInit) => {
      const socket = this.secssions.get(clientId)
      if (!socket) {
        throw new Error()
      }

      PRINT_LOG && console.log(chalk.red('[ipcMain->Socket]'), 'offer', description)
      socket.emit('offer', description)
    })
  }
}
