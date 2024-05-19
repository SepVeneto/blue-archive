import * as THREE from 'three'
import { Weapon } from ".";

export class Base extends Weapon {
  public cones: THREE.Mesh[] = []
  constructor(num?: number) {
    super(num || 1);

    this._init()
  }

  _init() {
    const geometry = new THREE.ConeGeometry(0.1, 2, 8)
    const material = new THREE.MeshBasicMaterial({ color: 0x9d9d9d })
    for(let i = 0; i < this.num; ++i) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotateX(Math.PI / 2)
      mesh.position.z += 1
      mesh.position.y += 0.8
      this.group.add(mesh)
    }
  }
}