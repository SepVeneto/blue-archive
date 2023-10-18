import GUI from 'lil-gui'

export const settings = {

}

const gui = new GUI()

export const bullet = {
  radius: 0.02,
  length: 0.2,
}
const guiBullet = gui.addFolder('bullet')
guiBullet.add(bullet, 'radius')
guiBullet.add(bullet, 'length')
