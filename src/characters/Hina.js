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
  setHairSpec() {
    const obj = this.object.getObjectByName('Hina_Original_Body_5')
    // obj.material.metalnessMap = ResourceManager.get('HinaHairSpec')
    // obj.material.metalness = 0.3
    const material = obj.material.clone()
    const spec = ResourceManager.get('HinaHairSpec')
    // spec.minFilter = THREE.NearestFilter
    // spec.magFilter = THREE.NearestFilter
    // material.gradientMap = spec
    material.emissiveMap = spec
    material.emissive = 0xffffff
    // material.alhpaMap = ResourceManager.get('HinaHairMask')
    obj.material = material
    console.log('hair', obj)
    // obj.material.shininess = 30
    // // obj.material.specular = 0xffffff
    // obj.needsUpdate = true
  }

  play(index) {
    console.log(this.animations[index])
    const action = this.mixer.clipAction(this.animations[index])
    action.timeScale = 0.1
    // action.loop = THREE.LoopOnce
    // action.clampWhenFinished = true
    action.play()
  }
}
