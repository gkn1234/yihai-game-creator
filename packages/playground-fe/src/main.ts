/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 16:06:59
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 11:32:37
 * @Description: 
 */

import { Game, Sprite, Container } from '@yhgame/core'
import { Texture, utils } from 'pixi.js'

const a = new Game({
})
a.mount()
console.log(a.App)
const c = new Container()
c.scale.set(2, 2)
a.Stage.addChild(c)
const t = new Sprite(Texture.WHITE)
t.width = 100
t.height = 200
t.position.set(100, 100)
console.log(t)
c.addChild(t)


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
