import type { ISpectatorEntity } from "../../entities";

import type { IInnerEvent, ISpectatorMovementEvent, ISpectatorRotationEvent } from "./interfaces/inner-event.interface";
import { InnerEventType } from "./inner-event-type";

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
