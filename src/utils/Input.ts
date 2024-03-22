import { arrayLike } from './index'

const keyQueue: string[] = []

enum MouseAction {
  // 通常指鼠标左键
  MAIN,
  // 通常指鼠标滚轮中键
  MIDDLE,
  // 通常指鼠标右键
  SUB,
}

type ActionCode = KeyboardEvent['code'] | MouseEvent['button']

export class Input {
  private queue: { code: ActionCode, event: string }[] = []
  private previous: typeof this.queue = []
  static anyKey = false
  static anyKeyDown = false
  constructor(dom?: HTMLElement) {
    const node = dom || document.body
    document.addEventListener
    node.addEventListener('keypress', this.handleKeypress)
    node.addEventListener('keyup', this.handleKeyup)
    node.addEventListener('mousedown', this.handleMousedown)
    node.addEventListener('mouseup', this.handleMouseup)
  }

  static getKey(keyCode: KeyboardEvent['code']): boolean {
    return keyQueue.includes(keyCode)
  }

  private handleMousedown(evt: MouseEvent) {
    this.queue.push({ code: evt.button, event: 'mousedown' })
  }
  private handleMouseup(evt: MouseEvent) {
    this.queue.push({ code: evt.button, event: 'mouseup' })
  }
  private handleKeypress(evt: KeyboardEvent) {
    this.queue.push({ code: evt.code, event: 'keypress' })
  }
  private handleKeyup(evt: KeyboardEvent) {
    this.queue.push({ code: evt.code, event: 'keyup' })
  }
  public update() {
    Input.anyKey = this.queue.length> 0
    if (this.hasEvent(this.previous, ['keypress', 'mousedown'])) {
      Input.anyKeyDown = this.hasEvent(this.queue, ['keypress', 'mousedown'])
    }

    this.previous = this.queue
    this.queue = []
  }
  hasCode(list: typeof this.queue, code: ActionCode | ActionCode[]) {
    const codes = arrayLike(code)
    return !!list.find(item => codes.includes(item.code))
  }
  hasEvent(list: typeof this.queue, event: string | string[]) {
    const events = arrayLike(event)
    return !!list.find(item => events.includes(item.event))
  }
}
