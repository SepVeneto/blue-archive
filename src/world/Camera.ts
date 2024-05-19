import * as THREE from 'three'
import { World } from './Event';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Character } from '@/characters/Character';

type Follower = {
  instance: Character
  previous: [number, number]
}

export class Camera {
  public world: World
  public renderer: THREE.Renderer
  public object: THREE.PerspectiveCamera
  public controls?: OrbitControls
  public helper: THREE.CameraHelper
  public follower?: Follower

  constructor(world: World, renderer: THREE.Renderer) {
    this.world = world
    this.renderer = renderer
    this.object = new THREE.PerspectiveCamera( 50, 2, 5, 100);

    this.helper = new THREE.CameraHelper(this.object)
    this.world.add(this.helper)

    this.setPosition()
  }

  setPosition() {
    this.object.position.set(0, 10, 20)
  }
  setControls(dom: HTMLElement) {
    this.controls = new OrbitControls(this.object, dom)
    this.controls.mouseButtons = {
      LEFT: undefined,
      MIDDLE: undefined,
      RIGHT: THREE.MOUSE.ROTATE
    }
  }
  setFollow(follower?: Character) {
    if (!follower) {
      this.follower = undefined
      return
    }

    this.follower = {
      instance: follower,
      previous: [follower.x, follower.z],
    }
  }

  tick() {
    if (this.follower) {
      const current: [number, number] = [this.follower.instance.x, this.follower.instance.z]
      const offset = [
        current[0] - this.follower.previous[0],
        current[1] - this.follower.previous[1],
      ] as [number, number]
      // console.log([...offset])
      this.object.position.x += offset[0]
      this.object.position.z += offset[1]
      this.object.lookAt(this.follower.instance.position)

      this.follower.previous = [...current]
    }
  }
}