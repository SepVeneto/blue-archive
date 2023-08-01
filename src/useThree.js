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
  // renderer.outputColorSpace = THREE.LinearSRGBColorSpace

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
    uniforms.mouth_offset.value = mouths[Math.floor(i / 6 % 16)]
    ++i
    if (i === 160) i = 0

	  renderer.render( scene, camera );
  }

  onMounted(async () => {
    dom.value.appendChild( renderer.domElement );
    const controls = new OrbitControls(camera, renderer.domElement)

    const gltf = await loadGltf('/Hina_Original/Hina_Original.gltf')
    // const gltf = await loadGltf('/notitle.glb')
    animations = gltf.animations
    const obj = gltf.scene
    // const origin = obj.clone()
    // origin.traverse(child => {
    //   if (child.)
    // })
    // console.log(obj, origin)
    await mixMouth(obj)
    // const obj = await loadObj('/fbx/Hina_Original/Hina_Original.fbx')

    scene.add(new THREE.AxesHelper(1))


    // scene.add(origin)
    // const m = obj.getObjectByName('Hina_Original_Body_3')
    // m.material.transparent = true
    // m.material.needsUpdate = true
    // console.log(m)
    // scene.add(m)
    // setTimeout(() => {
    //   m.material.transparent = true
    //   m.material.needsUpdate = true
    // })
    scene.add(obj)
    // scene.add(gltf.temp)
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
          // child.castShadow = true
          // child.receiveShadow = true
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
        if (object?.material?.transparent || object.transparent) {
          console.log(object, 'transparent')
        }
        if ( object.isMesh ) {
          // if (object.name !== 'Hina_Original_Body_4') object.visible = false
          object.castShadow = true;
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
      // console.log(material)

      // material.onBeforeCompile = (shader) => {
      //   const origin = shader.fragmentShader
      //   console.log(origin)
      //   const list = origin.split('\n')
      //   const code = `
      //   float alpha = gl_FragColor.a;
      //   if (alpha > 0.0 ) {
      //     gl_FragColor = vec4(gl_FragColor.rgb, 1.0);
      //   } else {
      //     gl_FragColor = vec4(gl_FragColor.rgb, 0.0);
      //   }
      //   `
      //   list.splice(-1, 0, code)
      //   shader.fragmentShader = list.join('\n')
      // }

      // material.needsUpdate = true
      // material.alphaTest = 0

      const mouthTex = await loadTexture('/Hina_Original/Hina_Mouth.png')
      // mouthTex.encoding = THREE.sRGBEncoding
      const eyeTex = await loadTexture('/Hina_Original/Hina_Original_EyeMouth.png')
      eyeTex.colorSpace = THREE.SRGBColorSpace
      mouthTex.colorSpace = THREE.SRGBColorSpace
      // eyeTex.colorSpace = THREE.LinearSRGBColorSpace
      // mouthTex.colorSpace = THREE.LinearSRGBColorSpace
      // const eyeAlphaTex = await loadTexture('/Hina_Original/Hina_Original_EyeMouth_Alpha.png')
      // // eyeTex.encoding = THREE.sRGBEncoding
      // const eye = await loadImg('/Hina_Original/Hina_Original_EyeMouth.png')
      // // const eye = await loadImg('/Hina_Original/Hina_Original_Weapon.png')
      // const mouth = await loadImg('/Hina_Original/Hina_Mouth.png')

      obj.material.map = eyeTex
      // obj.material.alphaMap = eyeTex
      // obj.material.depthWrite = false
      obj.material.transparent = true
      obj.material.needsUpdate = true
      createFace(obj.material, uniforms)
      m = obj.material
      uniforms.mouth_texture.value = mouthTex

      // const box = new THREE.Mesh(
      //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
      //   new THREE.MeshStandardMaterial({
      //     transparent: true,
      //     map: eyeTex,
      //     // alphaMap: eyeTex,
      //   })
      // )
      // gltf.scene.visible = false
      // gltf.temp = box
      // gltf.temp.visible  = false

      // const tex = new THREE.CanvasTexture(mixTex(eye, mouth))
      // const texAlpha = new THREE.CanvasTexture(mixAlpha())
      // tex.encoding = THREE.sRGBEncoding
      // material.map = eyeTex
      // material.alphaMap = eyeTex
      // material.alphaMap = mouthTex
      // tex.colorSpace = THREE.SRGBColorSpace
      // material.blending = THREE.CustomBlending
      // material.blendDst = THREE.DstAlphaFactor
      // texAlpha.magFilter = THREE.LinearFilter
      // material.map = tex
      // material.alphaMap = texAlpha
      // material.alphaMap = eyeAlphaTex
      // material.alphaMap = alphaTex
      // material.blending = THREE.NoBlending

      // const faceMaterial = createFace(eyeTex, mouthTex)
      // faceMaterial.map = eyeTex
      // // const faceMaterial = material.clone()
      // // faceMaterial.map = eyeTex
      // // faceMaterial.needsUpdate = true
      // faceMaterial.uniforms.texture1.value = eyeTex
      // faceMaterial.uniforms.texture2.value = mouthTex
      // faceMaterial.uniforms.offset.value.set(0.25, 0.75)

      // console.log(obj.material, faceMaterial)
      // obj.material = faceMaterial
}
function mixTex(eye, mouth) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.style.position = 'absolute'
  canvas.style.top = 0
  canvas.style.left = 0

  const { naturalWidth, naturalHeight } = mouth
  canvas.width = naturalWidth
  canvas.height = naturalHeight
  // ctx.fillStyle = 'white'
  // ctx.fillRect(0, 0, canvas.width, canvas.height)
  // ctx.save()
  ctx.drawImage(mouth, 0, 0)
  ctx.scale(4, 4)
  ctx.drawImage(eye, 0, 0)
  // ctx.rotate(Math.PI/ 2)
  document.body.appendChild(canvas)
  return canvas
}
function mixAlpha() {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.top = '512px'
  canvas.style.left = 0

  const ctx = canvas.getContext('2d')
  canvas.width = canvas.height = 512
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  document.body.appendChild(canvas)
  return canvas
}

function loadImg(url) {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.src = url
    img.onload = () => resolve(img)
  })
}

function loadTexture(url) {
  return new Promise(resolve => {
    const loader = new THREE.TextureLoader().load(url, (tex) => {
      resolve(tex)
    })
  })
}