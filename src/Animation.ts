import * as THREE from 'three'

type AnimationIndex = string | number

export class Animation {
  public mixer: THREE.AnimationMixer
  public clips: THREE.AnimationClip[] = []
  public collect: Record<string, THREE.AnimationClip> = {}
  public current: {
    action?: THREE.AnimationAction
    cancel?: (reason?: any) => void
  } = {}
  constructor(object: THREE.Object3D, clips: THREE.AnimationClip[]) {
    this.mixer = new THREE.AnimationMixer(object)
    this.clips = clips
    clips.forEach((clip) => {
      this.collect[clip.name] = clip
    })
  }
  getAction(index: AnimationIndex) {
    const clip = this.getClip(index)
    return this.mixer.clipAction(clip)
  }
  getClip(index: AnimationIndex) {
    return typeof index === 'number' ? this.clips[index] : this.collect[index]
  }
  getCurrentWeight() {
    return this.current.action?.getEffectiveWeight() || 0
  }
  play(index: AnimationIndex, duration = 1) {
    return new Promise((resolve, reject) => {
      const clip = this.getClip(index)
      // 防止不同操作触发时处于同一个动画，导致过渡时出现TPose的情况
      if (this.current.action && clip.name === this.current.action.getClip().name) {
        resolve(false)
        return
      } else {
        this.current.cancel?.('interrupt action')
      }

      const action = this.getAction(index)
      action.play()

      const endFn = () => {
        this.mixer.removeEventListener('loop', endFn)
        resolve(true)
      }
      this.mixer.addEventListener('loop', endFn)

      if (this.current.action) {
        this.setWeight(action, 0)
        this.executeCrossFade(action, duration)
      }
      this.current = {
        action,
        cancel: reject
      }
    }).catch(err => {
      if (err === 'interrupt action') return
      console.error(err)
    })
  }
  stop() {
    this.current.cancel?.()
    this.current.action?.stop()
  }
  executeCrossFade(action: any, duration: number) {
    this.setWeight(action, 1)

    action.time = 0
    this.current.action?.crossFadeTo?.(action, duration, true)
  }
  setWeight(action: THREE.AnimationAction, weight: number) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }
}