/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-22 11:34:40
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 15:33:43
 * @Description: 
 */
import { Game, module, Sprite, Container } from '@yhgame/core'
import { ScreenFix } from '@yhgame/modules'
import { Widget } from '@yhgame/scripts'
import { Texture } from 'pixi.js'

const w = 800
const h = 600

@module(ScreenFix, 'vertical', 'horizontal', 'center', 'center')
class MyGame extends Game {
  constructor () {
    super({
      width: w,
      height: h
    })

    const b = new Sprite(Texture.WHITE)
    b.width = w
    b.height = h
    this.Stage.addChild(b)
    
    const s = new Sprite(Texture.WHITE)
    s.tint = 0xff0000
    s.width = 100
    s.height = 200
    s.position.set(100, 50)
    s.interactive = true
    s.on('pointertap', () => {
      console.log('click!')
    })
    this.Stage.addChild(s)

    const rc = new Container()
    const rs = new Sprite(Texture.WHITE)
    rs.tint = 0x00ff00
    rs.width = 200
    rs.height = 100
    rc.addChild(rs)
    rc.$mountScript(Widget, { top: '10%', left: 0, right: 0 })
    console.log(rc)
    this.Stage.addChild(rc)
  }
}

new MyGame()