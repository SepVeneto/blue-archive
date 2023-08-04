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
    name: 'Hina',
    type: 'gltf',
    src: '/Hina_Original/Hina_Original.gltf',
  },
  {
    name: 'HinaHairMask',
    type: 'normal',
    src: '/Hina_Original/Hina_Original_Face_Mask.png',
  },
  {
    name: 'HinaWeaponMask',
    type: 'normal',
    src: '/Hina_Original/Hina_Original_Weapon_Mask.png',
  },
  {
    name: 'HinaBodyMask',
    type: 'normal',
    src: '/Hina_Original/Hina_Original_Body_Mask.png',
  },
  {
    name: 'HinaFaceMask',
    type: 'normal',
    src: '/Hina_Original/Hina_Original_Face_Mask.png',
  }
]

export class ResourceManager extends EventEmit {
  static resource = {}
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
        case 'normal':
          this.loadTexture(config.src).then(tex => {
            ResourceManager.resource[config.name] = tex
            this.check()
          })
      }
    })
  }

  static get(name) {
    return ResourceManager.resource[name]
  }

  check() {
    ++this.current
    if (this.current === this.total) {
      this.$emit('finish')
    }
  }
  loadGltf(url) {
    return new Promise(resolve => {
      const loader = new GLTFLoader()
      loader.load(url, async (gltf) => {

        gltf.scene.traverse( function ( object ) {
          if ( object.isMesh ) {
            object.castShadow = true;
            object.material.vertexColors = false
          }
        })
        gltf.scene.scale.set(100, 100, 100)
        resolve(gltf)
      })
    })
  }
  loadTexture(url) {
    return new Promise(resolve => {
      const loader = new THREE.TextureLoader()
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        resolve(tex)
      })
    })
  }
}