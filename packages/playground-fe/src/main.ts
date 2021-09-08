/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 16:06:59
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 19:30:00
 * @Description: 
 */

import { Game, Sprite } from '@yhgame/core'
import { Texture, utils } from 'pixi.js'

const a = new Game({
  resizeTo: window
})
a.mount()
console.log(a.App)
const t = new Sprite(Texture.WHITE)
t.width = 100
t.height = 200
a.Stage.addChild(t)

const c = new utils.EventEmitter()
console.log(c)
c.on('a', () => {
  console.log('ccccccc')
})
c.on('a', () => {
  console.log('ccccccc2')
})
c.on('b', () => {
  console.log('bbbbbbb')
})
c.emit('a')
c.emit('b')
c.removeAllListeners('a')
c.emit('a')
c.emit('b')

const d = new Sprite()
console.log(d)


/*
import { game, Game } from '@yhgame/core'
@game
class Test {
  Game!: Game
}

const a = new Test()
console.log(a)

class A {
  a!: number
}
console.log(new A())
*/
