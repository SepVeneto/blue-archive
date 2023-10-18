export class World {
  static scene = null
  static children = null
  constructor(scene) {
    this.scene = scene
    this.children = []
    console.log(this.scene, this.children)
  }
  add(obj) {
    this.scene.add(obj.object ? obj.object : obj)
    this.children.push(obj)
  }
  remove(obj) {
    this.scene.remove(obj.object ? obj.object : obj)
  }
  tick(delta) {
    this.children.forEach((obj, index) => {
      const res = obj.tick && obj.tick(delta)
      if (res === false) {
        this.children.splice(index, 1)
      }
    })
  }
}
