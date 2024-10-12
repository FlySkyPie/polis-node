import type { Logger } from 'winston';
import type { Socket } from 'socket.io';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import type { ISpectatorEntity } from "../../entities";

import type { IInnerEvent, ISpectatorMovementEvent, ISpectatorRotationEvent } from "./interfaces/inner-event.interface";
import { InnerEventType } from "./inner-event-type";

export const TWO_PI = 2 * Math.PI;

export const isMovementEvent = (event: IInnerEvent): event is ISpectatorMovementEvent => {
    return event.eventType === InnerEventType.SpectatorControlMovment;
}

export const isRotationEvent = (event: IInnerEvent): event is ISpectatorRotationEvent => {
    return event.eventType === InnerEventType.SpectatorControlRotation;
}

export const processMovement = (spectator: ISpectatorEntity, _movementEvents: ISpectatorMovementEvent[]) => {
    const { id, controller, camera } = spectator;
    const movementEvents = _movementEvents.filter(e => e.payload.id === id);
    movementEvents.forEach(({ payload }) => {
        if (payload.forward !== undefined) {
            controller.forward = payload.forward;
        }
        if (payload.sidemove !== undefined) {
            controller.sidemove = payload.sidemove;
        }
    });

    const movementSpeed = 1.0;
    const actualMoveSpeed = 1 * movementSpeed;

    if (controller.forward === 'forward') {
        camera.translateZ(- actualMoveSpeed);
    }
    if (controller.forward === 'backward') {
        camera.translateZ(actualMoveSpeed);
    }

    if (controller.sidemove === 'left') {
        camera.translateX(- actualMoveSpeed);
    }
    if (controller.sidemove === 'right') {
        camera.translateX(actualMoveSpeed);
    }
};

export const createServer = (logger: Logger, onConnect: (socket: Socket) => void) => {
    const app = express();
    const server = http.createServer(app);

    app.use(express.static('public'));

    const cors = process.env.NODE_ENV !== 'development' ? undefined : {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    };
    const port = process.env.NODE_ENV === 'development' ? 5959 : process.env.PORT ?? 0;

    const io = new Server(server, { cors, });
    io.on('connection', onConnect);

    server.listen(port, () => {
        logger.info('listening on *:', server.address());
    });
};
