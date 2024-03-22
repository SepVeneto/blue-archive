import { Character } from "./Character";
import { ResourceManager } from '@/resources'
import { World } from '../world/Event'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Animation } from '@/Animation'

export class Police extends Character {
  public source
  public animations
  public animation: Animation
  constructor(world: World) {
    super(world)
    this.source = ResourceManager.get('Police')
    this.object = clone(this.source.scene)

    this.animations = this.source.animations
    this.animation = new Animation(this.object, this.source.animations)
    this.mixer = this.animation.mixer
    this.animation.play('Run')
  }

  add(obj: any) {
    this.object.add(obj)
  }
}