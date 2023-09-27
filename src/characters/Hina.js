import * as THREE from 'three'
import { ResourceManager } from '@/resources'
import { Character } from './Character'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'

export class Hina extends Character {
  constructor() {
    super()

    this.source = ResourceManager.get('Hina-re')
    this.object = clone(this.source.scene)
    this.size = this.getGroupSize()
    console.log(this.object)
    // this.size.multiplyVectors(this.size, this.object.scale)
    this.animations = this.source.animations
    this.mixer = new THREE.AnimationMixer(this.object)

    this.mixMouth()

    this.object.traverse(child => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox()
        const box = child.geometry.boundingBox
        // box.setFromCenterAndSize(this.object.position, this.size)
        const boxHelper = new THREE.Box3Helper(box, 0xff0000)
        // boxHelper.updateMatrix = true
        this.object.add(boxHelper)
      }
    })
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


  executeCrossFade(action) {
    setWeight(action, 1)

    action.time = 0
    this.startAction.crossFadeTo(action, 1)
  }

  play(index) {
    // this.animations[index].tracks.forEach(track => {
    //   // if (track.name === 'Bip001_L_Calf.quaternion') {
    //   const step = track.values.length / track.times.length
    //   const firstTime = track.times[0]
    //   const res = [].concat(...track.values)
    //   const firstValue = res.slice(0, step)
    //   res.push(...firstValue)
    //   track.values = new Float32Array(res)
    // })
    // debugger
    const action = this.mixer.clipAction(this.animations[index])
    // action.clampWhenFinished = true
    // action.timeScale = 0.1
    // setTimeout(() => {
    //   action.loop = THREE.LoopOnce
    // }, 1000)
    // action.clampWhenFinished = true
    action.play()
    if (this.startAction) {
      this.startAction && setWeight(action, 0)
      this.executeCrossFade(action)
    }
    this.startAction = action
  }
}


function setWeight(action, weight) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}
