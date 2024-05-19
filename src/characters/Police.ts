import { Character } from "./Character";
import { ResourceManager } from '@/resources'
import { World } from '../world/Event'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Animation } from '@/Animation'
import * as THREE from 'three'
import { gui } from '../utils/gui'
import { Weapon } from "@/weapon";

export class Police extends Character {
  POSITION_THRESOLD = 0.5
  public speed = 5
  public rotate = 1
  public source
  public animations
  public animation: Animation
  private target?: THREE.Vector2
  private offset = new THREE.Vector2()
  public equipments: Weapon[] = []
  constructor(world: World) {
    super(world)
    this.source = ResourceManager.get('Police')
    this.object = clone(this.source.scene)
    gui.add(this.object.rotation, 'x').onChange((x: number) => {
      const { y, z } = this.object.rotation
      this.object.rotation.set(x, y, z)
    }).listen(true)
    gui.add(this.object.rotation, 'y').onChange((y: number) => {
      const { x, z } = this.object.rotation
      this.object.rotation.set(x, y, z)
    }).listen(true)
    gui.add(this.object.rotation, 'z').onChange((z: number) => {
      const { x, y  } = this.object.rotation
      this.object.rotation.set(x, y, z)
    }).listen(true)

    this.animations = this.source.animations
    this.animation = new Animation(this.object, this.source.animations)
    this.mixer = this.animation.mixer
    this.animation.play('Idle')

  }

  get x() {
    return this.object.position.x
  }
  set x(val: number) {
    this.object.position.setX(val)
  }
  get y() {
    return this.object.position.y
  }
  set y(val: number) {
    this.object.position.setY(val)
  }
  get z() {
    return this.object.position.z
  }
  set z(val: number) {
    this.object.position.setZ(val)
  }

  add(obj: any) {
    this.object.add(obj)
  }

  update() {
    this.equipments.forEach(item => {
      item.update()
    })

    if (!this.target) return

    if (this.isTarget(this.target)) {
      this.animation.play('Idle', 0.2)
      this.target = undefined
      return
    }

    this.x += this.delta * this.offset.x * this.speed
    this.z += this.delta * this.offset.y * this.speed
  }

  private isTarget(vec: THREE.Vector2) {
    const offsetX = vec.x - this.x
    const offsetY = vec.y - this.z
    return Math.abs(offsetX) < this.POSITION_THRESOLD && Math.abs(offsetY) < this.POSITION_THRESOLD
  }

  moveTo(target: THREE.Vector2) {
    this.animation.play('Run', 0.2)
    this.target = target

    const offsetX = this.target.x - this.x
    const offsetY = this.target.y - this.z
    const dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    this.offset.x = offsetX / dist
    this.offset.y = offsetY / dist

    const radius = Math.atan2(this.offset.x, this.offset.y)
    this.object.rotation.y = radius
  }

  equip(weapon: Weapon) {
    const center = new THREE.Vector2(this.x, this.z)
    weapon.init(center)
    this.equipments.push(weapon)
    this.object.add(weapon.group)
  }
}