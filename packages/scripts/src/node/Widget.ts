/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-14 16:43:01
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 18:15:28
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
import { Rectangle, IPointData } from 'pixi.js'

/** 节点相对布局更新的模式 */
export type WidgetUpdateMode = 'common' | 'resize'

/** 计算相对布局使用的坐标点接口 */
export interface WidgetPoint {
  x?: number | null,
  y?: number | null
}

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

@lifecycle(
  WidgetLifecycle.onWidgetUpdate // 调整节点的相对布局时触发
)
@extendModules(ScreenFix)
export class Widget extends Script {
  /**
   * 节点相对布局更新的模式
   * common 只有节点进入舞台(即被激活时 onEnabled)，或是通过 API 修改布局信息时，触发更新
   * resize 不仅包括上面的触发方式，还在屏幕尺寸发生变化时触发布局更新
   * frame 每帧都触发布局更新，感觉没必要又耗性能，暂时不支持
   */
  private _updateMode: WidgetUpdateMode = 'resize'

  /** 当前相对布局信息 */
  private _relative: WidgetRelative = {}
  /** 当前相对布局有效选项 */
  private _relativeOptions: WidgetRelative = {}

  /** 根据相对布局信息计算出的，需要设置给容器的宽高，为null时将容器宽高还原为实际值(拉伸前) localBounds.width / localBounds.height */
  private _width: number = 0
  private _height: number = 0
  /** 根据相对布局信息计算出的，需要设置给容器的位置，为null时不对容器进行赋值 */
  private _x: number = 0
  private _y: number = 0

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


  constructor (relative: WidgetRelative = {}, mode: WidgetUpdateMode = 'resize') {
    super()

    this._updateMode = mode
    this._resolveRelative(relative)
  }

