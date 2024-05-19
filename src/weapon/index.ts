import * as THREE from 'three'

// TODO
export enum WEAPON_POS {
  LOW
}

export class Weapon {
  public group = new THREE.Group()
  public num = 1
  public speed = 1
  constructor(num: number) {
    this.num = num
  }

  init() {
    const unit = 360 / this.num
    for (let i = 0; i < this.num; ++i) {
      const radius = i * unit / 180 * Math.PI
      const x = Math.sin(-radius) * 2
      const y = Math.cos(radius) * 2
      const obj = this.group.children[i]
      obj.rotateZ(radius)
      obj.position.x = x
      obj.position.z = y
    }
  }

  update() {
    this.group.rotateY(1 / 180 * Math.PI)
  }
}