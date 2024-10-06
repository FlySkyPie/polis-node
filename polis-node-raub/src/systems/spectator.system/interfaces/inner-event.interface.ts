import type { RTCVideoSource } from 'wrtc/lib/binding';

import type { ISpectatorDeleteEvent } from '../../../entities';
import { EventType } from '../../../constants/event-type';

export interface ISpectatorCreateEvent {
    eventType: EventType.SpectatorCreate,
    payload: {
        id: string;
        source: RTCVideoSource,
    }
}

export type IInnerEvent = |
    ISpectatorCreateEvent |
    ISpectatorDeleteEvent;
