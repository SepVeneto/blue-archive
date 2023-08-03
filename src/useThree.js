import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import createFloor from './components/floor'
import { createFace } from './components/face';
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
  'mouth': 0,
}
const mouths = [
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
let m
const uniforms = {
  mouth_texture: { value: null },
  mouth_offset: { value: new THREE.Vector2(0.75, 0.25) },
}
gui.add(settings, 'cafe idle')
gui.add(settings, 'cafe reaction')
gui.add(settings, 'ex')
gui.add(settings, 'move')
gui.add(settings, 'mouth', mouths.reduce((obj, curr, i) => {
  obj[i] = curr
  return obj
}, {})).onChange(val => {
  uniforms.mouth_offset.value = val
  // m.needsUpdate = true
})
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

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );

  const floor = createFloor()
  scene.add(floor)

  const hemiLight = new THREE.HemisphereLight( 0xFFFFFF, 0x8d8d8d, 3);
	hemiLight.position.set( 0, 20,0 );
	scene.add( hemiLight );


  const clock = new THREE.Clock()

  let i = 0
  function animate() {
	  requestAnimationFrame( animate );
    const delta = clock.getDelta()
    if (mixer) mixer.update(delta)
    // uniforms.mouth_offset.value = mouths[Math.floor(i / 6 % 16)]
    // ++i
    // if (i === 160) i = 0

	  renderer.render( scene, camera );
  }

  onMounted(async () => {
    dom.value.appendChild( renderer.domElement );
    const controls = new OrbitControls(camera, renderer.domElement)

    const gltf = await loadGltf('/Hina_Original/Hina_Original.gltf')
    animations = gltf.animations
    const obj = gltf.scene

    await mixMouth(obj)

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

function loadGltf(url) {
  return new Promise(resolve => {
    const loader = new GLTFLoader()
    loader.load(url, async (gltf) => {
      mixer = new THREE.AnimationMixer(gltf.scene)
      mixer.clipAction(gltf.animations[Hina.EXS_CUTIN]).play()

      gltf.scene.traverse( function ( object ) {
        if ( object.isMesh ) {
          object.castShadow = true;
          object.material.vertexColors = false
        }
      })

      // const skeletonHelper = new THREE.SkeletonHelper(gltf.scene)
      // skeletonHelper.visible = false

      // gui.add(settings, 'show skeleton').onChange((val) => {
      //   skeletonHelper.visible = val
      // })
      // console.log(obj)
      // gltf.scene.add(skeletonHelper) 

      resolve(gltf)
    })
  })
}

async function mixMouth(object) {
  const obj = object.getObjectByName('Hina_Original_Body_3')
  const mouthTex = await loadTexture('/Hina_Original/Hina_Mouth.png')
  mouthTex.colorSpace = THREE.SRGBColorSpace

  obj.material.transparent = true
  createFace(obj.material, uniforms)
  m = obj.material
  uniforms.mouth_texture.value = mouthTex
  obj.material.needsUpdate = true
}

function loadTexture(url) {
  return new Promise(resolve => {
    const loader = new THREE.TextureLoader().load(url, (tex) => {
      resolve(tex)
    })
  })
}