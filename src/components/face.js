import * as THREE from 'three'

const vertexShader = `
#include <skinning_pars_vertex>

varying vec2 vUv;

void main() {
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <skinning_vertex>
	#include <project_vertex>

  vUv = uv;
}
`
const fragmentShader = `
varying vec2 vUv;
uniform vec2 offset;
uniform sampler2D texture1;
uniform sampler2D texture2;

void main()
{
  vec4 color1 = texture2D(texture1, vUv);
  vec4 color2 = texture2D(texture2, vUv + offset);

  float alpha = color1.a;

  if (alpha < 0.8) {
    gl_FragColor = color2;
  } else {
    gl_FragColor = color1;
  }
}
`

export function createFace() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      texture1: { value: null},
      texture2: { value: null },
      offset: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader,
    fragmentShader,
  })
}
