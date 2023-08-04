export class EventEmit {
  constructor() {
    this.listener = {}
  }
  $on(event, cb) {
    const callbacks = this.listener[event]
    if (callbacks) {
      callbacks.push(cb)
    } else {
      this.listener[event] = [cb]
    }
  }
  $emit(event) {
    const callbacks = this.listener[event]

    callbacks.forEach(cb => {
      cb()
    })
  }
  $off(event) {
    const callbacks = this.listener[event]
    callbacks.length = 0
  }
}