import { onMounted, onUnmounted, shallowRef } from 'vue';
import * as THREE from 'three';
import createFloor from './components/floor'
import { createFace } from './components/face';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Hina } from './constant';
import GUI from 'lil-gui'
const gui = new GUI()

let isAnimatePlay = false
let mixer
let animations = []

const settings = {
  'show skeleton': false,
  'cafe idle': playCafeIdle,
  'cafe reaction': playCafeReaction,
  'ex': playEx,
  'move': playMove,
}
gui.add(settings, 'cafe idle')
gui.add(settings, 'cafe reaction')
gui.add(settings, 'ex')
gui.add(settings, 'move')
function playMove() {
  if (isAnimatePlay) {
    mixer.stopAllAction()
    isAnimatePlay = false
    playCafeReaction()
  } else {
    const actions = [Hina.MOVE_CALLSIGN, Hina.MOVE_ING, Hina.MOVE_END_STAND]
    let current = 0
    mixer.addEventListener('finished', () => {
      current += 1
      const type = actions[current]
      if (!type) return
      play(type)

    })
    play(Hina.MOVE_CALLSIGN)
  }
}
function play(type) {
  const action = mixer.clipAction(animations[type])
  action.loop = THREE.LoopOnce
  action.play()
  isAnimatePlay = true
}
function playEx() {
  if (isAnimatePlay) {
    mixer.stopAllAction()
    isAnimatePlay = false
    playEx()
  } else {
    const action = mixer.clipAction(animations[Hina.EXS_CUTIN])
    action.loop = THREE.LoopOnce
    mixer.addEventListener('finished', () => {
      action.stop()
      const a = mixer.clipAction(animations[Hina.EXS])
      a.loop = THREE.LoopOnce
      a.play()
    })
    action.play()
    isAnimatePlay = true
  }
}
function playCafeReaction() {
  if (isAnimatePlay) {
    mixer.stopAllAction()
    isAnimatePlay = false
    playCafeReaction()
  } else {
    const action = mixer.clipAction(animations[Hina.CAFE_REACTION])
    action.play()
    isAnimatePlay = true
  }
}
function playCafeIdle() {
  if (isAnimatePlay) {
    mixer.stopAllAction()
    isAnimatePlay = false
    playCafeIdle()
  } else {
    const action = mixer.clipAction(animations[Hina.CAFE_IDLE])
    action.play()
    isAnimatePlay = true
  }
}



export function useThree(dom) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 20);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );

  const floor = createFloor()
  scene.add(floor)

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 1);
	hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight );


  const clock = new THREE.Clock()

  function animate() {
	  requestAnimationFrame( animate );
    const delta = clock.getDelta()
    if (mixer) mixer.update(delta)


	  renderer.render( scene, camera );
  }

  onMounted(async () => {
    dom.value.appendChild( renderer.domElement );
    const controls = new OrbitControls(camera, renderer.domElement)

    const gltf = await loadGltf('/Hina_Original/Hina_Original.gltf')
    animations = gltf.animations
    const obj = gltf.scene
    // const obj = await loadObj('/fbx/Hina_Original/Hina_Original.fbx')
    console.log(obj)

    scene.add(new THREE.AxesHelper(1))


    scene.add(obj)
    const target = obj.position.clone()
    camera.position.set(target.x, target.y, -(target.z + 0.03))

    camera.lookAt(target)
    animate();
  })
  onUnmounted(() => {
    dom.value.removeChild(renderer.domElement)
  })
}

function loadObj(url) {
  return new Promise(resolve => {
    const loader = new FBXLoader()
    loader.load(url, async (obj) => {
      mixer = new THREE.AnimationMixer(obj)
      mixer.clipAction(obj.animations[0]).play()

      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      resolve(obj)
    })
  })
}

function loadGltf(url) {
  return new Promise(resolve => {
    const loader = new GLTFLoader()
    loader.load(url, async (gltf) => {
      mixer = new THREE.AnimationMixer(gltf.scene)

      // actions.filter(item => !!item).forEach((action, index) => {
      //   settings[action] = false
      //   gui.add(settings, action).onChange((val) => {
      //     const animate = gltf.animations[index]
      //     const clipAction = mixer.clipAction(animate)
      //     if (val) {
      //       clipAction.play()
      //     } else {
      //       clipAction.stop()
      //     }
      //   })
      // })
      // gui.add(settings, 'cafe_idle')
      // gui.add(settings, 'cafe_reaction')
      // gltf.animations.forEach(a => {
      //   console.log(a)
      //   gui.add(settings, a.name).onChange((val) => {
      //     if (val) {
      //       mixer.clipAction(gltf.animations.filter(i => i.name === a.name)[0])
      //     }
      //   })
      // })
      gltf.scene.traverse( function ( object ) {
        if ( object.isMesh ) {
          object.castShadow = true;
        }
      })

      const skeletonHelper = new THREE.SkeletonHelper(gltf.scene)
      skeletonHelper.visible = false

      gui.add(settings, 'show skeleton').onChange((val) => {
        skeletonHelper.visible = val
      })
      // console.log(obj)
      gltf.scene.add(skeletonHelper)

      const obj = gltf.scene.getObjectByName('Hina_Original_Body_3')
      const material = obj.material

      material.onBeforeCompile = (shader) => {
        console.log()
        const frag = shader.fragmentShader.split('\n')
      }

      // material.needsUpdate = true
      // material.transparent = true

      const mouthTex = await loadTexture('/Hina_Original/Hina_Mouth.png')
      mouthTex.encoding = THREE.sRGBEncoding
      const eyeTex = await loadTexture('/Hina_Original/Hina_Original_EyeMouth.png')
      eyeTex.encoding = THREE.sRGBEncoding

      material.map = eyeTex

      const faceMaterial = createFace(eyeTex, mouthTex)
      faceMaterial.map = eyeTex
      // // const faceMaterial = material.clone()
      // // faceMaterial.map = eyeTex
      // // faceMaterial.needsUpdate = true
      // faceMaterial.uniforms.texture1.value = eyeTex
      // faceMaterial.uniforms.texture2.value = mouthTex
      // faceMaterial.uniforms.offset.value.set(0.25, 0.75)

      // console.log(obj.material, faceMaterial)
      obj.material = faceMaterial

      resolve(gltf)
    })
  })
}

function loadTexture(url) {
  return new Promise(resolve => {
    const loader = new THREE.TextureLoader().load(url, (tex) => {
      resolve(tex)
    })
  })
}