import type { RTCVideoSource } from 'wrtc/lib/binding';

import { EventType } from '../constants/event-type';

export interface ISpectatorDeleteEvent {
    eventType: EventType.SpectatorDelete,
    payload: {
        id: string;
    }
}

export interface ISpectatorCreateEvent {
    eventType: EventType.SpectatorCreate,
    payload: {
        id: string;
        source: RTCVideoSource,
    }
}

export type IEvent = |
    ISpectatorCreateEvent |
    ISpectatorDeleteEvent;
