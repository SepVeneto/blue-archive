import * as THREE from 'three'
import { ResourceManager } from '@/resources'
import { Character } from './Character'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Hina as Action } from '../constant'
import { Bullet } from './Bullet'
import { World } from '../world/Event'
import genFireMaterial from '../components/fire'
import { gui } from '../world/Debug'
import { Animation } from '@/Animation'

const DIRECT_AXIS = new THREE.Vector3(0, 1, 0)
const DIRECT = {
  FRONT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, 0),
  LEFT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, Math.PI / 2),
  BACK: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, Math.PI),
  RIGHT: new THREE.Quaternion().setFromAxisAngle(DIRECT_AXIS, - Math.PI / 2),
}

export class Hina extends Character {
  state = 'idle'
  public source
  public fire
  public speed
  public rotateSpeed
  public attackSpeed
  public attackProcess
  public size
  public forward
  public animations
  public children: any[] = []
  public fireOffset
  public fireEffect
  public fireUpdate
  public startAction: THREE.AnimationAction | undefined
  public animation: Animation
  constructor(world: World) {
    super(world)

    this.source = ResourceManager.get('Hina-re')
    this.object = clone(this.source.scene)
    this.fire = this.object.getObjectByName('fire_01')
    // const characterFolder = gui.addFolder('Character')

    // characterFolder.add(this, 'state').listen()
    this.speed = 0.1
    this.rotateSpeed = 10

    this.attackSpeed = 10
    this.attackProcess = 0

    this.size = this.getGroupSize()
    this.forward = 'front'
    // this.object.children[0].setRotationFromEuler(Math.PI / 2)
    this.object.position.set(0, 0, 0)
    this.object.add(new THREE.Box3Helper(this.size, new THREE.Color(0xff0000)))
    // this.size.multiplyVectors(this.size, this.object.scale)
    this.animations = this.source.animations
    this.children = []

    this.animation = new Animation(this.object, this.source.animations)

    const fireTex = ResourceManager.get('fire')
    // fireTex.wrapS = fireTex.wrapT = THREE.RepeatWrapping
    const fireGeo = new THREE.PlaneGeometry(1, 1)
    fireGeo.translate(0.5, 0, 0)
    this.fireOffset = new THREE.Vector2(0, 0)
    this.fireEffect = new THREE.Mesh(fireGeo, genFireMaterial({
      map: fireTex,
      offset: this.fireOffset,
      repeat: new THREE.Vector2(0.5, 0.5),
    }))
    this.fireEffect.scale.set(0.5, 0.5, 0.5)
    this.fireEffect.rotateY(Math.PI / 2)
    this.fireUpdate = this.textureAnimation(2, 2, 4, 0.01)

    // this.world.add(this.fireEffect)

    this.mixMouth()

    // const action = this.mixer?.clipAction(this.animations[Action.NORMAL_IDLE])
    // const mixer = this.animation.mixer
    // this.mixer = new THREE.AnimationMixer(this.object)
    // const mixer = this.mixer
    this.mixer = this.animation.mixer
    // this.animation.mixer.clipAction(this.animations[Action.NORMAL_IDLE]).play()
    this.animation.play(Action.NORMAL_IDLE)
    // this.play(Action.NORMAL_IDLE)
  }
  add(obj: any) {
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


  executeCrossFade(action: any, duration: number) {
    setWeight(action, 1)

    action.time = 0
    this.startAction?.crossFadeTo?.(action, duration, false)
  }

  moveStart() {
    if (this.state === 'moving') return

    this.state = 'moving'
    this.animation.play(Action.MOVE_ING, 0.3)
    // this.play(Action.MOVE_ING, 0.3)
  }
  turn(direct: string) {
    if (this.forward === direct) return
    this.forward = direct
  }
  moveEnd() {
    this.state = 'idle'
    this.animation.play(Action.NORMAL_IDLE, 0.3)
    // this.play(Action.NORMAL_IDLE, 0.3)
  }
  async attack() {
    const isFinish = await this.animation.play(Action.NORMAL_ATTACK_ING, 0.3)
    if (!isFinish) return
    this.object.add(this.fireEffect)
    this.state = 'attacking'
  }
  stop() {
    this.moveEnd()
    this.object.remove(this.fireEffect)
  }
  update() {
    if (this.state === 'moving') {
      const delta = this.delta
      const currentSpeed = this.speed * this.animation.getCurrentWeight()
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
    const firePos = new THREE.Vector3()
    this.fire.getWorldPosition(firePos)
    this.fireEffect.position.copy(firePos)

    if (this.state === 'attacking') {
      this.attackProcess += this.delta * this.attackSpeed
      if (this.attackProcess >= 1) {
        const bullet = new Bullet(this.world, firePos)
        this.fireUpdate(this.delta)
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

  // play(index: number, duration = 1) {
  //   return new Promise(resolve => {
  //     const action = this.mixer?.clipAction(this.animations[index])
  //     console.log(this.animations[index])
  //     // action?.play()
  //     const endFn = () => {
  //       this.mixer?.removeEventListener('loop', endFn)
  //       resolve(true)
  //     }
  //     this.mixer?.addEventListener("loop", endFn)
  //     // if (this.startAction && action) {
  //     //   this.startAction && setWeight(action, 0)
  //     //   this.executeCrossFade(action, duration)
  //     // }
  //     // this.startAction = action
  //   })
  // }

  textureAnimation(tilesHoriz: number, tilesVert: number, numTiles: number, duration: number) {
    let currentTime = 0
    let currentTile = 0

    return (delta: number) => {
      currentTime += delta
      while (currentTime > duration) {
        currentTime = 0
        ++currentTile

        if (currentTile === numTiles) currentTile = 0

        const currentColumn = currentTile % tilesHoriz
        this.fireOffset.x = currentColumn / tilesHoriz
        const currentRow = Math.floor(currentTile / tilesHoriz)
        this.fireOffset.y = currentRow / tilesVert
      }
    }
  }
}


function setWeight(action: THREE.AnimationAction, weight: number) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}
