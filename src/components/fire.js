import * as THREE from 'three'
// import { spritesheetUV } from 'three/examples/jsm/nodes/Nodes'

export default function genFireMaterial(options = { map: null }) {
  const vertex = `
varying vec2 vUv;

#include <common>
#include <uv_pars_vertex>

void main() {
  vUv = uv;

  vec3 newPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
  `
  const fragment = `
varying vec2 vUv;
uniform float frame;
uniform sampler2D map;
uniform vec2 repeat;
uniform vec2 offset;

// #include <uv_pars_fragment>
// #include <map_pars_fragment>

void main() {
  vec2 uv = vUv * repeat + offset;
  vec4 color = texture2D(map, uv);
  float grayValue = (color.r + color.g + color.b) / 3.0;
  float threshold = 0.8;

  if (grayValue < threshold) {
    discard;
  } else {
    color.rgb *= vec3(255.0, 0.0, 0.0);
    gl_FragColor = color;
  }
}
  `

  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: options.map },
      offset: { value: options.offset },
      repeat: { value: options.repeat },
    },
    side: THREE.DoubleSide,
    vertexShader: vertex,
    fragmentShader: fragment,
    defines: {
      USE_MAP: true,
    }
  })

  return material
}