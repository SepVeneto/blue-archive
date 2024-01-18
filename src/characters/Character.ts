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
  object: any = undefined
  public delta: number = 0
  world: World

  constructor(world: World) {
    super()
    this.world = world
  }

  setMouth(index: number) {
    this.uniforms.mouth_offset.value = MOUTHS[index]
  }
  mixMouth() {
    const obj = this.object.getObjectByName('Hina_Original_Body_3')
    const mouthTex = ResourceManager.get('Mouth')

    obj.material.transparent = true
    createFace(obj.material, this.uniforms)
    this.uniforms.mouth_texture.value = mouthTex
    obj.material.needsUpdate = true
  }
  update() {}
  tick(delta: number) {
    if (!this.mixer) return

    this.delta = delta
    this.mixer.update(delta)
    this.update?.()
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