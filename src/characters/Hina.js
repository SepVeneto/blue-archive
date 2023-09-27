import * as THREE from 'three'
import { ResourceManager } from '@/resources'
import { Character } from './Character'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Hina as Action } from '../constant'

export class Hina extends Character {
  constructor() {
    super()

    this.state = 'idle'
    this.source = ResourceManager.get('Hina-re')
    this.object = clone(this.source.scene)
    this.speed = 0.1
    this.size = this.getGroupSize()
    this.forward = 'front'
    // this.object.children[0].setRotationFromEuler(Math.PI / 2)
    this.object.position.set(0, 0, 0)
    this.object.add(new THREE.Box3Helper(this.size, 0xff0000))
    // this.size.multiplyVectors(this.size, this.object.scale)
    this.animations = this.source.animations
    this.mixer = new THREE.AnimationMixer(this.object)

    this.mixMouth()

    this.play(Action.NORMAL_IDLE)
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
    // obj.material.shininess = 30
    // // obj.material.specular = 0xffffff
    // obj.needsUpdate = true
  }


  executeCrossFade(action, duration) {
    setWeight(action, 1)

    action.time = 0
    this.startAction.crossFadeTo(action, duration)
  }

  moveStart() {
    if (this.state === 'moving') return

    this.state = 'moving'
    this.play(Action.MOVE_ING, 0.3)
  }
  turn(direct) {
    if (this.forward === direct) return
    this.forward = direct

    switch (direct) {
      case 'front':
        this.object.rotation.set(0, 0, 0)
        break
      case 'left':
        this.object.rotation.set(0, Math.PI / 2, 0)
        break
      case 'back':
        this.object.rotation.set(0, Math.PI, 0)
        break
      case 'right':
        this.object.rotation.set(0, -Math.PI / 2, 0)
        break
    }

    // this.forward = 'left'
    // this.object.rotation.y = Math.PI / 2
  }
  moveEnd() {
    this.state = 'idle'
    this.play(Action.NORMAL_IDLE, 0.3)
  }
  update() {
    if (this.state === 'moving') {
      const currentSpeed = this.speed * this.startAction.getEffectiveWeight()
      switch (this.forward) {
        case 'front':
          this.object.position.z -= currentSpeed
          break
        case 'left':
          this.object.position.x -= currentSpeed
          break
        case 'back':
          this.object.position.z += currentSpeed
          break
        case 'right':
          this.object.position.x += currentSpeed
          break
      }
    }
  }

  play(index, duration = 1) {
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
      this.executeCrossFade(action, duration)
    }
    this.startAction = action
  }
}


function setWeight(action, weight) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}
