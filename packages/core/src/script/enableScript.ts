/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-06 14:52:57
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-08 14:11:09
 * @Description: 
 */
import { Script } from './Script'
import { ScriptManager } from './ScriptManager'

/** 具有脚本能力的类的必备属性 */
export interface Scriptable {
  /** 指向脚本管理对象 */
  $scripts: ScriptManager | null
  /** 本类的所有脚本生命周期 */
  $lifecycles?: Set<string>
  /** 根据构造函数或者脚本对象，挂载对应的脚本 */
  $mountScript: (script: typeof Script | Script, ...args: any[]) => void
  /** 触发一个生命周期 */
  $trigger: (name: string) => void
  /** 销毁脚本(所有)，一般用于对象注销 */
  $destroyScript: () => void
  /** 可以挂载其他属性 */
  [key: string]: any
}

/** 对指定节点类扩展脚本功能的装饰器 */
export function enableScript (Constructor: Function) {
  const scriptMixin: Scriptable = {
    $scripts: null,

    $mountScript (
      script: typeof Script | Script,
      ...args: any[]
    ) {
      // 确保脚本管理对象初始化
      if (!this.$scripts) {
        this.$scripts = new ScriptManager(this)
      }

      if (script instanceof Script) {
        // 挂载一个脚本对象
        this.$scripts.mount(script)
      }
      else {
        // 根据构造函数挂载脚本
        const scriptInstance = new script(...args)
        this.$scripts.mount(scriptInstance)       
      }
    },

    $trigger (name: string) {
      if (this.$scripts) {
        this.$scripts.trigger(name)
      }
    },

    $destroyScript () {
      if (this.$scripts) {
        this.$scripts.destroy()
        // 解除引用，以释放缓存
        this.$scripts = null
      }
    }
  }

  Object.assign(Constructor.prototype, scriptMixin)
}

/** 生命周期保留名称 */
const RESERVED_LIFECYCLE_NAMES: string[] = ['onActive', 'onDestroy']
/**
 * 注入脚本生命周期的装饰器
 * @param name 生命周期名称，必须以 on 开头
 * @param desc 描述
 */
export function lifecycle (name: string = '', desc: string = '') {
  return function (Constructor: Function) {
    if (name[0] !== 'o' || name[1] !== 'n') {
      // 生命周期名称必须以 on 开头
      console.error(`Invalid lifecycle name: ${name}! Lifecycle name must begin with \'on\'.`)
      return
    }
    if (RESERVED_LIFECYCLE_NAMES.indexOf(name) >= 0) {
      // 不可以使用保留名称
      console.error(`Invalid lifecycle name: ${name}! It is a reversed lifecycle name.`)
      return
    }

    if (!Constructor.prototype.$lifecycles) {
      Constructor.prototype.$lifecycles = new Set()
    }
    Constructor.prototype.$lifecycles.add(name)
  }
}