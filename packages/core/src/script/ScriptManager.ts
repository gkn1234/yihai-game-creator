/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 23:42:14
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 18:57:07
 * @Description: 脚本管理器
 */
import { Script } from './Script'
import { Scriptable } from './enableScript'
import { GameModule } from '../GameModule'

/** 管理器类型 */
enum ScriptManagerType {
  /** 游戏模块对应的脚本管理器，为脚本拓展系统方法，但不可主动销毁脚本 */
  module = 0,
  /** 节点对应的脚本管理器，可以销毁脚本 */
  node = 1
}

export class ScriptManager {
  /** 应用此脚本管理器的对象 */
  private _sourceTarget: Scriptable | null
  get sourceTarget (): Scriptable | null {
    return this._sourceTarget
  }

  /** 脚本管理器类型 */
  readonly type: ScriptManagerType
  
  /** 本管理器对应的脚本生命周期 */
  private _lifecycles: Set<string> = new Set()
  /** 当前脚本队列 */
  private _scripts: Set<Script>

  constructor (sourceTarget: Scriptable) {
    this._sourceTarget = sourceTarget

    this.type = this._sourceTarget instanceof GameModule ? 
      ScriptManagerType.module : 
      ScriptManagerType.node
    
    this._scripts = new Set()

    if (this._sourceTarget.$lifecycles) {
      this.registerBySet(this._sourceTarget.$lifecycles)
    }
  }

  /** 是否为节点下的脚本控制器 */
  get isNodeType (): boolean {
    return this.type === ScriptManagerType.node
  }

  /**
   * 注册一个生命周期
   * @param lifecycles 参数队列，生命周期名称
   */
  register (...lifecycles: string[]) {
    lifecycles.forEach((lifecycle: string) => {
      this._lifecycles.add(lifecycle)
    })
  }

  /**
   * 注册一组生命周期
   * @param lifecycleSet 生命周期组
   */
  registerBySet (lifecycleSet: Set<string>) {
    const lifecycleList: string[] = []
    for (let item of lifecycleSet) {
      lifecycleList.push(item)
    }
    this.register(...lifecycleList)
  }

  /** 触发脚本生命周期 */
  trigger (lifecycleName: string, ...args: any[]) {
    if (this._lifecycles.has(lifecycleName)) {
      // 执行某个生命周期下的所有脚本方法
      this._scripts.forEach((script: Script) => {
        if (script.enabled && typeof script[lifecycleName] === 'function') {
          script[lifecycleName](...args)
        }
      })
    }
  }

  /** 挂载某个脚本  */
  mount (script: Script) {
    script.mount(this)
    this._scripts.add(script)
    /** 从原型链上寻到脚本的生命周期，进行扩充，注意$lifecycles在脚本类的原型链上，这里都是any引用 */
    this.registerBySet(script.$lifecycles)
  }

  /** 卸载某个脚本 */
  unmount (script: Script) {
    this._scripts.delete(script)
    script.unmount(this)
  }

  /** 销毁脚本功能 */
  destroy () {
    if (!this.isNodeType) {
      console.error('Scripts can only be destroyed by node-type manager!')
      return
    }

    this._scripts.forEach((script: Script) => {
      this.unmount(script)
    })

    // 解除对源节点的引用，以释放缓存
    if (this._sourceTarget) {
      this._sourceTarget = null      
    }
  }
}