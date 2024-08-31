import type { Socket } from 'socket.io'
import type { World } from 'miniplex'
import express from 'express'
import http from 'http'
import chalk from 'chalk'
import { Server } from 'socket.io'
import { nanoid } from 'nanoid'
import { nonstandard, MediaStream } from 'wrtc';

import type { ISystem } from '../../interfaces/system.interface'
import type { IEntity, ISpectatorCreateEvent, ISpectatorDeleteEvent, ISpectatorEntity } from '../../entities'
import { EventType } from '../../constants/event-type'

import type { ISpectatorServer } from './spectator-server.interface'
import type { IStreamBroadcastor } from './stream-broadcastor.interface'
import { StreamBroadcastor } from './stream-broadcastor'
import { PerspectiveCamera, WebGLRenderTarget } from 'three'

const PRINT_LOG = false

export class SpectatorSystem implements ISystem, ISpectatorServer {
    private secssions = new Map<string, Socket>();

    private broadcastor: IStreamBroadcastor;

    /**
     * Used to convert tasks from socket space to ECS space.
     */
    private eventQueue: (ISpectatorDeleteEvent | ISpectatorCreateEvent)[] = [];

    constructor() {
        const app = express()
        const server = http.createServer(app)

        app.use(express.static('public'))

        const io = new Server(server, {
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST']
            }
        })

        io.on('connection', this.handleConnect);

        server.listen(process.env.NODE_ENV === 'development' ? 5959 : 0, () => {
            console.log('listening on *:', server.address())
        });

        const broadcastor = new StreamBroadcastor();
        broadcastor.setAnswerable(this);

        this.broadcastor = broadcastor;
    }

    public async init(world: World<IEntity>): Promise<void> {

    }

    public tick(world: World<IEntity>): void {
        for (const event of this.eventQueue) {
            if (event.eventType === EventType.SpectatorDelete) {
                world.add(event);
                continue;
            }
            const camera = new PerspectiveCamera(70, 1, 1, 1000);
            camera.position.z = 25;

            const renderTarget = new WebGLRenderTarget(500, 500, {
                depthBuffer: false,
            });

            const { payload: { id, source } } = event;
            world.add<ISpectatorEntity>({
                id,
                source,
                camera,
                renderTarget,
            });
        }

        this.eventQueue.length = 0;
    }

    public dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public icecandidate(clientId: string, candidate: RTCIceCandidate) {
        const socket = this.secssions.get(clientId)
        if (!socket) {
            throw new Error()
        }

        PRINT_LOG && console.log(chalk.red('[ipcMain->Socket]'), 'icecandidate', candidate)
        socket.emit('icecandidate', candidate)
    }

    public offer(clientId: string, description: RTCSessionDescriptionInit) {
        const socket = this.secssions.get(clientId)
        if (!socket) {
            throw new Error()
        }

        PRINT_LOG && console.log(chalk.red('[ipcMain->Socket]'), 'offer', description)
        socket.emit('offer', description)
    }

    private handleConnect = (socket: Socket) => {
        const clientId = nanoid();
        this.secssions.set(clientId, socket);
        PRINT_LOG && console.log('a user connected', clientId);

        //@ts-ignore The third party type declaration is not complete.
        const source = new nonstandard.RTCVideoSource();
        const track = source.createTrack();
        const stream = new MediaStream();
        stream.addTrack(track);

        this.broadcastor.connection(clientId, stream);

        this.eventQueue.push({
            eventType: EventType.SpectatorCreate,
            payload: {
                id: clientId,
                source,
            },
        });

        socket.on('disconnect', () => {
            this.secssions.delete(clientId);
            PRINT_LOG && console.log('user disconnected', clientId);

            this.broadcastor.disconnect(clientId);

            this.eventQueue.push({
                eventType: EventType.SpectatorDelete,
                payload: { id: clientId, },
            });
        })

        socket.on('answer', (description: RTCSessionDescriptionInit) => {
            PRINT_LOG && console.log(chalk.red('[socket->webContents]'), 'answer', description);
            this.broadcastor.answer(clientId, description);
        })

        socket.on('icecandidate', (candidate: RTCIceCandidate) => {
            PRINT_LOG && console.log(chalk.red('[socket->webContents]'), 'icecandidate', candidate);
            this.broadcastor.icecandidate(clientId, candidate);
        })
    }
}
