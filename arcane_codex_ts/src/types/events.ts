// Type-safe event emitter interface for the services

import { EventEmitter } from 'events';

// Create a type-safe event emitter class
export interface TypedEventEmitter<TEvents extends Record<string, any>> {
  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this;

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this;

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...args: Parameters<TEvents[TEventName]>
  ): boolean;

  once<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this;

  removeListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this;

  removeAllListeners<TEventName extends keyof TEvents & string>(
    eventName?: TEventName
  ): this;

  listenerCount<TEventName extends keyof TEvents & string>(
    eventName: TEventName
  ): number;

  addListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this;
}

// Helper type to create typed event emitters
export class TypedEmitter<TEvents extends Record<string, any>>
  extends EventEmitter
  implements TypedEventEmitter<TEvents>
{
  constructor() {
    super();
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this {
    return super.on(eventName, handler);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this {
    return super.off(eventName, handler);
  }

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...args: Parameters<TEvents[TEventName]>
  ): boolean {
    return super.emit(eventName, ...args);
  }

  once<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this {
    return super.once(eventName, handler);
  }

  removeListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this {
    return super.removeListener(eventName, handler);
  }

  removeAllListeners<TEventName extends keyof TEvents & string>(
    eventName?: TEventName
  ): this {
    return super.removeAllListeners(eventName);
  }

  listenerCount<TEventName extends keyof TEvents & string>(
    eventName: TEventName
  ): number {
    return super.listenerCount(eventName);
  }

  addListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ): this {
    return super.addListener(eventName, handler);
  }
}