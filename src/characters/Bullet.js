import * as THREE from 'three'
import { bullet } from '../utils'

export class Bullet {
  world = undefined
  // 子弹直径
  radius = bullet.radius
  // 子弹长度
  length = bullet.length
  constructor(world, origin) {
    this.world = world
    const geometry = new THREE.CapsuleGeometry(this.radius, this.length, 1, 8)
    const material = new THREE.MeshBasicMaterial({ color: 0xFF7F27 })
    this.object = new THREE.Mesh(geometry, material)
    this.object.position.copy(origin)
    this.object.rotateX(Math.PI / 2)
    this.speed = 10
    this.lifeTime = 1
  }
  _registerGui() {
    bullet.add(this, 'radius')
    bullet.add(this, 'length')
  }
  setDirect() {

  }
  tick(delta) {
    if (!this.object) return
    this.object.position.z += -this.speed * delta;
    this.lifeTime -= delta
    if (this.lifeTime <= 0) {
      this.destroy()
      return false
    }
    return true
  }
  destroy() {
    this.world.remove(this.object)
    this.object = null
  }
}