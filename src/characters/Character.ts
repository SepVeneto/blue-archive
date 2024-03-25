import { createFace } from '../components/face'
import * as THREE from 'three'
import { ResourceManager } from '../resources'
import { Debug } from '../world/Debug'
import { World } from '../world/Event'

const MOUTHS = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(0.25, 0),
  new THREE.Vector2(0.5, 0),
  new THREE.Vector2(0.75, 0),
  new THREE.Vector2(0, 0.25),
  new THREE.Vector2(0.25, 0.25),
  new THREE.Vector2(0.5, 0.25),
  new THREE.Vector2(0.75, 0.25),
  new THREE.Vector2(0, 0.5),
  new THREE.Vector2(0.25, 0.5),
  new THREE.Vector2(0.5, 0.5),
  new THREE.Vector2(0.75, 0.5),
  new THREE.Vector2(0, 0.75),
  new THREE.Vector2(0.25, 0.75),
  new THREE.Vector2(0.5, 0.75),
  new THREE.Vector2(0.75, 0.75),
]

export class Character extends Debug {
  uniforms = {
    mouth_texture: { value: null },
    mouth_offset: { value: new THREE.Vector2(0.75, 0.25) },
  }
  public mixer: THREE.AnimationMixer | undefined
  public startAction: THREE.AnimationAction | undefined
  object: THREE.Object3D = new THREE.Group()
  public delta: number = 0
  world: World

  constructor(world: World) {
    super()
    this.world = world
  }

  get position() {
    return this.object.position
  }
  get x() {
    return this.object.position.x
  }
  get z() {
    return this.object.position.z
  }
  set x(value: number) {
    this.object.position.x = value
  }
  set z(value: number) {
    this.object.position.z = value
  }

  update() {}
  tick(delta: number) {
    if (!this.mixer) return

    this.delta = delta
    this.mixer.update(delta)
    this.update?.()
  }
  executeCrossFade(action: any, duration: number) {
    setWeight(action, 1)

    action.time = 0
    this.startAction?.crossFadeTo?.(action, duration, false)
  }
  // 获取Group的尺寸
  getGroupSize() {
    const bbox = new THREE.Box3(); // 创建一个边界盒

    // 遍历Group的所有子对象，扩展边界盒
    this.object.children[0].traverse((child: any) => {
      if (child.geometry) {
        child.geometry.computeBoundingBox();
        bbox.expandByPoint(child.geometry.boundingBox.min);
        bbox.expandByPoint(child.geometry.boundingBox.max);
      }
    });

    // 计算边界盒的尺寸
    const size = new THREE.Vector3();
    bbox.getSize(size);

    return bbox;
  }
}

function setWeight(action: THREE.AnimationAction, weight: number) {
  action.enabled = true
  action.setEffectiveTimeScale(1)
  action.setEffectiveWeight(weight)
}