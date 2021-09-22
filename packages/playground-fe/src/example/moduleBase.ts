/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-22 10:41:58
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:26:26
 * @Description: 
 */
import { Game, GameModule, module } from '@yhgame/core'

class MyModule extends GameModule {
  constructor () {
    super()
  }
}

class MyExModule extends MyModule {
  constructor () {
    super()
  }
}

class MyExModule2 extends MyExModule {
  constructor () {
    super()
  }
}

@module(MyExModule)
@module(MyExModule2)
class MyGame extends Game {
  constructor () {
    super({
      width: 800,
      height: 600
    })

    const m = this.module('MyExModule')
    console.log(m, MyExModule.getBaseModule())
  }
}

new MyGame()