import GUI from 'lil-gui'

export const settings = {

}

export const gui = new GUI()

export const bullet = {
  radius: 0.02,
  length: 0.2,
}
export const cameraSettings = {
  x: 0,
  y: 0,
  z: 0,
  zoom: 0.5,
}
const guiBullet = gui.addFolder('bullet')
guiBullet.add(bullet, 'radius')
guiBullet.add(bullet, 'length')
