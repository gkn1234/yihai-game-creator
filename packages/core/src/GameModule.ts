/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 19:27:16
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:08:51
 * @Description: 游戏功能模块
 */
import { Game, game } from './Game'
import { Script } from './script/Script'
import { ScriptManager } from './script/ScriptManager'
import { enableScript, Scriptable } from './script/enableScript'

/**
 * 给游戏实例注册模块，可用做装饰器
 * @param name 
 * @param Constructor 
 * @param args 初始化参数
 */
export function module<T extends typeof GameModule> (Module: T, ...args: any[]) {
  return function (Constructor: typeof Game) {
    Constructor.registerModule(Module, ...args)
  }
}

@game
@enableScript
export class GameModule extends Script implements Scriptable {
  /** 对游戏实例的引用 */
  Game!: Game
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
  
  constructor (...args: any[]) {
    super()

    this.enabled = true
  }

  /** 获取原型模块。原型模块即继承 GameModule 的第一级构造函数对象 */
  static getBaseModule (): typeof GameModule | null {
    if (this === GameModule) { return GameModule }

    let cur = this
    let next = Object.getPrototypeOf(this)
    while (next !== GameModule && next) {
      cur = next
      next = Object.getPrototypeOf(next)
    }
    return next ? cur : null
  }

  get name (): string {
    return this.constructor.name
  }

  /** 模块挂载前触发 */
  onBeforeMount () {}

  /** 模块挂载后触发 */
  onMounted () {}

  /** 游戏开始 */
  onGameStart () {}

  /** 脚本初始化时，该脚本是否要继承本基础模块的能力，定义模块的默认行为 */
  onScriptInit (script: Script) {
    if (this.shouldMountScript(script)) {
      this.$mountScript(script)
    }
  }

  /** 判断是否需要挂载脚本，默认判定方式 */
  shouldMountScript (script: Script): boolean {
    if (script instanceof GameModule) {
      // 模块本质是挂载Game实例上的脚本，加以区分，不要重复挂载
      return false
    }

    const extendModules = script.$extendModules
    if (extendModules === true) {
      // 为true时，任意模块都会挂载
      return true
    }
    else if (!extendModules) {
      // 未指定时，或为false时，任意模块都不会挂载
      return false
    }
    // 指定模块挂载
    return extendModules.find((m) => {
      return m === this.name || this instanceof (m as Function)
    }) ? true : false
  }
}