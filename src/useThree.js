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
  'modify callsign weight': 0,
  'modify moveing weight': 0,
  'modify endstand weight': 1,
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
gui.add(settings, 'modify callsign weight', 0, 1, 0.01).listen()
gui.add(settings, 'modify moveing weight', 0, 1, 0.01).listen()
gui.add(settings, 'modify endstand weight', 0, 1, 0.01).listen()

gui.add(settings, 'mouth', mouths.reduce((obj, curr, i) => {
  obj[i] = curr
  return obj
}, {})).onChange(val => {
  uniforms.mouth_offset.value = val
  // m.needsUpdate = true
})

let callsign
let moveing
let endstand

function playMove() {
  if (isAnimatePlay) {
    mixer.stopAllAction()
    isAnimatePlay = false
    playCafeReaction()
  } else {
    // callsign = mixer.clipAction(animations[Hina.MOVE_CALLSIGN])
    // callsign.name = 'callsign'
    // // callsign.loop = THREE.LoopOnce
    // callsign.play()
    // callsign.weight = 1
    moveing = mixer.clipAction(animations[Hina.MOVE_ING])
    moveing.name = 'moveing'
    moveing.play()
    // moveing.play()
    moveing.weight = 1
    endstand = mixer.clipAction(animations[Hina.MOVE_END_STAND])
    endstand.play()
    endstand.loop = THREE.LoopOnce
    endstand.weight = 0

    let currentAction = callsign

    // const actions = [Hina.MOVE_CALLSIGN, Hina.MOVE_ING, Hina.MOVE_END_STAND]
    syncCrossFade(moveing, endstand, 0)
    let current = 0
    function syncCrossFade(startAction, endAction, duration) {
      mixer.addEventListener('loop', onLoopFinished)
      function onLoopFinished(event) {
        if (event.action === startAction) { 
          mixer.removeEventListener('loop', onLoopFinished)

          endAction.setEffectiveTimeScale(1)
          endAction.setEffectiveWeight(1)
          endAction.time = 0

          startAction.crossFadeTo(endAction, duration, true)
        }
      }
    }
    // play(Hina.MOVE_CALLSIGN)
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

    callsign && (settings['modify callsign weight'] = callsign.getEffectiveWeight())
    moveing && (settings['modify moveing weight'] = moveing.getEffectiveWeight())
    endstand && (settings['modify endstand weight'] = endstand.getEffectiveWeight())

    if (forward) {
      hina.position.z -= 0.001
      camera.position.z -= 0.001
      controls.target.z -= 0.001
    }
    if (left) {
      hina.position.x -= 0.001
      camera.position.x -= 0.001
      controls.target.x -= 0.001
    }

	  renderer.render( scene, camera );
  }
  let forward = false
  let left = false
  let hina
  let controls
  let dir = 'frontend'

  onMounted(async () => {
    document.addEventListener('keydown', (evt) => {
      if (evt.key.toLowerCase() === 'w') {
        forward = true
        dir = 'frontend'
      }
      if (evt.key.toLowerCase() === 'a') {
        left = true
        hina.setRotationFromEuler(Math.PI / 2)
        dir = 'left'
      }
    })
    document.addEventListener('keyup', (evt) => {
      if (evt.key.toLowerCase() === 'w') {
        forward = false
      }
      if (evt.key.toLowerCase() === 'a') {
        left = false
      }
    })
    dom.value.appendChild( renderer.domElement );
    controls = new OrbitControls(camera, renderer.domElement)

    const gltf = await loadGltf('/Hina_Original/Hina_Original.gltf')
    animations = gltf.animations
    const obj = gltf.scene
    hina = obj

    if (hina) {
      switch(dir) {
        case 'left':
          console.log(hina.rotation)
          hina.setRotationFromAxisAngle(Math.PI / 2)
          break
        case 'frontend':
          // hina.setRotationFromAxisAngle(0)
          break
      }
    }

    await mixMouth(obj)

    scene.add(new THREE.AxesHelper(1))


    scene.add(obj)
    const target = obj.position.clone()
    camera.position.set(target.x, target.y, -(target.z + 0.03))

    camera.lookAt(hina)
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
      mixer.clipAction(gltf.animations[Hina.MOVE_ING]).play()

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