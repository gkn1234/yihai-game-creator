/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-06 14:52:57
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 10:19:13
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
  $mountScript: (script: typeof Script | Script, ...args: any[]) => Script
  /** 触发一个生命周期 */
  $trigger: (name: string, ...args: any[]) => void
  /** 设置脚本的可用性 */
  $enableScript: (enabled: boolean) => void
  /** 销毁脚本(所有)，一般用于对象注销 */
  $destroyScript: () => void
}

/** 对指定节点类扩展脚本功能的装饰器 */
export function enableScript (Constructor: Function) {
  const scriptMixin: Scriptable = {
    $scripts: null,

    $mountScript (
      script: typeof Script | Script,
      ...args: any[]
    ): Script {
      // 确保脚本管理对象初始化
      if (!this.$scripts) {
        this.$scripts = new ScriptManager(this)
      }

      if (script instanceof Script) {
        // 挂载一个脚本对象
        this.$scripts.mount(script)
        return script
      }

      // 根据构造函数挂载脚本
      const scriptInstance = new script(...args)
      this.$scripts.mount(scriptInstance)       
      return scriptInstance
    },

    $trigger (name: string, ...args: any[]) {
      if (this.$scripts) {
        this.$scripts.trigger(name, ...args)
      }
    },

    $enableScript (enabled: boolean) {
      if (this.$scripts) {
        this.$scripts.setEnabled(enabled)
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

/**
 * 注入脚本或模块的生命周期的装饰器
 * @param names 生命周期名称列表，必须以 on 开头
 * @param desc 描述
 */
export function lifecycle (...names: string[]) {
  return function (Constructor: Function) {
    if (names.length <= 0) {
      return
    }
    
    if (!Constructor.prototype.$lifecycles) {
      Constructor.prototype.$lifecycles = new Set()
    }

    names.forEach((name: string) => {
      if (name[0] !== 'o' || name[1] !== 'n') {
        // 生命周期名称必须以 on 开头
        console.error(`Invalid lifecycle name: ${name}! Lifecycle name must begin with \'on\'.`)
      }
      else {
        Constructor.prototype.$lifecycles.add(name)  
      }
    })
  }
}

/**
 * 指定脚本继承哪个模块的生命周期
 * @param modules 可以用模块构造函数或者其名称指定其继承哪个模块。首项传入 true 则继承所有模块，不填参数 或 首项传入 false 则不继承任何模块
 */
export function extendModules (...modules: (Function | string | boolean)[]) {
  return function (Constructor: Function) {
    if (modules.length <= 0) {
      return
    }
    else if (typeof modules[0] === 'boolean') {
      Constructor.prototype.$extendModules = module
    }
    else {
      if (!Array.isArray(Constructor.prototype.$extendModules)) {
        Constructor.prototype.$extendModules = []
      }      
      modules.forEach((module) => {
        Constructor.prototype.$extendModules.push(module)        
      })
    }
  }
}