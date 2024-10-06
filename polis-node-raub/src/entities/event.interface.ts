import { EventType } from '../constants/event-type';

export interface ISpectatorDeleteEvent {
    eventType: EventType.SpectatorDelete,
    payload: {
        id: string;
    }
}

export type IEvent = |
    ISpectatorDeleteEvent;
