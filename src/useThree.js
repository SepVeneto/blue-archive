import { onMounted, onUnmounted, shallowRef } from 'vue';
import * as THREE from 'three';
import createFloor from './components/floor'
import { createFace } from './components/face';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let mixer

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
    const obj = gltf.scene
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
      if (obj.animations[0]) {
        mixer = new THREE.AnimationMixer(obj)
        const action = mixer.clipAction(obj.animations[0])
        action.timeScale = 0.05
        // action.play()
      }

      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          // child.visible = false
          // console.log(tex, child)
          // child.map = tex
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
      if (gltf.animations[0]) {
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
      }
      gltf.scene.traverse( function ( object ) {
        if ( object.isMesh ) {
          object.castShadow = true;
        }
      })

      const skeletonHelper = new THREE.SkeletonHelper(gltf.scene)
      skeletonHelper.visible = false
      // console.log(obj)
      gltf.scene.add(skeletonHelper)

      const obj = gltf.scene.getObjectByName('Hina_Original_Body_3')
      const material = obj.material
      material.needsUpdate = true

      const mouthTex = await loadTexture('/Hina_Original/Hina_Mouth.png')
      const eyeTex = await loadTexture('/Hina_Original/Hina_Original_EyeMouth.png')

      const faceMaterial = createFace(eyeTex, mouthTex)
      faceMaterial.uniforms.texture1.value = eyeTex
      faceMaterial.uniforms.texture2.value = mouthTex
      faceMaterial.uniforms.offset.value.set(0.25, 0.75)

      console.log(obj.material)
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