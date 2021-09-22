/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:18:51
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:27:32
 * @Description: 游戏实例
 */
import { 
  Application,
  AbstractRenderer,
  Renderer,
  Ticker,
  Loader
} from 'pixi.js'

import { Script } from './script/Script'
import { ScriptManager } from './script/ScriptManager'
import { Scriptable, enableScript, lifecycle } from './script/enableScript'
import { Container } from './node/pixiNodeExtend'
import { Stage } from './node/Stage'
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

export enum GameLifecycle {
  onModuleBeforeMount = 'onModuleBeforeMount',
  onModuleMounted = 'onModuleMounted',
  onGameStart = 'onGameStart',
  onScriptInit = 'onScriptInit'
}

@enableScript
@lifecycle(
  GameLifecycle.onModuleBeforeMount, // 模块挂载前
  GameLifecycle.onModuleMounted, // 模块挂载后
  GameLifecycle.onGameStart, // 游戏开始
  GameLifecycle.onScriptInit, // 游戏中有脚本完成了初始化
)
export class Game implements Scriptable {
  /** 单例引用 */
  static __GameInstance__: Game | null = null
  /** 暂存游戏模块参数与原型 */
  static _modules: Map<
    typeof GameModule, 
    { args: any[], Base: typeof GameModule | null }
  > = new Map()
  /** 缓存模块原型，避免重复注册同功能模块 */
  static _baseModules: Set<typeof GameModule> = new Set()

  /** PixiJS App实例 */
  private _app!: Application

  /** 各种游戏模块的索引 */
  private _modules: Map<string, GameModule> = new Map()
  /** 游戏模块基础原型的索引 */
  private _baseToModules: Map<string, GameModule> = new Map()

  /** 配置项 */
  readonly options!: Required<GameOptions>

  /** Game具有脚本管理能力 */
  /** 指向脚本管理对象 */
  $scripts!: ScriptManager | null
  /** 本类的所有脚本生命周期 */
  $lifecycles?: Set<string>
  /** 挂载一个脚本 */
  $mountScript!: (script: typeof Script | Script, ...args: any[]) => Script
  /** 触发一个生命周期 */
  $trigger!: (name: string, ...args: any[]) => void
  /** 设置脚本的可用性 */
  $enableScript!: (enabled: boolean) => void
  /** 销毁脚本(所有)，一般用于对象注销 */
  $destroyScript!: () => void

  constructor (options?: GameOptions) {
    if (Game.__GameInstance__) {
      return Game.__GameInstance__
    }

    // 单例引用，注意顺序不能放到最后，否则模块无法正确获取Game实例
    Game.__GameInstance__ = this

    this.options = _resolveGameOptions(options)

    // 初始化PIXI
    this._app = new Application({
      resizeTo: self
    })
    this._app.stage = new Stage()

    // 初始化游戏模块
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
    // 模块可能拓展继承了基础模块原型，因此也要检查并保存基础原型，避免不合法与重复
    const Base = Module.getBaseModule()
    if (!Base) {
      throw new Error(`Invalid module found: ${Module.name}! A module should extend GameModule class.`)
    }
    if (Base === GameModule) {
      throw new Error(`Invalid module found: ${Module.name}! Abstract module should be extended.`)
    }
    if (Game._baseModules.has(Base)) {
      throw new Error(`Duplicated module found: ${Module.name}. Base module ${Base.name} has been registered.`)
    }

    Game._modules.set(Module, { args, Base })
    Game._baseModules.add(Base)
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
    // 允许各模块使用脚本
    this.$enableScript(true)

    // 挂载各模块实例
    Game._modules.forEach((obj, Module) => {
      const { args, Base } = obj
      const name = Module.name
      const module = new Module(...args)
      this.$mountScript(module)
      this._modules.set(name, module)

      // 也要记录 模块原型 -> 模块实例 的索引
      const baseName = Base ? Base.name : null
      if (baseName) {
        this._baseToModules.set(baseName, module)
      }
    })
  }

  /**
   * 挂载到视图容器
   * @param container 挂载容器，H5环境下为body
   */
  mount (container?: HTMLElement) {
    this.$trigger(GameLifecycle.onModuleBeforeMount)

    container = container || document.body
    container.innerHTML = ''
    container.appendChild(this.App.view)

    this.$trigger(GameLifecycle.onModuleMounted)
  }

  /**
   * 获取模块，可以用名称或者构造函数获取
   * 如果一个模块以继承的方式拓展了原型模块，也可以通过原型模块
   * @param key 
   * @returns 
   */
  module<T extends typeof GameModule> (key: string | T): InstanceType<T> | GameModule | undefined {
    const moduleIndex = typeof key === 'string' ? key : key.name
    return this._modules.get(moduleIndex) || this._baseToModules.get(moduleIndex)
  }

  /** 遍历所有模块 */
  traveModules (callback: (module: GameModule) => void) {
    this._modules.forEach((module: GameModule) => callback(module))
  }

  /** 判断某一个节点是否在舞台上 */
  isOnStage (node: Container) {
    // 父节点溯源，根节点是舞台代表节点在舞台上
    let cur = node
    while (cur.parent) {
      cur = cur.parent
    }
    return cur === this.Stage
  }

  /** 开始游戏 */
  start () {
    this.$trigger(GameLifecycle.onGameStart)
  }
}