  /** 节点进入舞台后触发更新，此时计算屏幕 */
  onEnabled () {
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
    // 原地更新
    this.setRelative(this._relativeOptions)
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
   * - 如果只有其一或者都不具有，则无法确定宽度。
   * 竖直方向上，top bottom centerY ，的规则与水平方向类似。
   * - 如果三者都存在则centerY被忽略，由 top bottom 确定宽度。
   * - 如果有其二则能够确定高度，高度将被拉伸为确定值。
   * - 如果只有其一或者都不具有，则无法确定宽度。
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
    this._relativeOptions = relative

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
            this.screenFix.canvasHeight : this.screenFix.canvasWidth
          if (key.indexOf('center') >= 0) {
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
  }

  /** 根据当前相对布局信息，更新位置与尺寸信息 */
  private _resolvePosition () {
    // 不在舞台上，无法计算
    if (!this.Node.Stage) { return }

    const parent = this.Node.parent
    const global = parent.toGlobal({
      x: this.Node.x,
      y: this.Node.y
    })
    const { top, bottom, centerY, left, right, centerX } = this._relative
    const { canvasWidth, canvasHeight, shouldRotateStage } = this.screenFix

    // 定左上坐标，竖直方向
    if (typeof top === 'number') {
      if (shouldRotateStage) { global.x = canvasHeight - top }
      else { global.y = top }
    }
    else if (typeof bottom === 'number') {
      if (shouldRotateStage) { global.x = bottom }
      else { global.y = canvasHeight - bottom }
    }
    else if (typeof centerY === 'number') {
      if (shouldRotateStage) { global.x = (canvasHeight / 2) - centerY }
      else { global.y = (canvasHeight / 2) + centerY }
    }

    // 定左上坐标，水平方向
    if (typeof left === 'number') {
      if (shouldRotateStage) { global.y = left }
      else { global.x = left }
    }
    else if (typeof right === 'number') {
      if (shouldRotateStage) { global.y = canvasWidth - right }
      else { global.x = canvasWidth - right }
    }
    else if (typeof centerX === 'number') {
      if (shouldRotateStage) { global.y = (canvasWidth / 2) + centerX }
      else { global.x = (canvasWidth / 2) + centerX }
    }

    // 坐标确定完成
    const local = parent.toLocal(global)
    this._x = local.x
    this._y = local.y

    // 继续确定尺寸
    this._resolveSize(global)

    
    console.log('相对布局信息', top, bottom, centerY, left, right, centerX)
    console.log('画布信息', canvasWidth, canvasHeight, shouldRotateStage)
    console.log('节点信息', this.Node, this.localBounds)
    console.log('坐标信息', global, local)
    console.log('尺寸信息', this._width, this._height)
    
  }

  /** 由相对布局信息计算尺寸，global为左上角的画布坐标 */
  private _resolveSize (global: IPointData) {
    const { top, bottom, centerY, left, right, centerX } = this._relative
    const { canvasWidth, canvasHeight, shouldRotateStage } = this.screenFix
    // 容器末端(最 右/下 端)的横纵坐标，用于定宽高
    let globalEnd = { x: global.x, y: global.y }
    // 是否确定宽高
    let isHorSet = true, isVerSet = true

    if (typeof left === 'number' && typeof right === 'number') {
      if (shouldRotateStage) { globalEnd.y = canvasWidth - left - right + global.y }
      else { globalEnd.x = canvasWidth - left - right + global.x }
    }
    else if (typeof left === 'number' && typeof centerX === 'number') {
      if (shouldRotateStage) { globalEnd.y = canvasWidth / 2 + centerX - left + global.y }
      else { globalEnd.x = canvasWidth / 2 + centerX - left + global.x }
    }
    else if (typeof right === 'number' && typeof centerX === 'number') {
      if (shouldRotateStage) { globalEnd.y = canvasWidth / 2 - centerX - right + global.y }
      else { globalEnd.x = canvasWidth / 2 - centerX - right + global.x }
    }
    else { isHorSet = false }

    if (typeof top === 'number' && typeof bottom === 'number') {
      if (shouldRotateStage) { globalEnd.x = bottom }
      else { globalEnd.y = canvasHeight - top - bottom + global.y }
    }
    else if (typeof top === 'number' && typeof centerY === 'number') {
      if (shouldRotateStage) { globalEnd.x = global.y - canvasHeight / 2 + top - centerY }
      else { globalEnd.y = canvasHeight / 2 + centerY - top + global.y }
    }
    else if (typeof bottom === 'number' && typeof centerY === 'number') {
      if (shouldRotateStage) { globalEnd.x = bottom }
      else { globalEnd.y = canvasHeight / 2 - centerY - bottom + global.y }
    }
    else { isVerSet = false }

    // 正式定宽高
    const parent = this.Node.parent
    const localEnd = parent.toLocal(globalEnd)
    const dw = localEnd.x - this._x
    const dh = localEnd.y - this._y
    if (isHorSet && isVerSet) {
      // 宽高均确定，强制拉伸
      this._width = dw
      this._height = dh
    }
    else if (isHorSet && !isVerSet) {
      // 定宽，高度自适应
      this._width = dw
      this._height = this._width * (this.localBounds.height / this.localBounds.width)
    }
    else if (!isHorSet && isVerSet) {
      // 定高，宽度自适应
      this._height = dh
      this._width = this._height * (this.localBounds.width / this.localBounds.height)
    }
    else {
      // 宽高都无法确定，则与可视区域宽高保持一致
      this._width = this.localBounds.width
      this._height = this.localBounds.height
    }
  }

  /** 根据位置与尺寸信息，更新容器 */
  private _update () {
    // 不在舞台上，无法设置
    if (!this.Node.Stage) { return }

    /** @alarm 强制使pivot归0，原则上使用相对布局的容器不能够设置pivot，也不能自行设置 x y width height */
    this.Node.pivot.set(0, 0)
    this.Node.width = this._width
    this.Node.height = this._height
    this.Node.position.set(this._x, this._y)

    this.trigger(WidgetLifecycle.onWidgetUpdate, this)
  }
}
