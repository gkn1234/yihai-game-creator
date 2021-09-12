/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 13:53:33
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-10 10:34:37
 * @Description: 为PIXI节点赋予脚本功能
 */
import { DisplayObject, IDestroyOptions } from 'pixi.js'
import { Container } from './pixiNode'

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
    onAdded (): void
    onChildAdded (child: Container): void
    onRemoved (): void
    onChildRemoved (child: Container): void
  }
}

game(Container)
enableScript(Container)

/** 拓展 添加时、添加孩子时、移除时、移除孩子时 四个脚本生命周期 */
lifecycle('onNodeAdded', '节点加入容器时触发')(Container)
lifecycle('onChildNodeAdded', '有子节点装入时触发')(Container)
lifecycle('onNodeRemoved', '节点移出父容器时触发')(Container)
lifecycle('onChildNodeRemoved', '有子节点移出时触发')(Container)

const addChild = Container.prototype.addChild
Container.prototype.addChild = function<T extends DisplayObject[]> (...children: T): T[0] {
  const res = addChild.call(this, ...children) as Container
  res.onAdded()
  this.onChildAdded(res)
  return children[0]
}

const addChildAt = Container.prototype.addChildAt
Container.prototype.addChildAt = function<T extends DisplayObject> (child: T, index: number): T {
  const res = addChildAt.call(this, child, index) as Container
  res.onAdded()
  this.onChildAdded(res)
  return child
}

const removeChild = Container.prototype.removeChild
Container.prototype.removeChild = function<T extends DisplayObject[]> (...children: T): T[0] {
  const res = removeChild.call(this, ...children) as Container
  res.onRemoved()
  this.onChildRemoved(res)
  return children[0]
}

const removeChildAt = Container.prototype.removeChildAt
Container.prototype.removeChildAt = function (index: number): DisplayObject {
  const res = removeChildAt.call(this, index) as Container
  res.onRemoved()
  this.onChildRemoved(res)
  return res
}

const removeChildren = Container.prototype.removeChildren
Container.prototype.removeChildren = function (beginIndex = 0, endIndex: number): DisplayObject[] {
  endIndex = endIndex || this.children.length
  const res = removeChildren.call(this, beginIndex, endIndex) as Container[]
  for (let i = 0; i < res.length; i++) {
    res[i].onRemoved()
    this.onChildRemoved(res[i])
  }
  return res
}

/** 拓展销毁方法，在完成自我销毁后同时销毁脚本能力 */
const destroy = Container.prototype.destroy
Container.prototype.destroy = function (options?: IDestroyOptions | boolean) {
  destroy.call(this, options)
  this.$destroyScript()
}

/** 拓展四个常用的生命周期方法 */
Container.prototype.onAdded = function () {
  this.$trigger('onNodeAdded', this)
}

Container.prototype.onChildAdded = function (child: Container) {
  this.$trigger('onChildNodeAdded', this, child)
}

Container.prototype.onRemoved = function () {
  this.$trigger('onNodeRemoved', this)
}

Container.prototype.onChildRemoved = function (child: Container) {
  this.$trigger('onChildNodeRemoved', this, child)
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