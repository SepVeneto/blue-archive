import * as THREE from 'three'

export default function genFireMaterial(options = { map: null }) {
  const vertex = `
varying vec2 vUv;

#include <common>
#include <uv_pars_vertex>

void main() {
  vUv = uv;

  vec3 newPosition = position;
  gl_Position = vec4(newPosition, 1.0);
}
  `
  const fragment = `
varying vec2 vUv;
uniform vec2 fire_offset;

#include <uv_pars_fragment>
#include <map_pars_fragment>

void main() {
  vec4 color = texture2D(map, vUv);
  if (color.rgb != vec3(0.0, 0.0, 0.0)) {
    gl_FragColor.a = 0.0;
  } else {
    gl_FragColor = color;
  }
}
  `

  const material = new THREE.ShaderMaterial({
    uniforms: {
      fire_offset: { value: new THREE.Vector2(0, 0) },
      map: { value: options.map },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    defines: {
      USE_MAP: true,
    }
  })

  return material
}