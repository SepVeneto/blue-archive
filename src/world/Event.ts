import { Debug } from './Debug'
export class World extends Debug {
  static scene = null
  static children = null
  public scene: THREE.Scene
  public children: any[]
  private updateFns: (() => void)[] = []
  constructor(scene: THREE.Scene) {
    super()
    this.scene = scene
    this.children = []
    console.log(this.scene, this.children)
  }
  add(obj: any) {
    this.scene.add(obj.object ? obj.object : obj)
    this.children.push(obj)
  }
  remove(obj: any) {
    this.scene.remove(obj.object ? obj.object : obj)
  }
  register(fn: () => void) {
    this.updateFns.push(fn)
  }
  tick(delta: number) {
    this.updateFns.forEach(fn => fn())

    this.children.forEach((obj, index) => {
      const res = obj.tick && obj.tick(delta)
      if (res === false) {
        this.children.splice(index, 1)
      }
    })
  }
}
