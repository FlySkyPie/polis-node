/**
 * The interface from stream user perspect.
 */
export interface ITransmittable {
  attach(stream: MediaStream): void;

  start(): void;
}
