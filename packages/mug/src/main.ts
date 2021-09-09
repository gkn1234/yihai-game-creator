/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-08 15:19:29
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-09 16:18:01
 * @Description: 
 */
import { Game, GameOptions, Sprite, module } from '@yhgame/core'
import { ScreenFix } from '@yhgame/modules'
import { Texture } from 'pixi.js'

@module('ScreenFix', ScreenFix, 'vertical', 'horizontal', 'center', 'center')
class MyGame extends Game {
  constructor () {
    super({
      width: 800,
      height: 600
    })

    const b = new Sprite(Texture.WHITE)
    b.width = 800
    b.height = 600
    this.Stage.addChild(b)
    const s = new Sprite(Texture.WHITE)
    s.tint = 0xff0000
    s.width = 100
    s.height = 200
    s.position.set(100, 50)
    this.Stage.addChild(s)
    console.log(this.Stage, s, this.Renderer)
    s.interactive = true
    s.on('pointertap', () => {
      console.log('click!')
    })
    // this.Stage.scale.set(0.5, 1)
    // this.Stage.rotation = Math.PI / 6
    
  }


}

new MyGame()