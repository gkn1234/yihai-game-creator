/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:18:23
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-10 10:26:48
 * @Description: 脚本对象基类
 */
import { game, Game } from '../Game'
import { GameModule } from '../GameModule'
import { Scriptable } from './enableScript'
import { ScriptManager } from './ScriptManager'

@game
export class Script {
  /** 指向游戏功能模块下的脚本管理器的指针 */
  private _moduleManagers: Set<ScriptManager> = new Set()
  /** 指向节点下的脚本管理器指针 */
  private _nodeManagers: ScriptManager | null = null

  /** 扩充的脚本生命周期 */
  $lifecycles!: Set<string>
  /** 指定脚本继承哪些模块的能力 */
  $extendModules!: Set<string | Function>
  /** 配合Game装饰器，对游戏实例的引用 */
  Game!: Game

  /** 指向应用此脚本的实例对象的指针 */
  get nodeInstance (): Scriptable | null {
    return this._nodeManagers ? this._nodeManagers.sourceTarget : null
  }

  /** 脚本是否激活，初始激活 */
  enabled: boolean
  

  constructor (...args: any[]) {
    this.enabled = true

    this._init()
  }

  /** 初始化脚本，挂载到游戏模块上，以继承基础功能 */
  private _init () {
    const extendModules = this.$extendModules
    this.Game.traveModules((module: GameModule) => {
      // 满足条件才会进行挂载
      if (extendModules.has(module.name as string) || extendModules.has(module.constructor)) {
        module.$mountScript(this)
      }
    })
  }

  /** 脚本挂载到某个管理器 */
  mount (scriptManager: ScriptManager) {
    if (scriptManager.isNodeSource) {
      if (this._nodeManagers) {
        console.error('Duplicated mounting on the same node is invalid!')
        return
      }

      // 挂载到节点时，可认为脚本被正式激活
      this._nodeManagers = scriptManager
      // 挂载到节点时脚本激活
      this.onActive()
    }
    else {
      this._moduleManagers.add(scriptManager)
    }
  }

  /** 脚本从某个管理器上卸载 */
  unmount (scriptManager: ScriptManager) {
    if (scriptManager.isNodeSource) {
      if (!this._nodeManagers) {
        // 无需重复卸载
        return
      }

      // 从节点卸载时，可认为脚本将被摧毁，因此也要同时从所有系统模块卸载
      this._moduleManagers.forEach((moduleManager: ScriptManager) => {
        moduleManager.unmount(this)
      })
      // 注意修改脚本对象的指针，以便可以正确释放内存
      this._nodeManagers = null
      // 触发对应生命周期
      this.onDestroy()
    }
    else {
      this._moduleManagers.delete(scriptManager)
    }
  }

  /** 脚本固有生命周期，挂载到节点时触发 */
  onActive () {}
  /** 脚本固有生命周期，被卸载后触发 */
  onDestroy () {}
}