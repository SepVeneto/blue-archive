import * as THREE from 'three'
import { Debug } from '../world/Debug'
import { World } from '@/world/Event'
// import { bullet } from '../utils'

export class Bullet{
  // 子弹直径
  radius = 0.02
  // 子弹长度
  length = 0.2
  public world: World
  public object: THREE.Mesh | null
  public speed
  public lifeTime
  constructor(world: World, origin: THREE.Vector3) {
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
    // console.log('?')
    // this.gui.add(this, 'radius')
    // this.gui.add(this, 'length')
  }
  setDirect() {

  }
  tick(delta: number) {
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