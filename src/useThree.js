import { onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import createFloor from './components/floor'
import { createFace } from './components/face';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Hina } from './constant';
import GUI from 'lil-gui'
import { Hina as ChHina } from './characters'
import { ResourceManager } from './resources';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

const gui = new GUI()

let isAnimatePlay = false
let mixer
let animations = []

const settings = {
  'show skeleton': false,
  'cafe idle': playCafeIdle,
  'cafe walk': () => hina.play(Hina.CAFE_WALK),
  'cafe reaction': playCafeReaction,
  'ex': playEx,
  'move': playMove,
  'mouth': 0,
  'modify callsign weight': 0,
  'modify moveing weight': 0,
  'modify endstand weight': 1,
  'metalness': 1,
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
const uniforms = {
  mouth_texture: { value: null },
  mouth_offset: { value: new THREE.Vector2(0.75, 0.25) },
}
gui.add(settings, 'cafe idle')
gui.add(settings, 'cafe walk')
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
let hina

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
  hina.play(Hina.CAFE_REACTION)
}
function playCafeIdle() {
  hina.play(Hina.CAFE_IDLE)
  // if (isAnimatePlay) {
  //   mixer.stopAllAction()
  //   isAnimatePlay = false
  //   playCafeIdle()
  // } else {
  //   const action = mixer.clipAction(animations[Hina.CAFE_IDLE])
  //   action.play()
  //   isAnimatePlay = true
  // }
}

const resourceManager = new ResourceManager()
export function useThree(dom) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 10, 2000);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF)
  scene.add(ambientLight)
  const directionLight = new THREE.DirectionalLight(0xFFFFFF, 2)
  directionLight.position.set(0, 0, -1)
  scene.add(directionLight)
  scene.add(new THREE.DirectionalLightHelper(directionLight, 1))

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true
  const floor = createFloor()
  scene.add(floor)
  scene.add(new THREE.AxesHelper(140))

  const pointLight = new THREE.PointLight( 0xFFFFFF, 0.01);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.01)
	scene.add( pointLight);
  scene.add(pointLightHelper)

  const objs = []

  // const composer = new EffectComposer(renderer)
  // composer.addPass(new RenderPass(scene, camera))

  // const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera)
  // outlinePass.visibleEdgeColor = 0x000000
  // outlinePass.edgeStrength = 0.0001
  // outlinePass.edgeGlow = 0
  // outlinePass.edgeThickness = 1
  // outlinePass.pulsePeriod = 0
  // composer.addPass(outlinePass)

  // const outputPass = new OutputPass()
  // composer.addPass(outputPass)

  // const effectFXAA = new ShaderPass(FXAAShader)
  // effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
  // composer.addPass(effectFXAA)

  resourceManager.$on('finish', () => {
    hina = new ChHina()
    objs.push(hina)
    scene.add(hina.object)
    hina.play(Hina.CAFE_IDLE)

    // hina.play(Hina.FORMATION_IDLE)
    // const skeletonHelper = new THREE.SkeletonHelper(hina.object)
    // scene.add(skeletonHelper)
    // hina.setHairSpec()

    // const hina2 = new ChHina()
    // objs.push(hina2)
    // scene.add(hina2.object)
    // hina2.object.position.x += 10
    // hina2.play(Hina.MOVE_ING)
    // hina2.setHairSpec()

    const target = hina.object.position.clone()
    camera.position.set(target.x, target.y, (target.z + 200))
    camera.lookAt(hina)

    // outlinePass.selectedObjects = [hina.object, hina2.object]
  })

  const clock = new THREE.Clock()

  let i = 0
  function animate() {
	  requestAnimationFrame( animate );
    const delta = clock.getDelta()
    const time = -performance.now() * 0.0003

    objs.forEach(inst => inst.tick(delta))
    // uniforms.mouth_offset.value = mouths[Math.floor(i / 6 % 16)]
    // ++i
    // if (i === 160) i = 0

    // callsign && (settings['modify callsign weight'] = callsign.getEffectiveWeight())
    // moveing && (settings['modify moveing weight'] = moveing.getEffectiveWeight())
    // endstand && (settings['modify endstand weight'] = endstand.getEffectiveWeight())

    // pointLight.position.set(
    //   Math.sin(time* 1.7),
    //   Math.cos(time* 1.5),
    //   Math.cos(time* 1.3),
    // )

    // if (forward) {
    //   pointLight.position.z -= 0.001
    //   camera.position.z -= 0.001
    //   controls.target.z -= 0.001
    // }
    // if (left) {
    //   pointLight.position.x -= 0.001
    //   camera.position.x -= 0.001
    //   controls.target.x -= 0.001
    // }

	  renderer.render( scene, camera );
    // composer.render()
  }
  let forward = false
  let left = false
  let controls
  let dir = 'frontend'

  onMounted(async () => {
    // document.addEventListener('keydown', (evt) => {
    //   if (evt.key.toLowerCase() === 'w') {
    //     forward = true
    //     dir = 'frontend'
    //   }
    //   if (evt.key.toLowerCase() === 'a') {
    //     left = true
    //     hina.setRotationFromEuler(Math.PI / 2)
    //     dir = 'left'
    //   }
    // })
    // document.addEventListener('keyup', (evt) => {
    //   if (evt.key.toLowerCase() === 'w') {
    //     forward = false
    //   }
    //   if (evt.key.toLowerCase() === 'a') {
    //     left = false
    //   }
    // })
    dom.value.appendChild( renderer.domElement );
    controls = new OrbitControls(camera, renderer.domElement)

    // const gltf = await loadGltf('/Hina_Original/Hina_Original.gltf')
    // animations = gltf.animations
    // const obj = gltf.scene
    // hina = obj
    // const size = getGroupSize(hina)
    // pointLight.position.set(size.x, size.y, size.z)

    // if (hina) {
    //   switch(dir) {
    //     case 'left':
    //       console.log(hina.rotation)
    //       hina.setRotationFromAxisAngle(Math.PI / 2)
    //       break
    //     case 'frontend':
    //       // hina.setRotationFromAxisAngle(0)
    //       break
    //   }
    // }

    // await mixMouth(obj)



    // scene.add(obj)
    animate();
  })
  onUnmounted(() => {
    dom.value?.removeChild(renderer.domElement)
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
          // if (object.material.name === 'Hina_Original_Face') {
          //   loadTexture('/Hina_Original/Hina_Original_Face_Mask.png').then(tex => {
          //     tex.repeat.y = -1
          //     object.material.normalMap = tex
          //   })
          // }
          // if (object.material.name === 'Hina_Original_Body') {
          //   loadTexture('/Hina_Original/Hina_Original_Body_Mask.png').then(tex => {
          //     // tex.repeat.y = -1
          //     object.material.normalMap = tex
          //   })
          // }
          if (object.material.name === 'Hina_Original_Hair') {
            console.log('hair', object.material)
            // loadTexture('/Hina_Original/Hina_Original_Hair_Mask.png').then(tex => {
            //   // tex.repeat.y = -1
            //   object.material.normalMap = tex
            // })
          }
          // if (object.material.name === 'Hina_Original_Weapon') {
          //   loadTexture('/Hina_Original/Hina_Original_Weapon_Mask.png').then(tex => {
          //     object.material.normalMap = tex
          //   })
          // }
          // console.log(object)
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

function loadTexture(url) {
  return new Promise(resolve => {
    const loader = new THREE.TextureLoader().load(url, (tex) => {
      resolve(tex)
    })
  })
}
