/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-08 15:19:29
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 15:28:02
 * @Description: 
 */
import { Game, GameOptions, Container, Sprite, module, RelativeContainer } from '@yhgame/core'
import { ScreenFix } from '@yhgame/modules'
import { Texture } from 'pixi.js'

@module(ScreenFix, 'vertical', 'horizontal', 'center', 'center')
class MyGame extends Game {
  constructor () {
    super({
      width: 1280,
      height: 720
    })

    const b = new Sprite(Texture.WHITE)
    b.width = 1280
    b.height = 720
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

    const rp = new Container()
    this.Stage.addChild(rp)
    rp.position.set(200, 200)
    const r = new RelativeContainer()
    rp.addChild(r)
    const rs = new Sprite(Texture.WHITE)
    rs.width = 100
    rs.height = 100
    rs.tint = 0x00ff00
    r.addChild(rs)
    r.setRelative({
      top: '10%',
      left: '10%'
    })
    


    // this.Stage.scale.set(0.5, 1)
    // this.Stage.rotation = Math.PI / 6
  }


}

new MyGame()