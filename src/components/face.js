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
const fragmentParmas = `
uniform vec2 mouth_offset;
uniform sampler2D mouth_texture;
`

const fragmentStart = `
vec4 c = diffuseColor * texture2D(mouth_texture, vMapUv + mouth_offset);
vec4 mouthColor = c;
`

const fragmentEnd = `
float alpha = diffuseColor.a;
if (alpha == 0.0) {
  diffuseColor = mouthColor;
} else {
  diffuseColor.a = 1.0;
}
`

const fragmentShader = `
`

export function createFace(material, uniforms = {} ) {
  THREE.ShaderChunk['face_mix_pars_fragment'] = fragmentParmas
  THREE.ShaderChunk['face_mix_fragment_start'] = fragmentStart
  THREE.ShaderChunk['face_mix_fragment_end'] = fragmentEnd

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    const shaderList = shader.fragmentShader.split('\n')
    shaderList.splice(0, 0, '#include <face_mix_pars_fragment>')
    const index = shaderList.findIndex(item => item.includes('#include <map_fragment>'))
    shaderList.splice(index, 0, '#include <face_mix_fragment_start>')
    const i = shaderList.findIndex(item => item.includes('#include <alphamap_fragment>'))
    shaderList.splice(i + 1, 0, '#include <face_mix_fragment_end>')
    // shaderList.splice(-1, 0, `
    //   if (gl_FragColor.a > 0.0) {
    //     gl_FragColor.a = 1.0;
    //   }
    // `)

    shader.fragmentShader = shaderList.join('\n')
    console.log(shader.fragmentShader, shader)
  }
}

