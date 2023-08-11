import type { Socket } from 'socket.io'
import type { BrowserWindow } from 'electron'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'

export class SpectatorServer {
  private secssions = new Map<string, Socket>()
  constructor(private mainWindow: BrowserWindow) {
    const app = express()
    const server = http.createServer(app)

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:5174',
        methods: ['GET', 'POST']
      }
    })

    // app.use(
    //   '/',
    //   createProxyMiddleware({
    //     target: 'http://localhost:5174',
    //     changeOrigin: true,
    //   })
    // )

    io.on('connection', (socket) => {
      const clientId = nanoid()
      this.secssions.set(clientId, socket)
      console.log('a user connected', clientId)

      mainWindow.webContents.send('connection', clientId)

      socket.on('disconnect', () => {
        this.secssions.delete(clientId)
        console.log('user disconnected', clientId)

        mainWindow.webContents.send('disconnect', clientId)
      })
    })

    server.listen(0, () => {
      console.log('listening on *:', server.address())
    })
  }
}
