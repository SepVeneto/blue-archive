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
import { Police } from './characters/Police';
import { Camera } from './world/Camera';
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
export function useThree(dom: Ref<HTMLElement>, obs: Ref<HTMLElement>, canvas: Ref<HTMLCanvasElement>) {
  const scene = new THREE.Scene();
  world = new World(scene)
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas.value });
  renderer.shadowMap.enabled = true

  const camera = new Camera(world, renderer)

  const cameraObserve = new THREE.PerspectiveCamera(60, 2, 0.1, 500)
  cameraObserve.position.set(40, 10, 30)
  cameraObserve.lookAt(0, 5, 0)

  const ambientLight = new THREE.AmbientLight(0xFFFFFF)
  world.add(ambientLight)
  const directionLight = new THREE.DirectionalLight(0xFFFFFF, 2)
  directionLight.position.set(0, 0, -1)
  world.add(directionLight)
  world.add(new THREE.DirectionalLightHelper(directionLight, 1))

  const floor = createFloor()
  world.add(floor)
  world.add(new THREE.AxesHelper(140))

  const pointLight = new THREE.PointLight( 0xFFFFFF, 0.01);
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.01)
	world.add( pointLight);
  world.add(pointLightHelper)

  const clickPos = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0, 2),
    new THREE.MeshBasicMaterial({ color: 'crimson' })
  )
  world.add(clickPos)

  const raycaster = new THREE.Raycaster();




  let controls

  resourceManager.$on('finish', () => {
    // hina = new ChHina(world)
    const police = new Police(world)

    camera.setFollow(police)
    // police.add(camera)
    // world.add(hina)
    world.add(camera)
    world.add(police)

    // const geometry = new THREE.CapsuleGeometry(1, 1, 1, 8)
    // scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 })))

    const target = police.object.position.clone()
    // camera.position.set(target.x + 10, target.y + 12, (target.z + 5))
    camera.instance.lookAt(target)

    /**
     * TODO: 人物移动的时候把位置的偏移量直接叠加到camera上
     */
    world.register(() => {
      const target = police.object.position.clone()
      controls.target = target
      // // camera.position.set(target.x + 10, target.y + 12, (target.z + 5))
      // camera.position.setX(police.x + 10)
      // camera.position.setZ(police.z + 5)
      // camera.instance.lookAt(target)
    })

    document.addEventListener('click', (evt) => {
      const { clientX, clientY } = evt
      const center = {
        x: (clientX / window.innerWidth) * 2 - 1,
        y: 1 - (clientY / window.innerHeight) * 2,
      }
      raycaster.setFromCamera(new THREE.Vector2(center.x, center.y), camera.instance)
      const intersects = raycaster.intersectObject(floor)
      if (intersects.length > 0) {
        const pos = intersects[0].point
        clickPos.position.setX(pos.x)
        // clickPos.position.setY(worldVector.z)
        clickPos.position.setZ(pos.z)
        police.moveTo(new THREE.Vector2(pos.x, pos.z))
      }
    })

  })

  const clock = new THREE.Clock()

  let i = 0
  function animate() {
    resizeRendererToDisplaySize(renderer)

    renderer.setScissorTest(true)

    {
      const aspect = setScissorForElement(dom.value)
      camera.instance.aspect = aspect
      camera.instance.updateProjectionMatrix()
      camera.helper.update()
      camera.helper.visible = false

      renderer.render(scene, camera.instance)
    }

    {
      const aspect = setScissorForElement(obs.value)
      cameraObserve.aspect = aspect
      cameraObserve.updateProjectionMatrix()
      camera.helper.visible = true

      renderer.render(scene, cameraObserve)
    }

    const delta = clock.getDelta()
    world.tick(delta)

	  requestAnimationFrame( animate );

	  // renderer.render( scene, camera );
  }

  let controlObserve

  controls = new OrbitControls(camera.instance, dom.value)
  controls.mouseButtons = {
    LEFT: undefined,
    MIDDLE: undefined,
    RIGHT: THREE.MOUSE.ROTATE
  }
  controlObserve = new OrbitControls(cameraObserve, obs.value)
  // document.querySelector('#wrap')?.appendChild(renderer.domElement)
  requestAnimationFrame(animate);
  // onUnmounted(() => {
  //   dom.value?.removeChild(renderer.domElement)
  // })

  function setScissorForElement(elm: HTMLElement) {
    const canvasRect = canvas.value.getBoundingClientRect()
    const elemRect = elm.getBoundingClientRect()

    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left
    const left = Math.max(0, elemRect.left - canvasRect.left)
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top
    const top = Math.max(0, elemRect.top - canvasRect.top)
    const width = Math.min(canvasRect.width, right - left)
    const height = Math.min(canvasRect.height, bottom - top)

    const positiveYUpBottom = canvasRect.height - bottom
    renderer.setScissor(left, positiveYUpBottom, width, height)
    renderer.setViewport(left, positiveYUpBottom, width, height)

    return width / height
  }

  	function resizeRendererToDisplaySize( renderer: any ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}
}
