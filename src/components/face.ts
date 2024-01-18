import * as THREE from 'three'

const fragmentParmas = `
uniform vec2 mouth_offset;
uniform sampler2D mouth_texture;
`

const fragmentStart = `
vec4 mouthColor = diffuseColor * texture2D(mouth_texture, vMapUv + mouth_offset);
`

const fragmentEnd = `
float alpha = diffuseColor.a;
if (alpha == 0.0) {
  diffuseColor = mouthColor;
}
`

export function createFace(material: THREE.Material, uniforms = {} ) {
  Object.assign(THREE.ShaderChunk, {
    face_mix_pars_fragment: fragmentParmas,
    face_mix_fragment_start: fragmentStart,
    face_mix_fragment_end: fragmentEnd,
  })

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    const shaderList = shader.fragmentShader.split('\n')
    shaderList.splice(0, 0, '#include <face_mix_pars_fragment>')
    const index = shaderList.findIndex(item => item.includes('#include <map_fragment>'))
    shaderList.splice(index, 0, '#include <face_mix_fragment_start>')
    // 不跟mouth的采样写在一起是因为那个时候纹理还没有进行采样，无法得到alpha值
    const i = shaderList.findIndex(item => item.includes('#include <alphamap_fragment>'))
    shaderList.splice(i + 1, 0, '#include <face_mix_fragment_end>')
    shader.fragmentShader = shaderList.join('\n')
  }
}
