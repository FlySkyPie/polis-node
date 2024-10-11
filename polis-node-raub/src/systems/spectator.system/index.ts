import type { Socket } from 'socket.io';
import type { Query, World } from 'miniplex';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { nonstandard, MediaStream } from 'wrtc';
import { PerspectiveCamera, Spherical, Vector3, WebGLRenderTarget } from 'three';

import type {
    ISpectatorMovementEventPayload, ISpectatorRotationEventPayload
} from '@packages/spectator-protocol';
import { EventType as SpectatorEvent } from '@packages/spectator-protocol';

import type { ISystem } from '../../interfaces/system.interface';
import type { IEntity, ISpectatorEntity } from '../../entities';
import { EventType } from '../../constants/event-type';
import { logger } from '../../utilities/logger';

import type { ISpectatorServer } from './interfaces/spectator-server.interface';
import type { IStreamBroadcastor } from './interfaces/stream-broadcastor.interface';
import type { IInnerEvent, } from './interfaces/inner-event.interface';
import { StreamBroadcastor } from './stream-broadcastor';
import { InnerEventType } from './inner-event-type';
import { isMovementEvent, isRotationEvent, processMovement } from './utilities';

const _twoPI = 2 * Math.PI;

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
                        spherical: new Spherical(1, Math.PI * 0.5, Math.PI),
                    },
                });
            }
        }

        const controlEvents = this.eventQueue.filter(isMovementEvent);
        const rotationEvents = this.eventQueue.filter(isRotationEvent);
        for (const spectator of this.querySpectator) {
            processMovement(spectator, controlEvents);

            const { id, controller, camera } = spectator;
            const _rotationEvents = rotationEvents.filter(({ payload }) => payload.id === id);
            const delta = _rotationEvents.reduce((total, event) => {
                total.theta += event.payload.moveAzimuthAngle;
                total.phi += event.payload.movePolarAngle;
                return total;
            }, { theta: 0, phi: 0 });

            if (!delta.theta && !delta.phi) {
                continue;
            }

            const { spherical } = controller;

            spherical.theta += delta.theta;
            spherical.phi += delta.phi;

            let min = - Infinity;
            let max = Infinity;

            if (isFinite(min) && isFinite(max)) {
                if (min < - Math.PI) min += _twoPI; else if (min > Math.PI) min -= _twoPI;
                if (max < - Math.PI) max += _twoPI; else if (max > Math.PI) max -= _twoPI;

                if (min <= max) {
                    spherical.theta = Math.max(min, Math.min(max, spherical.theta));
                } else {
                    spherical.theta = (spherical.theta > (min + max) / 2) ?
                        Math.max(min, spherical.theta) :
                        Math.min(max, spherical.theta);
                }
            }

            // restrict phi to be between desired limits
            spherical.phi = Math.max(0, Math.min(Math.PI, spherical.phi));
            spherical.makeSafe();

            const _targetPosition = new Vector3()
                .setFromSphericalCoords(1, spherical.phi, spherical.theta)
                .add(camera.position);

            camera.lookAt(_targetPosition);
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
        });

        socket.on('answer', (description: RTCSessionDescriptionInit) => {
            logger.debug(`[socket->webContents] answer`, description);
            this.broadcastor.answer(clientId, description);
        });

        socket.on('icecandidate', (candidate: RTCIceCandidate) => {
            logger.debug(`[socket->webContents] icecandidate`, candidate);
            this.broadcastor.icecandidate(clientId, candidate);
        });

        socket.on(SpectatorEvent.SpectatorControlRotation,
            (payload: ISpectatorRotationEventPayload) => {
                this.eventQueue.push({
                    eventType: InnerEventType.SpectatorControlRotation,
                    payload: {
                        id: clientId,
                        ...payload,
                    },
                });
            });

        socket.on(SpectatorEvent.SpectatorControlMovment,
            (payload: ISpectatorMovementEventPayload) => {
                this.eventQueue.push({
                    eventType: InnerEventType.SpectatorControlMovment,
                    payload: {
                        id: clientId,
                        ...payload,
                    },
                });
            });
    }
}
