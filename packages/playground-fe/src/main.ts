/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 16:06:59
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-15 17:15:35
 * @Description: 
 */

import { Game, Sprite, Container } from '@yhgame/core'
import { Texture, utils } from 'pixi.js'

const a = new Game({
})
a.mount()
console.log(a.App)
const c = new Container()
a.Stage.addChild(c)
const t = new Sprite(Texture.WHITE)
t.width = 100
t.height = 200
//t.anchor.set(0.5, 0.5)
t.position.set(100, 100)
console.log(t)
c.addChild(t)

c.width = 300
console.log(c)

const tt = new Sprite(Texture.WHITE)
tt.width = 100
tt.height = 200
//tt.anchor.set(0.5, 0.5)
tt.position.set(200, 100)
c.addChild(tt)
c.pivot.set(0, 0)
c.position.set(100, 100)
console.log(c.getLocalBounds(), c.getBounds())
console.log(c.toLocal({x: 0, y: 0}))
// c.removeChild(t)


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
