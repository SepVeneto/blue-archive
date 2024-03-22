import * as THREE from 'three'
// import { spritesheetUV } from 'three/examples/jsm/nodes/Nodes'

export type FireOptions = {
  map?: any
  offset?: THREE.Vector2
  repeat?: THREE.Vector2
}

export default function genFireMaterial(options: FireOptions = { map: null }) {
  const vertex = `
#define MAP_UV uv
uniform float rotation;
uniform vec2 center;

#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>

	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

	#ifndef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) scale *= - mvPosition.z;

	#endif

	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;

	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

	mvPosition.xy += rotatedPosition;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
  `
  const fragment = `
varying vec2 vMapUv;
uniform float frame;
uniform sampler2D map;
uniform vec2 repeat;
uniform vec2 offset;

// #include <uv_pars_fragment>
// #include <map_pars_fragment>

void main() {
  vec2 uv = vMapUv * repeat + offset;
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