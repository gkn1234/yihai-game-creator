<!--
 * @Autor: Guo Kainan
 * @Date: 2021-09-06 08:35:59
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 16:54:53
 * @Description: 
-->
# TS多种工具类型
[TS多种工具类型](https://segmentfault.com/a/1190000020536733)

# 装饰器注入导致类型不安全的解决方案

使用 显示赋值断言 来解决
```ts
function d (C: Function) {
  C.prototype.a = 1
}

@d
class A {
  // 使用显示赋值断言处理
  a!: number
}
```
[显示赋值断言是TS2.7新特性](https://www.tslang.cn/docs/release-notes/typescript-2.7.html)

# 对类进行拓展

[声明合并 / 模块扩展](https://www.tslang.cn/docs/handbook/declaration-merging.html)

但是这里有一个问题没有解决

如果我直接从库中导出类，对其进行扩展，就会报错，类会降级为借口
```ts
import { Container } from 'pixi.js'

declare module 'pixi.js' {
  interface Container extends xxx
}

// 类降级为借口，报错
Container.prototype.xxx
// ...
```

必须如此处理
```ts
// ./pixi.ts
export { Container } from 'pixi.js'

// 目标文件
import { Container } from './pixi'

declare module './pixi' {
  interface Container extends xxx
}

// 类降级为借口，报错
Container.prototype.xxx
// ...
```

# Typescript使用显示赋值断言 !: 是否会给类的实例赋值undefined

有以下代码：

```ts
class Game {
  static __GameInstance__: null | object = null
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

@game
Test {
  Game!: Game
}

new Test().Game
```

按照正常期望( `tsconfig.json` 的 `target` 设置为 `es201x` 时)，应该是访问器 `Game` 抛出错误

然而当你把 `tsconfig.json` 的 `target` 设置为 `esnext` 时，居然可以访问 `Game` 访问器，这个值为 `undefined` 。

似乎是 `esnext` 设置下，显示赋值断言 `!:` 会把类的对应属性初始化为 `undefined` 。

而在 `es201x` 设置下，赋值断言 `!:` 不会给类进行初值设置。

奇怪的问题，无解，对此暂时的处理方式是：**任何时候都不要把 target 设置为 esnext**