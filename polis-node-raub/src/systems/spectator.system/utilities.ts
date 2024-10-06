import type { IInnerEvent, ISpectatorMovementEvent, ISpectatorRorationEvent } from "./interfaces/inner-event.interface";
import { InnerEventType } from "./inner-event-type";

export const isMovementEvent = (event: IInnerEvent): event is ISpectatorMovementEvent => {
    return event.eventType === InnerEventType.SpectatorControlMovment;
}

export const isRotationEvent = (event: IInnerEvent): event is ISpectatorRorationEvent => {
    return event.eventType === InnerEventType.SpectatorControlRotation;
}