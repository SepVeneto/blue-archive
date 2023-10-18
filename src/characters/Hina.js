import * as THREE from 'three'
import { ResourceManager } from '@/resources'
import { Character } from './Character'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Hina as Action } from '../constant'
import { Bullet } from './Bullet'
import { World } from '../world/Event'
import genFireMaterial from '../components/fire'

const DIRECT_AXIS = new THREE.Vector3(0, 1, 0)
const DIRECT = {
  FRONT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, 0),
  LEFT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, Math.PI / 2),
  BACK: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, Math.PI),
  RIGHT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, - Math.PI / 2),
}

export class Hina extends Character {
  constructor(world) {
    super(world)

    this.state = 'idle'
    this.source = ResourceManager.get('Hina-re')
    this.object = clone(this.source.scene)
    this.fire = this.object.getObjectByName('fire_01')
    this.speed = 0.1
    this.rotateSpeed = 10

    this.attackSpeed = 10
    this.attackProcess = 0

    this.size = this.getGroupSize()
    this.forward = 'front'
    // this.object.children[0].setRotationFromEuler(Math.PI / 2)
    this.object.position.set(0, 0, 0)
    this.object.add(new THREE.Box3Helper(this.size, 0xff0000))
    // this.size.multiplyVectors(this.size, this.object.scale)
    this.animations = this.source.animations
    this.mixer = new THREE.AnimationMixer(this.object)
    this.children = []

    this.fireEffect = new THREE.Sprite(genFireMaterial({
      map: ResourceManager.get('fire')
    }))
    this.world.add(this.fireEffect)

    this.mixMouth()

    this.play(Action.NORMAL_IDLE)
  }
  add(obj) {
    this.object.add(obj)
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
  }
  moveEnd() {
    this.state = 'idle'
    this.play(Action.NORMAL_IDLE, 0.3)
  }
  attack() {
    this.play(Action.NORMAL_ATTACK_ING, 0.3)
    this.state = 'attacking'
  }
  stop() {
    this.moveEnd()
  }
  update() {
    if (this.state === 'moving') {
      const delta = this.delta
      const currentSpeed = this.speed * this.startAction.getEffectiveWeight()
      switch (this.forward) {
        case 'front':
          this.object.position.z -= currentSpeed
          this.object.quaternion.rotateTowards(DIRECT.FRONT, delta * this.rotateSpeed)
          break
        case 'left':
          this.object.position.x -= currentSpeed
          this.object.quaternion.rotateTowards(DIRECT.LEFT, delta * this.rotateSpeed)
          break
        case 'back':
          this.object.position.z += currentSpeed
          this.object.quaternion.rotateTowards(DIRECT.BACK, delta * this.rotateSpeed)
          break
        case 'right':
          this.object.position.x += currentSpeed
          this.object.quaternion.rotateTowards(DIRECT.RIGHT, delta * this.rotateSpeed)
          break
      }
    }
    if (this.state === 'attacking') {
      this.attackProcess += this.delta * this.attackSpeed
      if (this.attackProcess >= 1) {
        const firePos = new THREE.Vector3()
        this.fire.getWorldPosition(firePos)
        const bullet = new Bullet(this.world, firePos)
        this.world.add(bullet)

        this.attackProcess = 0
      }
    }
    this.children.forEach((item, index) => {
      const res = item.tick(this.delta)
      if (!res) {
        this.children.splice(index, 1)
      }
    })
  }

  play(index, duration = 1) {
    return new Promise(resolve => {
      const action = this.mixer.clipAction(this.animations[index])
      action.play()
      const endFn = () => {
        this.mixer.removeEventListener('loop', endFn)
        resolve(true)
      }
      this.mixer.addEventListener("loop", endFn)
      if (this.startAction) {
        this.startAction && setWeight(action, 0)
        this.executeCrossFade(action, duration)
      }
      this.startAction = action
    })
  }
}


function setWeight(action, weight) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}
