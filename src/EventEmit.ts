type EventCallback = (...args: any[]) => void
type EventListener = {
  [event: string]: EventCallback[]
}
export class EventEmit {
  public listener: EventListener
  constructor() {
    this.listener = {}
  }
  $on(event: string, cb: EventCallback) {
    const callbacks = this.listener[event]
    if (callbacks) {
      callbacks.push(cb)
    } else {
      this.listener[event] = [cb]
    }
  }
  $emit(event: string) {
    const callbacks = this.listener[event]

    callbacks.forEach(cb => {
      cb()
    })
  }
  $off(event: string) {
    const callbacks = this.listener[event]
    callbacks.length = 0
  }
}