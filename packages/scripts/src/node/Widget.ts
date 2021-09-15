/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-14 16:43:01
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-15 18:20:38
 * @Description: 相对布局脚本
 */
import { 
  Script, 
  Container,
  lifecycle,
  extendModules
} from '@yhgame/core'

import { ScreenFix } from '@yhgame/modules'
import { percentToNum } from '@yhgame/shared'
import { Rectangle } from 'pixi.js'

/** 节点相对布局更新的模式 */
export type WidgetUpdateMode = 'added' | 'resize'

/** 相对布局配置 */
export interface WidgetRelative {
  top?: number | string,
  bottom?: number | string,
  left?: number | string,
  right?: number | string,
  centerX?: number | string,
  centerY?: number | string
}
const RELATIVE_KEYS: (keyof WidgetRelative)[] = ['top', 'bottom', 'left', 'right', 'centerX', 'centerY']

/** 相对布局生命周期 */
export enum WidgetLifecycle {
  onWidgetUpdate = 'onWidgetUpdate'
}

@lifecycle(WidgetLifecycle.onWidgetUpdate, '调整节点的相对布局时触发')
@extendModules(ScreenFix)
export class Widget extends Script {
  /**
   * 节点相对布局更新的模式
   * added 只在节点被添加到容器时触发布局更新
   * resize 不仅在添加时触发，还在屏幕尺寸发生变化时触发布局更新
   * frame 每帧都触发布局更新，感觉没必要又耗性能，暂时不支持
   */
  private _updateMode: WidgetUpdateMode = 'resize'

  /** 当前相对布局信息 */
  private _relative: WidgetRelative = {}

  /** 根据相对布局信息计算出的，需要设置给容器的宽高，为null时将容器宽高还原为实际值(拉伸前) localBounds.width / localBounds.height */
  private _width: number | null = null
  private _height: number | null = null
  /** 根据相对布局信息计算出的，需要设置给容器的位置，为null时不对容器进行赋值 */
  private _x: number | null = null
  private _y: number | null = null

  /** 获取屏幕适配模块实例，相对布局组件强依赖于屏幕适配模块 */
  get screenFix (): ScreenFix {
    const module = this.Game.module(ScreenFix)
    if (!module) {
      throw new Error('Widget script can not work without ScreenFix module!')
    }
    return module as ScreenFix
  }

  /** 获取节点 */
  get Node (): Container {
    if (!this.nodeInstance || this.nodeInstance.constructor !== Container) {
      // 节点【必须】是 Container 容器
      throw new Error('Widget script must be mounted on Container node!')
    }
    return this.nodeInstance as Container
  }

  /** 节点容器可视部分矩形 (即可视区域，其中 x y 坐标是相对于容器的，width height 尺寸不考虑拉伸) */
  get localBounds (): Rectangle {
    return this.Node.getLocalBounds()
  }

  /** 是否还在舞台上 */
  get isOnStage (): boolean {
    // 父节点溯源，根节点是舞台代表节点在舞台上
    let cur = this.Node
    while (cur.parent) {
      cur = cur.parent
    }
    return cur === this.Game.Stage
  }


  constructor (relative: WidgetRelative = {}, mode: WidgetUpdateMode = 'resize') {
    super()

    this._updateMode = mode
    this.setRelative(relative)
  }

  onActive () {
    this.Node.on('added', this._addHandler, this)
  }

  onDestroy () {
    this.Node.off('added', this._addHandler, this)
  }

  /** 节点加入容器时触发，此时计算屏幕 */
  private _addHandler () {
    this.update()
  }

  /** 屏幕尺寸变化时触发 */
  onScreenResize () {
    if (this._updateMode === 'resize') {
      this.update()
    }
  }

  /** 更新相对布局信息 */
  update () {
    this.setRelative(this._relative)
  }

