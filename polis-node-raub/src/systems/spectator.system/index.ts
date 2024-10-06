import type { Socket } from 'socket.io';
import type { Query, World } from 'miniplex';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { nonstandard, MediaStream } from 'wrtc';
import { PerspectiveCamera, Spherical, WebGLRenderTarget } from 'three';

import type { ISystem } from '../../interfaces/system.interface';
import type { IEntity, ISpectatorEntity } from '../../entities';
import { EventType } from '../../constants/event-type';
import { logger } from '../../utilities/logger';

import type { ISpectatorServer } from './interfaces/spectator-server.interface';
import type { IStreamBroadcastor } from './interfaces/stream-broadcastor.interface';
import type { IInnerEvent, } from './interfaces/inner-event.interface';
import { StreamBroadcastor } from './stream-broadcastor';
import { InnerEventType } from './inner-event-type';
import { isMovementEvent, isRotationEvent } from './utilities';

export class SpectatorSystem implements ISystem, ISpectatorServer {
    private secssions = new Map<string, Socket>();

    private broadcastor: IStreamBroadcastor;

    /**
     * Used to convert tasks from socket space to ECS space.
     */
    private eventQueue: IInnerEvent[] = [];

    private querySpectator!: Query<ISpectatorEntity>;

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
            logger.info('listening on *:', server.address());
        });

        const broadcastor = new StreamBroadcastor();
        broadcastor.setAnswerable(this);

        this.broadcastor = broadcastor;
    }

    public async init(world: World<IEntity>): Promise<void> {
        const querySpectator = world.with('id', 'camera', 'renderTarget', 'source', 'controller');

        this.querySpectator = querySpectator;
    }

    public tick(world: World<IEntity>): void {
        // Process inner events.
        for (const event of this.eventQueue) {
            if (event.eventType === EventType.SpectatorDelete) {
                world.add(event);
                continue;
            }
            if (event.eventType === InnerEventType.SpectatorCreate) {
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
                    controller: {
                        forward: null,
                        sidemove: null,
                        spherical: new Spherical(),
                    },
                });
            }
        }

        const controlEvents = this.eventQueue.filter(isMovementEvent);
        const rotationEvents = this.eventQueue.filter(isRotationEvent);
        for (const spectator of this.querySpectator) {
            const { id, controller, } = spectator;
            const movementEvent = controlEvents.findLast(event => event.payload.id === id);
            if (movementEvent) {
                controller.forward = movementEvent.payload.forward;
                controller.sidemove = movementEvent.payload.sidemove;
            }

            const _rotationEvents = rotationEvents.filter(({ payload }) => payload.id === id);
            // TODO: Update spherical

            // TODO: Update camera of spectator.
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

        logger.debug(`[ipcMain->Socket] icecandidate`, candidate);
        socket.emit('icecandidate', candidate)
    }

    public offer(clientId: string, description: RTCSessionDescriptionInit) {
        const socket = this.secssions.get(clientId)
        if (!socket) {
            throw new Error()
        }

        logger.debug(`[ipcMain->Socket] offer`, description);
        socket.emit('offer', description)
    }

    private handleConnect = (socket: Socket) => {
        const clientId = nanoid();
        this.secssions.set(clientId, socket);
        logger.info('a user connected', { clientId });

        //@ts-ignore The third party type declaration is not complete.
        const source = new nonstandard.RTCVideoSource();
        const track = source.createTrack();
        const stream = new MediaStream();
        stream.addTrack(track);

        this.broadcastor.connection(clientId, stream);

        this.eventQueue.push({
            eventType: InnerEventType.SpectatorCreate,
            payload: {
                id: clientId,
                source,
            },
        });

        socket.on('disconnect', () => {
            this.secssions.delete(clientId);
            logger.info('user disconnected', { clientId });

            this.broadcastor.disconnect(clientId);

            this.eventQueue.push({
                eventType: EventType.SpectatorDelete,
                payload: { id: clientId, },
            });
        })

        socket.on('answer', (description: RTCSessionDescriptionInit) => {
            logger.debug(`[socket->webContents] answer`, description);
            this.broadcastor.answer(clientId, description);
        })

        socket.on('icecandidate', (candidate: RTCIceCandidate) => {
            logger.debug(`[socket->webContents] icecandidate`, candidate);
            this.broadcastor.icecandidate(clientId, candidate);
        })
    }
}
