/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events'

export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter()

  public emit = <TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ): void => {
    this.emitter.emit(eventName, ...(eventArg as []))
  }

  public on = <TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ): void => {
    this.emitter.on(eventName, handler as any)
  }

  public off = <TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ): void => {
    this.emitter.off(eventName, handler as any)
  }

  public removeAllListeners = (): void => {
    this.emitter.removeAllListeners()
  }
}
