import * as THREE from 'three'

export default function floor() {
  const vertex = `
varying vec2 vUv;

void main()
{
    vUv = uv;

    vec3 newPosition = position;
    newPosition.z = 1.0;
    gl_Position = vec4(newPosition, 1.0);
}
  `
  const fragment = `
uniform sampler2D tBackground;

varying vec2 vUv;

void main()
{
    vec4 backgroundColor = texture2D(tBackground, vUv);

    gl_FragColor = backgroundColor;
}

  `

  const geometry = new THREE.PlaneGeometry(2, 2)

  const material = new THREE.ShaderMaterial({
    // wireframe: true,
    uniforms: {
      tBackground: { value: null },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  })

  const topLeft: THREE.RGB = { r: 0, g: 0, b: 0 }
  new THREE.Color('#f5883c').getRGB(topLeft, THREE.SRGBColorSpace)
  const topRight: THREE.RGB = { r: 0, g: 0, b: 0 }
  new THREE.Color('#ff9043').getRGB(topRight, THREE.SRGBColorSpace)
  const bottomRight: THREE.RGB = { r: 0, g: 0, b: 0 }
  new THREE.Color('#fccf92').getRGB(bottomRight, THREE.SRGBColorSpace)
  const bottomLeft: THREE.RGB = { r: 0, g: 0, b: 0 }
  new THREE.Color('rgb(245,170,88)').getRGB(bottomLeft, THREE.SRGBColorSpace)
  console.log(bottomLeft)
  const data = new Uint8Array([
    Math.round(bottomLeft.r * 255), Math.round(bottomLeft.g * 255), Math.round(bottomLeft.b * 255), 255,
    Math.round(bottomRight.r * 255), Math.round(bottomRight.g * 255), Math.round(bottomRight.b * 255), 255,
    Math.round(topLeft.r * 255), Math.round(topLeft.g * 255), Math.round(topLeft.b * 255), 255,
    Math.round(topRight.r * 255), Math.round(topRight.g * 255), Math.round(topRight.b * 255), 255,
  ])
  // 2 * 2的像素矩阵，每个像素对应上面每四个元素组合成的rgba
  const backgroundTexture = new THREE.DataTexture(data, 2, 2)
  backgroundTexture.magFilter = THREE.LinearFilter
  backgroundTexture.needsUpdate = true

  // material.needsUpdate = true
  material.uniforms.tBackground.value = backgroundTexture


  const mesh = new THREE.Mesh(geometry, material)
  // mesh.frustumCulled = false
  // mesh.matrixAutoUpdate = false
  // mesh.updateMatrix()

  const gridHelper = new THREE.GridHelper(10 * 10, 100)

  const group = new THREE.Group()
  group.add(gridHelper)

  group.add(mesh)
  return group
}