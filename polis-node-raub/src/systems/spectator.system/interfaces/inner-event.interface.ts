import type { RTCVideoSource } from 'wrtc/lib/binding';

import type { ISpectatorDeleteEvent } from '../../../entities';
import { InnerEventType } from '../inner-event-type';

export interface ISpectatorCreateEvent {
    eventType: InnerEventType.SpectatorCreate,
    payload: {
        id: string;
        source: RTCVideoSource,
    }
}

export interface ISpectatorRorationEvent {
    eventType: InnerEventType.SpectatorControlRotation,
    payload: {
        id: string;
        movePolarAngle: number;
        moveAzimuthAngle: number;
    }
}

export interface ISpectatorMovementEvent {
    eventType: InnerEventType.SpectatorControlMovment,
    payload: {
        id: string;
        forward: 'forward' | 'backward' | null;
        sidemove: 'right' | 'left' | null;
    }
}

export type IInnerEvent = |
    ISpectatorCreateEvent |
    ISpectatorDeleteEvent |
    ISpectatorRorationEvent |
    ISpectatorMovementEvent;
