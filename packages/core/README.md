<!--
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 20:47:47
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-14 16:29:19
 * @Description: 
-->
# core核心
核心包含了以下功能：
- 游戏实例对象
- 脚本系统
- 游戏基本功能模块
- 绘图节点(对 `@pixi/display` 的拓展，使其支持脚本)。

# Game 游戏实例

# Script 脚本系统
本引擎的核心是**脚本系统**，**脚本系统**可以让同一个节点下的多个脚本共享生命周期达到相互之间的通信，从而使脚本能方便地拓展节点的功能。

## enableScript 装饰器
`enabledScript` 是一个装饰器，其能使一个类具有**脚本管理**的特性。

**脚本管理**功能举例：
- 获取脚本管理器实例 `ScriptManager`
- 挂载脚本
- 触发脚本生命周期
- 释放对象的脚本管理功能

使用举例 & 功能方法说明：
```ts
import { enabledScript, Script, Scriptable, ScriptManager } from '@yhgame/core'

@enabledScript
@lifecycle('onA')
class Node implements Scriptable {
  /** TS下如果为了类型安全，必须启用 Scriptable 接口，并定义如下必要的脚本管理属性 */
  /** 指向脚本管理对象 */
  $scripts: ScriptManager | null
  /** 本类的所有脚本生命周期 */
  $lifecycles?: Set<string>
  /** 根据构造函数或者脚本对象，挂载对应的脚本 */
  $mountScript: (script: typeof Script | Script, ...args: any[]) => Script
  /** 触发一个生命周期 */
  $trigger: (name: string, ...args: any[]) => void
  /** 销毁脚本(所有)，一般用于对象注销 */
  $destroyScript: () => void
}

@lifecycle('onB')
class MyScript extends Script {
  onA () {
    console.log('A is triggered!')
  }

  onB (s) {
    console.log('B is triggered! ' + s)
  }
}

const node = new Node()
// 获取脚本管理对象
node.$script
// 可以通过脚本构造函数活着脚本实例挂载一个脚本对象，以下两种写法等效
node.$mountScript(MyScript, a, b)
node.$mountScript(new MyScript(a, b))
// 触发脚本生命周期
node.$trigger('onA') // A is triggered!
node.$trigger('onB', 'Hello world!') // B is triggered! Hello world!
node.$trigger('onC') // 没有任何反应，且抛出警告 warning: You have trigger a non-existent lifecycle: onC!
// 销毁脚本
node.$destroyScript()
console.log(node.$script) // null
```

## lifecycle 装饰器
根据上一节中的介绍，我们知道可以对脚本类或者节点类使用装饰器，可以使同一个脚本管理器 `ScriptManager` 下的所有脚本都共享指定的生命周期名称。

```ts
@enabledScript
@lifecycle('onA')
class Node implements Scriptable {
  // ... 定义必要属性

  func () {
    // 节点中触发生命周期
    this.$trigger('onA')
    this.$trigger('onB')
  }
}

@lifecycle('onB')
class MyScript extends Script {
  func () {
    // 脚本中触发生命周期
    this.trigger('onA') // = this.nodeInstance?.$trigger('onA')
    this.trigger('onB')
  }

  onA () {
    console.log('A is triggered!')
  }

  onB (s) {
    console.log('B is triggered! ' + s)
  }
}

const node = new Node()
node.$mountScript(MyScript)
```

# GameModule 游戏基本功能模块