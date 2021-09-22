/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 23:42:14
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 10:24:31
 * @Description: 脚本管理器
 */
import { Script } from './Script'
import { Scriptable } from './enableScript'
import { GameModule } from '../GameModule'

/**
 * 管理器类型
 * - module 游戏模块对应的脚本管理器，为脚本拓展系统方法，但不可主动销毁脚本
 * - node 节点对应的脚本管理器，可以销毁脚本
 */
type ScriptManagerType = 'module' | 'node'

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
  private _scripts: Set<Script> = new Set()

  constructor (sourceTarget: Scriptable) {
    this._sourceTarget = sourceTarget

    this.type = this._sourceTarget instanceof GameModule ? 'module' : 'node'

    if (this._sourceTarget.$lifecycles) {
      this.registerBySet(this._sourceTarget.$lifecycles)
    }
  }

  /** 是否为节点下的脚本控制器 */
  get isNodeSource (): boolean {
    return this.type === 'node'
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
        if (script.enabled && typeof (script as any)[lifecycleName] === 'function') {
          (script as any)[lifecycleName](...args)
        }
      })
    }
    else {
      console.error(`You have trigger a non-existent lifecycle: ${lifecycleName}!`)
    }
  }

  /** 挂载某个脚本  */
  mount (script: Script) {
    script.mountFrom(this)
    this._scripts.add(script)
    /** 从原型链上寻到脚本的生命周期，进行扩充，注意$lifecycles在脚本类的原型链上，这里都是any引用 */
    if (script.$lifecycles) {
      this.registerBySet(script.$lifecycles)
    }
  }

  /** 卸载某个脚本 */
  unmount (script: Script) {
    this._scripts.delete(script)
    script.unmountFrom(this)
  }

  /**
   * 寻找某个脚本
   * @param key 脚本的 构造函数名称 或者 构造函数
   * @returns 
   */
  find<T extends typeof Script> (key: string | T): InstanceType<T> | Script | undefined {
    const scripts = this._scripts
    for (let script of scripts) {
      if (typeof key === 'string' && script.constructor.name === key) {
        return script
      }
      if (script.constructor === key) {
        return script
      }
    }
  }

  /** 销毁脚本功能 */
  destroy () {
    if (!this.isNodeSource) {
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

  /** 设置所有脚本的可用性 */
  setEnabled (enabled: boolean) {
    this._scripts.forEach((script: Script) => {
      script.enabled = enabled
    })
  }
}