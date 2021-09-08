/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:18:51
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 19:04:59
 * @Description: 游戏实例
 */
import { 
  Application, 
  IApplicationOptions,
  AbstractRenderer,
  Renderer,
  Container,
  Ticker,
  Loader
} from 'pixi.js'

import { GameModule } from './GameModule'

/** 游戏配置项 */
export interface GameOptions extends IApplicationOptions {
}

/** 游戏模块暂存数据 */
export type GameModulesData = Map<string, {
  args: any[]
  Module: typeof GameModule
}>
/** 游戏模块存储对象 */
export type GameModules = Map<string, GameModule>

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

export class Game {
  /** 单例引用 */
  static __GameInstance__: Game | null = null
  /** 暂存游戏模块参数 */
  static _modules: GameModulesData = new Map()

  /** PixiJS App实例 */
  private _app?: Application
  /** 各种游戏模块 */
  private _modules: GameModules = new Map()
  /** 配置项 */
  readonly options: GameOptions = {}

  constructor (options?: GameOptions) {
    if (Game.__GameInstance__) {
      return Game.__GameInstance__
    }

    // 单例引用，注意顺序不能放到最后，否则模块无法正确获取Game实例
    Game.__GameInstance__ = this

    this.options = options || {}

    this._app = new Application(options)

    // 初始化模块
    this._initModules()

    // 开始游戏
    this.start()
  }

  /**
   * 注册游戏的控制模块
   * @param name 模块名称
   * @param model 游戏控制模块的构造函数
   * @param args 
   */
  static registerModule (
    name: string,
    Module: typeof GameModule,
    ...args: any[]
  ) {
    Game._modules.set(name, {
      Module, args
    })
  }

  get App (): Application {
    return this._app as Application
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
    Game._modules.forEach((value, name: string) => {
      const { Module, args } = value
      this._modules.set(name, new Module(...args))
    })
  }

  /**
   * 挂载到视图容器
   * @param container 挂载容器，H5环境下为body
   */
  mount (container?: HTMLElement) {
    container = container || document.body
    container.innerHTML = ''
    container.appendChild(this.App.view)
  }

  /** 获取模块 */
  module (name: string): GameModule | undefined {
    return this._modules.get(name)
  }

  /** 遍历所有模块 */
  traveModules (callback: (module: GameModule) => void) {
    this._modules.forEach((module: GameModule) => callback(module))
  }

  /** 开始游戏，虚函数 */
  start () {}
}