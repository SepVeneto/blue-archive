import { Ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import createFloor from './components/floor'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Hina as ChHina, Hina } from './characters'
import { ResourceManager } from './resources';
import { World } from './world/Event';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
// import './utils/gui'

let isAnimatePlay = false
let mixer
let animations = []

// const settings = {
//   'show skeleton': false,
//   // 'cafe idle': playCafeIdle,
//   // 'cafe walk': () => hina.play(Hina.CAFE_WALK),
//   // 'cafe reaction': playCafeReaction,
//   // 'ex': playEx,
//   // 'move': playMove,
//   'mouth': 0,
//   'modify callsign weight': 0,
//   'modify moveing weight': 0,
//   'modify endstand weight': 1,
//   'metalness': 1,
// }
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
// gui.add(settings, 'cafe idle')
// gui.add(settings, 'cafe walk')
// gui.add(settings, 'cafe reaction')
// gui.add(settings, 'ex')
// gui.add(settings, 'move')
// gui.add(settings, 'modify callsign weight', 0, 1, 0.01).listen()
// gui.add(settings, 'modify moveing weight', 0, 1, 0.01).listen()
// gui.add(settings, 'modify endstand weight', 0, 1, 0.01).listen()

// gui.add(settings, 'mouth', mouths.reduce((obj, curr, i) => {
//   obj[i] = curr
//   return obj
// }, {})).onChange(val => {
//   uniforms.mouth_offset.value = val
//   // m.needsUpdate = true
// })

let callsign
let moveing
let endstand
let hina: Hina
let world: World

const resourceManager = new ResourceManager()
export function useThree(dom: Ref<HTMLElement>) {
  const scene = new THREE.Scene();
  world = new World(scene)
  const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 200 * 100);
  camera.zoom = 0.5
  // camera.updateProjectionMatrix()

  const ambientLight = new THREE.AmbientLight(0xFFFFFF)
  world.add(ambientLight)
  const directionLight = new THREE.DirectionalLight(0xFFFFFF, 2)
  directionLight.position.set(0, 0, -1)
  world.add(directionLight)
  world.add(new THREE.DirectionalLightHelper(directionLight, 1))

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true
  const floor = createFloor()
  world.add(floor)
  world.add(new THREE.AxesHelper(140))

  const pointLight = new THREE.PointLight( 0xFFFFFF, 0.01);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.01)
	world.add( pointLight);
  world.add(pointLightHelper)



  resourceManager.$on('finish', () => {
    hina = new ChHina(world)
    hina.add(camera)
    world.add(hina)

    // const geometry = new THREE.CapsuleGeometry(1, 1, 1, 8)
    // scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 })))


    const target = hina.object.position.clone()
    camera.position.set(target.x, target.y + 1, (target.z + 2))
    // camera.lookAt(hina)

  })

  const clock = new THREE.Clock()

  let i = 0
  function animate() {
	  requestAnimationFrame( animate );
    const delta = clock.getDelta()
    world.tick(delta)

	  renderer.render( scene, camera );
  }

  let controls

  onMounted(async () => {
    document.addEventListener('keydown', (evt) => {
      switch (evt.key.toLowerCase()) {
        case 'w':
          hina.turn('front')
          hina.moveStart()
          break
        case 'a':
          hina.turn('left')
          hina.moveStart()
          break
        case 's':
          hina.turn('back')
          hina.moveStart()
          break
        case 'd':
          hina.turn('right')
          hina.moveStart()
          break
      }
    })
    document.addEventListener('keyup', (evt) => {
      switch (evt.key.toLowerCase()) {
        case 'w':
        case 'a':
        case 's':
        case 'd':
        hina.moveEnd()
        break
      }
    })
    document.addEventListener('mousedown', (evt) => {
      evt.button === 0 && hina?.attack()
    })
    document.addEventListener('mouseup', (evt) => {
      evt.button === 0 && hina?.stop()
    })
    dom.value.appendChild( renderer.domElement );
    controls = new OrbitControls(camera, renderer.domElement)
    controls.mouseButtons = {
      LEFT: undefined,
      MIDDLE: undefined,
      RIGHT: THREE.MOUSE.ROTATE
    }

    animate();
  })
  onUnmounted(() => {
    dom.value?.removeChild(renderer.domElement)
  })
}
