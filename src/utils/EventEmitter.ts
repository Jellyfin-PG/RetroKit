/**
 * Strongly-typed event emitter for headless emulation events.
 */
export type EventListener<T> = (data: T) => void | Promise<void>;

export class EventEmitter<TMap extends Record<string, any>> {
  private _listeners: { [K in keyof TMap]?: Set<EventListener<TMap[K]>> } = {};

  public on<K extends keyof TMap>(
    event: K,
    listener: EventListener<TMap[K]>,
  ): () => void {
    if (!this._listeners[event]) {
      this._listeners[event] = new Set();
    }
    this._listeners[event]!.add(listener);

    // Return unsubscriber function for convenience in React/hooks
    return () => this.off(event, listener);
  }

  public once<K extends keyof TMap>(
    event: K,
    listener: EventListener<TMap[K]>,
  ): () => void {
    const wrapped: EventListener<TMap[K]> = (data) => {
      this.off(event, wrapped);
      listener(data);
    };
    return this.on(event, wrapped);
  }

  public off<K extends keyof TMap>(
    event: K,
    listener: EventListener<TMap[K]>,
  ): void {
    const set = this._listeners[event];
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        delete this._listeners[event];
      }
    }
  }

  public emit<K extends keyof TMap>(
    event: K,
    ...args: TMap[K] extends void ? [] : [TMap[K]]
  ): void {
    const set = this._listeners[event];
    if (set) {
      const data = args[0] as TMap[K];
      for (const listener of Array.from(set)) {
        try {
          listener(data);
        } catch (err) {
          console.error(
            `[EventEmitter] Error in listener for event "${String(event)}":`,
            err,
          );
        }
      }
    }
  }

  public removeAllListeners(): void {
    this._listeners = {};
  }
}
