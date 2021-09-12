/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:18:51
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-12 17:04:40
 * @Description: 游戏实例
 */
import { 
  Application,
  AbstractRenderer,
  Renderer,
  Ticker,
  Loader
} from 'pixi.js'

import { Container } from './node/pixiNodeExtend'
import { GameModule } from './GameModule'

/** 游戏配置项 */
export interface GameOptions {
  /** 游戏的设计宽度(舞台宽度、场景宽度) */
  width?: number
  /** 游戏的设计高度(舞台高度、场景高度) */
  height?: number
}

/** 给指定类注入游戏实例的装饰器 */
export function game (Constructor: Function) {
  Reflect.defineProperty(Constructor.prototype, 'Game', {
    get (): Game {
      if (!Game.__GameInstance__) {
        throw new Error('You have to create Game instance first!')
      }
      return Game.__GameInstance__
    }
  })
}

/** 解析游戏配置选项 */
function _resolveGameOptions (options?: GameOptions): Required<GameOptions> {
  const o: GameOptions = options || {}
  return {
    width: o.width || 800,
    height: o.height || 600
  }
}

export class Game {
  /** 单例引用 */
  static __GameInstance__: Game | null = null
  /** 暂存游戏模块参数 */
  static _modules: Map<typeof GameModule, any[]> = new Map()

  /** PixiJS App实例 */
  private _app!: Application
  /** 各种游戏模块 */
  private _modules: Map<string, GameModule> = new Map()
  /** 配置项 */
  readonly options!: Required<GameOptions>

  constructor (options?: GameOptions) {
    if (Game.__GameInstance__) {
      return Game.__GameInstance__
    }

    // 单例引用，注意顺序不能放到最后，否则模块无法正确获取Game实例
    Game.__GameInstance__ = this

    this.options = _resolveGameOptions(options)

    this._app = new Application({
      resizeTo: self
    })

    // 初始化模块
    this._initModules()

    // 挂载画布
    this.mount()

    // 开始游戏
    this.start()
  }

  /**
   * 注册游戏的控制模块
   * @param Module 游戏控制模块的构造函数，构造函数名即为模块名，不允许重复
   * @param args 
   */
  static registerModule<T extends typeof GameModule> (
    Module: T,
    ...args: any[]
  ) {
    if (Game._modules.get(Module)) {
      throw new Error(`Duplicated module found: ${Module.name}.`)
    }

    Game._modules.set(Module, args)
  }

  get App (): Application {
    return this._app
  }

  get Renderer (): Renderer | AbstractRenderer {
    return this.App.renderer
  }

  get Stage (): Container {
    return this.App.stage
  }

  get Ticker (): Ticker {
    return this.App.ticker
  }

  get Loader (): Loader {
    return this.App.loader
  }

  /** 初始化各种游戏控制模块 */
  private _initModules () {
    Game._modules.forEach((args: any[], Module: typeof GameModule) => {
      const name = Module.name
      const module = new Module(...args)
      this._modules.set(name, module)
    })
  }

  /**
   * 挂载到视图容器
   * @param container 挂载容器，H5环境下为body
   */
  mount (container?: HTMLElement) {
    this.traveModules(module => module.onBeforeMount())

    container = container || document.body
    container.innerHTML = ''
    container.appendChild(this.App.view)

    this.traveModules(module => module.onMounted())
  }

  /** 获取模块，可以用名称或者构造函数获取 */
  module <T extends typeof GameModule>(key: string | T): InstanceType<T> | GameModule | undefined {
    if (typeof key === 'string') {
      return this._modules.get(key)
    }
    return this._modules.get(key.name)
  }

  /** 遍历所有模块 */
  traveModules (callback: (module: GameModule) => void) {
    this._modules.forEach((module: GameModule) => callback(module))
  }

  /** 开始游戏 */
  start () {
    this.traveModules(module => module.onGameStart())
  }
}