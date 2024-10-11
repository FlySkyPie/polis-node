export interface ISpectatorRotationEventPayload {
    /**
     * Vertical angle of camera.
     */
    movePolarAngle: number;

    /**
     * Horizontal angle of camera.
     */
    moveAzimuthAngle: number;
}

interface IForwardPayload {
    forward: 'forward' | 'backward' | null;
    sidemove?: undefined;
}

interface ISidemovePayload {
    forward?: undefined;
    sidemove: 'right' | 'left' | null;
}

export type ISpectatorMovementEventPayload = IForwardPayload | ISidemovePayload;
