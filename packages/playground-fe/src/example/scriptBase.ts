/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-21 12:12:22
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-21 21:56:41
 * @Description: 
 */
import { Game, Script, Container, lifecycle } from '@yhgame/core'

class MyGame extends Game {
  constructor () {
    super({
      width: 800,
      height: 600
    })

    const c = new Container()
    c.$mountScript(MyScript)
    this.Stage.addChild(c)
    this.Stage.removeChild(c)
  }
}

@lifecycle('onHaha')
class MyScript extends Script {
  constructor () {
    super()
  }

  onHaha () {
    console.log('haha!')
  }

  onEnabled () {
    console.log('enabled!')
    this.trigger('onHaha')
  }

  onDisabled () {
    console.log('disabled!', this)
    this.trigger('onHaha')
  }

  onActive () {
    console.log('active!')
  }

  onDestroy () {
    console.log('destroy!')
  }
}

new MyGame()