  /**
   * 通过指定相对布局信息，获取容器新的定位于尺寸，并进行更新
   * @param relative 相对布局对象，详细说明如下
   * @param relative.top 容器的可视区域上边界与画布竖直方向顶端的距离
   * @param relative.bottom 容器可视区域下边界与画布竖直方向底端的距离
   * @param relative.left 容器可视区域左边界与画布水平方向左端的距离
   * @param relative.right 容器可视区域右边界与画布水平方向右端的距离
   * @param relative.centerX 容器可视区域中心与画布中心的X距离
   * @param relative.centerY 容器可视区域中心与画布中心的Y距离
   * *********************************************************
   * 水平方向上，left right centerX
   * - 如果三者都存在则centerX被忽略，由 left right 确定宽度。
   * - 如果有其二则能够确定宽度，宽度将被拉伸为确定值。
   * - 如果只有其一或者都不具有，则无法确定宽度。当三者均无时，强行设置 left = 0
   * 竖直方向上，top bottom centerY ，的规则与水平方向类似。
   * - 如果三者都存在则centerY被忽略，由 top bottom 确定宽度。
   * - 如果有其二则能够确定高度，高度将被拉伸为确定值。
   * - 如果只有其一或者都不具有，则无法确定宽度。当三者均无时，强行设置 top = 0
   * *********************************************************
   * 宽度和高度是否被确定，会按照以下规则决定容器的实际尺寸
   * - 如果两者都无法确定，则容器维持原可视区域的尺寸
   * - 如果两者确定其一，确定者被拉伸为指定值，另一者会按照原可视区域的长宽比自适应
   * - 如果两者确定其二，则无视原可视区域的长宽比，强行进行拉伸
   */
  setRelative (relative: WidgetRelative = {}) {
    this._resolveRelative(relative)
    this._resolvePosition()
    this._update()
  }

  /** 解析并更新相对布局配置项 */
  private _resolveRelative (relative: WidgetRelative = {}) {
    RELATIVE_KEYS.forEach((key) => {
      const value = relative[key]
      if (typeof value === 'string') {
        const percent = percentToNum(value)
        if (percent === null) {
          // 百分比不合法
          delete this._relative[key]
        }
        else {
          // 将百分比转换为具体偏移量
          let base = (key === 'top' || key === 'centerY' || key === 'bottom') ? 
            this.screenFix.canvasWidth : this.screenFix.canvasHeight
          if (key.indexOf('center')) {
            base /= 2
          }
          this._relative[key] = base * percent
        }
      }
      else if (typeof value === 'number') {
        this._relative[key] = value
      }
      else {
        delete this._relative[key]
      }
    })

    // 三选0的情况下至少补上一个基础属性
    if (
      typeof this._relative.top !== 'number' &&
      typeof this._relative.bottom !== 'number' &&
      typeof this._relative.centerY !== 'number'
    ) {
      this._relative.top = 0
    }
    if (
      typeof this._relative.left !== 'number' &&
      typeof this._relative.right !== 'number' &&
      typeof this._relative.centerX !== 'number'
    ) {
      this._relative.left = 0
    }
  }

  /** 根据当前相对布局信息，更新位置与尺寸信息 */
  private _resolvePosition () {
    if (!this.Node.parent) {

    }
  }

  /** 根据位置与尺寸信息，更新容器 */
  private _update () {
    // 节点不可见，没必要更新布局
    if (!this.isOnStage) { return }

    /** @alarm 强制使pivot归0，原则上使用相对布局的容器不能够设置pivot，也不能自行设置 x y width height */
    this.Node.pivot.set(0, 0)
    /** 尺寸信息为null时将容器宽高还原为实际值(拉伸前) localBounds.width / localBounds.height */
    this.Node.width = typeof this._width === 'number' ? this._width : this.localBounds.width
    this.Node.height = typeof this._height === 'number' ? this._height : this.localBounds.height
    /** 位置信息为null时不对容器进行赋值 */
    if (typeof this._x === 'number') { this.Node.x = this._x }
    if (typeof this._y === 'number') { this.Node.y = this._y }

    this.trigger(WidgetLifecycle.onWidgetUpdate, this)
  }
}
