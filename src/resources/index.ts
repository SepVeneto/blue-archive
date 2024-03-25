import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EventEmit } from '../EventEmit'

const RESOURCE_MAP = [
  {
    name: 'Mouth',
    type: 'texture',
    src: '/Hina_Original/Hina_Mouth.png',
  },
  {
    name: 'Hina-re',
    type: 'gltf',
    src: '/hina.glb'
  },
  {
    name: 'Police',
    type: 'gltf',
    src: '/police.glb'
  },
  {
    name: 'fire',
    type: 'texture',
    src: '/FX_TEX_Shock_Wave_19.png',
  }
]

export class ResourceManager extends EventEmit {
  static resource: Record<string, any> = {}
  public total = 0
  public current = 0
  constructor() {
    super()

    ResourceManager.resource = {}
    this.total = RESOURCE_MAP.length
    this.current = 0
    RESOURCE_MAP.forEach(config => {
      switch(config.type) {
        case 'gltf':
          this.loadGltf(config.src).then(gltf => {
            ResourceManager.resource[config.name] = gltf
            this.check()
          })
          break
        case 'texture':
        case 'alpha':
        case 'spec':
        case 'normal':
          this.loadTexture(config.src).then(tex => {
            ResourceManager.resource[config.name] = tex
            this.check()
          })
      }
    })
  }

  static get(name: string) {
    return ResourceManager.resource[name]
  }

  check() {
    ++this.current
    if (this.current === this.total) {
      this.$emit('finish')
    }
  }
  loadGltf(url: string) {
    return new Promise(resolve => {
      const loader = new GLTFLoader()
      loader.load(url, async (gltf) => {

        gltf.scene.traverse( function ( object: any ) {
          if ( object.isMesh ) {
            object.castShadow = true;
            object.receiveShadow = true
            // object.material.vertexColors = false
            // const origin = object.material
            // object.material = new THREE.MeshToonMaterial({
            //   name: object.name,
            //   map: origin.map
            // })
            // if (object.name === 'Hina_Original_Body_5') {
            //   object.material.spec
            // }
          }
        })
        console.log(gltf)
        // gltf.scene.scale.set(100, 100, 100)
        resolve(gltf)
      })
    })
  }
  loadTexture(url: string) {
    return new Promise(resolve => {
      const loader = new THREE.TextureLoader()
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        resolve(tex)
      })
    })
  }
}