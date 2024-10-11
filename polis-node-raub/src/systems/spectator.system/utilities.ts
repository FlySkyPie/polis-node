import { Vector3 } from "three";

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
        if (payload.forward) {
            controller.forward = payload.forward;
        }
        if (payload.sidemove) {
            controller.sidemove = payload.sidemove;
        }
    });

    // TODO: Move camera.
    const { spherical } = controller;



    const _targetPosition = new Vector3()
        .setFromSphericalCoords(1, spherical.phi, spherical.theta)
        .add(camera.position);
};
