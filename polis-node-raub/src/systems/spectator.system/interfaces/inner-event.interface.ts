import type { RTCVideoSource } from 'wrtc/lib/binding';

import type {
    ISpectatorRotationEventPayload,
    ISpectatorMovementEventPayload
} from '@packages/spectator-protocol';

import type { ISpectatorDeleteEvent } from '../../../entities';
import { InnerEventType } from '../inner-event-type';

export interface ISpectatorCreateEvent {
    eventType: InnerEventType.SpectatorCreate,
    payload: {
        id: string;
        source: RTCVideoSource,
    }
}

export interface ISpectatorRotationEvent {
    eventType: InnerEventType.SpectatorControlRotation,
    payload: ISpectatorRotationEventPayload & {
        id: string;
    }
}

export interface ISpectatorMovementEvent {
    eventType: InnerEventType.SpectatorControlMovment,
    payload: ISpectatorMovementEventPayload & {
        id: string;
    }
}

export type IInnerEvent = |
    ISpectatorCreateEvent |
    ISpectatorDeleteEvent |
    ISpectatorRotationEvent |
    ISpectatorMovementEvent;
