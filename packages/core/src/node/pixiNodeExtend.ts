/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 13:53:33
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:41:19
 * @Description: 为PIXI节点赋予脚本功能
 */
import { DisplayObject, IDestroyOptions } from 'pixi.js'
import { Container } from './pixiNode'
import { Stage } from './Stage'
import { Scene } from './Scene'

import {
  Graphics,
  Sprite,
  TilingSprite,
  AnimatedSprite,
  Text,
  BitmapText,
  Mesh,
  SimpleMesh,
  NineSlicePlane,
  SimplePlane,
  SimpleRope
} from 'pixi.js'

import { game, Game } from '../Game'
import { enableScript, Scriptable, lifecycle } from '../script/enableScript'

declare module './pixiNode' {
  interface Container extends Scriptable {
    get Game (): Game
    Scene?: Scene | null
    Stage?: Stage | null
    deepTrave (callback: (node: Container) => void): void
    onAdded (node: Container, addTo: Container): void
    onRemoved (node: Container, removeFrom: Container): void
  }
}

game(Container)
enableScript(Container)

/** 拓展 添加时、添加孩子时、移除时、移除孩子时 四个脚本生命周期 */
export enum NodeLifecycle {
  onNodeAdded = 'onNodeAdded',
  onChildNodeAdded = 'onChildNodeAdded',
  onNodeRemoved = 'onNodeRemoved',
  onChildNodeRemoved = 'onChildNodeRemoved'
}
lifecycle(
  NodeLifecycle.onNodeAdded, // 节点加入容器时触发
  NodeLifecycle.onChildNodeAdded, // 有子节点装入时触发
  NodeLifecycle.onNodeRemoved, // 节点移出父容器时触发
  NodeLifecycle.onChildNodeRemoved, // 有子节点移出时触发
)(Container)

const addChild = Container.prototype.addChild
Container.prototype.addChild = function<T extends DisplayObject[]> (...children: T): T[0] {
  const res = addChild.call(this, ...children) as Container
  res.onAdded(res, this)
  return children[0]
}

const addChildAt = Container.prototype.addChildAt
Container.prototype.addChildAt = function<T extends DisplayObject> (child: T, index: number): T {
  const res = addChildAt.call(this, child, index) as Container
  res.onAdded(res, this)
  return child
}

const removeChild = Container.prototype.removeChild
Container.prototype.removeChild = function<T extends DisplayObject[]> (...children: T): T[0] {
  const res = removeChild.call(this, ...children) as Container
  res.onRemoved(res, this)
  return children[0]
}

const removeChildAt = Container.prototype.removeChildAt
Container.prototype.removeChildAt = function (index: number): DisplayObject {
  const res = removeChildAt.call(this, index) as Container
  res.onRemoved(res, this)
  return res
}

const removeChildren = Container.prototype.removeChildren
Container.prototype.removeChildren = function (beginIndex = 0, endIndex: number): DisplayObject[] {
  endIndex = endIndex || this.children.length
  const res = removeChildren.call(this, beginIndex, endIndex) as Container[]
  for (let i = 0; i < res.length; i++) {
    res[i].onRemoved(res[i], this)
  }
  return res
}

/** 拓展销毁方法，在完成自我销毁后同时销毁脚本能力 */
const destroy = Container.prototype.destroy
Container.prototype.destroy = function (options?: IDestroyOptions | boolean) {
  destroy.call(this, options)
  // 解除脚本功能
  this.$destroyScript()
}

/** 拓展四个常用的生命周期方法 */
Container.prototype.onAdded = function (node: Container, addTo: Container) {
  // 向上冒泡
  if (this.parent) { this.parent.onAdded(node, addTo) }

  // 本节点被添加时触发
  if (node === this) {
    this.$trigger(NodeLifecycle.onNodeAdded, this, addTo)
  }
  // 添加节点恰好为子节点时触发
  if (addTo === this) {
    this.$trigger(NodeLifecycle.onChildNodeAdded, node, this)
  }
}

Container.prototype.onRemoved = function (node: Container, removeFrom: Container) {
  // 向上冒泡
  if (this.parent) { this.parent.onRemoved(node, removeFrom) }

  // 本节点被添加时触发
  if (node === this) {
    removeFrom.onRemoved(node, removeFrom)
    this.$trigger(NodeLifecycle.onNodeRemoved, this, removeFrom)
  }
  // 添加节点恰好为子节点时触发
  if (removeFrom === this) {
    this.$trigger(NodeLifecycle.onChildNodeRemoved, node, this)
  }
}

/** 深度遍历子节点，在回调函数中执行指定操作 */
Container.prototype.deepTrave = function (callback: (node: Container) => void) {
  callback(this)
  this.children.forEach((child: DisplayObject) => {
    (child as Container).deepTrave(callback)
  })
}

export {
  Container,
  Graphics,
  Sprite,
  TilingSprite,
  AnimatedSprite,
  Text,
  BitmapText,
  Mesh,
  SimpleMesh,
  NineSlicePlane,
  SimplePlane,
  SimpleRope
}