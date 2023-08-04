import * as THREE from 'three'
import { ResourceManager } from '@/resources'
import { Character } from './Character'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'

export class Hina extends Character {
  constructor() {
    super()

    this.source = ResourceManager.get('Hina')
    this.object = clone(this.source.scene)
    this.size = this.getGroupSize()
    console.log(this.object)
    // this.size.multiplyVectors(this.size, this.object.scale)
    this.animations = this.source.animations
    this.mixer = new THREE.AnimationMixer(this.object)

    this.mixMouth()

    const box = new THREE.Box3()
    box.setFromCenterAndSize(this.object.position, this.size)
    const boxHelper = new THREE.Box3Helper(box, 0xff0000)
    this.object.add(boxHelper)
  }

  play(index) {
    console.log(this.animations[index])
    const action = this.mixer.clipAction(this.animations[index])
    action.timeScale = 0.1
    // action.loop = THREE.LoopOnce
    action.clampWhenFinished = true
    action.play()
  }
}
