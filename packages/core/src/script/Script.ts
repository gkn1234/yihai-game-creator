/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:18:23
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-15 15:47:14
 * @Description: 脚本对象基类
 */
import { game, Game, GameLifecycle } from '../Game'
import { Scriptable } from './enableScript'
import { ScriptManager } from './ScriptManager'

@game
export class Script {
  /** 指向游戏功能模块下的脚本管理器的指针 */
  private _moduleManagers: Set<ScriptManager> = new Set()
  /** 指向节点下的脚本管理器指针 */
  private _nodeManagers: ScriptManager | null = null

  /** 扩充的脚本生命周期 */
  $lifecycles?: Set<string>
  /** 指定脚本继承哪些模块的能力 */
  $extendModules?: Set<string | Function> | boolean
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

    this._initScript()
  }

  /** 初始化脚本，挂载到游戏模块上，以继承基础功能 */
  private _initScript () {
    this.Game.$trigger(GameLifecycle.onScriptInit, this)
  }

  /** 脚本挂载到某个管理器 */
  mountFrom (scriptManager: ScriptManager) {
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
  unmountFrom (scriptManager: ScriptManager) {
    if (scriptManager.isNodeSource) {
      if (!this._nodeManagers) {
        // 无需重复卸载
        return
      }

      // 从节点卸载时，可认为脚本将被摧毁，因此也要同时从所有系统模块卸载
      this._moduleManagers.forEach((moduleManager: ScriptManager) => {
        moduleManager.unmount(this)
      })
      // 触发对应生命周期
      this.onDestroy()
      // 注意修改脚本对象的指针，以便可以正确释放内存
      this._nodeManagers = null
    }
    else {
      this._moduleManagers.delete(scriptManager)
    }
  }

  /** 触发所在节点的脚本生命周期 */
  trigger (name: string, ...args: any[]) {
    if (!this.nodeInstance) {
      console.error('Script can only trigger lifecycles on parent node, but no parent node found!')
      return
    }
    this.nodeInstance.$trigger(name, ...args)
  }

  /** 在节点上，根据指定的构造函数或者名称寻找其他脚本 */
  getScript<T extends typeof Script> (key: string | T): InstanceType<T> | Script | undefined {
    if (!this._nodeManagers) {
      return
    }

    return this._nodeManagers.find(key)
  }

  /** 脚本固有生命周期，挂载到管理节点后触发 */
  onActive () {}
  /** 脚本固有生命周期，被管理节点卸载前触发 */
  onDestroy () {}
}