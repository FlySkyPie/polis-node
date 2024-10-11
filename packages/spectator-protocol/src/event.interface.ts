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

export interface ISpectatorMovementEventPayload {
    forward?: 'forward' | 'backward';
    sidemove?: 'right' | 'left';
}
