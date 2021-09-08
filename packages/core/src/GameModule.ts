/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 19:27:16
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-08 14:11:26
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
export function module (name: string, Module: typeof GameModule, ...args: any[]) {
  return function (Constructor: typeof Game) {
    Constructor.registerModule(name, Module, args)
  }
}

@game
@enableScript
export class GameModule implements Scriptable {
  /** 对游戏实例的引用 */
  Game!: Game
  /** 指向脚本管理对象 */
  $scripts!: ScriptManager | null
  /** 本类的所有脚本生命周期 */
  $lifecycles?: Set<string>
  /** 挂载一个脚本 */
  $mountScript!: (script: typeof Script | Script, ...args: any[]) => void
  /** 触发一个生命周期 */
  $trigger!: (name: string) => void
  /** 销毁脚本(所有)，一般用于对象注销 */
  $destroyScript!: () => void
  
  constructor (...args: any[]) {}

  /** 脚本初始化时触发 */
  onScriptInit (script: Script) {
    this.$mountScript(script)
  }
}