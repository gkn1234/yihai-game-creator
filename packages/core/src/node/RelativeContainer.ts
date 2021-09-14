/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-09 18:46:27
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 16:22:11
 * @Description: 相对布局节点
 */
import { Container } from './pixiNodeExtend'
import { GameModule } from '../GameModule'

export interface RelativePosition {
  top?: number | string,
  bottom?: number | string,
  left?: number | string,
  right?: number | string,
  centerX?: number | string,
  centerY?: number | string
}

/** 描述屏幕适配模块的功能，避免和 modules 包的循环依赖问题，详见 @yhgame/modules/ScreenFix 中的具体实现 */
export interface ScreenFix extends GameModule {
  canvasWidth: number
  canvasHeight: number
  shouldRotateStage: boolean
  addRelativeContainer (container: RelativeContainer): void
  removeRelativeContainer (container: RelativeContainer): void
}

/** 水平竖直方向 */
enum Direction {
  horizontal = 1,
  vertical = 2
}

export class RelativeContainer extends Container {
  private _pos: RelativePosition

  /**
   * 相对布局节点的作用是时容器相对于画布布局
   * 相对布局节点的父节点一般是 Stage 、Scene 或者 Layer
   */
  constructor () {
    super()
    this._pos = this._resolveRelativePos()
  }

  /** 相对布局组件强依赖与屏幕适配模块 */
  get screenFix (): ScreenFix {
    const module = this.Game.module('ScreenFix')
    if (!module) {
      throw new Error('RelativeContainer can not work without ScreenFix module!')
    }
    return module as ScreenFix
  }

  /** 计算相对布局偏移量，支持百分比转数字尺寸 */
  private _calcRelative (num: number | string, direction: Direction = Direction.horizontal): number {
    const number = Number(num)
    if (typeof number === 'number' && !Number.isNaN(number)) {
      return number
    }
    else if (typeof num === 'string' && num[num.length - 1] === '%') {
      const percent = Number(num.slice(0, num.length - 1))
      const base = direction === Direction.horizontal ? this.screenFix.canvasWidth : this.screenFix.canvasHeight
      return base * percent / 100
    }
    return number
  }

  /** 解析相对布局信息 */
  private _resolveRelativePos (pos?: RelativePosition): RelativePosition {
    pos = pos || {}
    let res: RelativePosition = {}
    if (!!pos.top) {
      res.top = pos.top
    }
    else if (!!pos.bottom) {
      res.bottom = pos.bottom
    }
    else if (!!pos.centerY) {
      res.centerY = pos.centerY
    }
    else {
      res.centerY = 0
    }
  
    if (!!pos.left) {
      res.left = pos.left
    }
    else if (!!pos.right) {
      res.right = pos.right
    }
    else if (!!pos.centerX) {
      res.centerX = pos.centerX
    }
    else {
      res.centerX = 0
    }
    return res
  }

  /**
   * 设定相对布局信息，相对于画布边界的定位，与anchor锚点无关
   * @param pos 相对布局信息，详细说明如下：
   * 不能同时指定 top & bottom & centerY 或者 left & right & centerX，水平和竖直边界定位只能各选其一。
   * 竖直方向的优先级：top -> bottom -> centerY
   * 水平方向的优先级：left -> right -> centerX
   */
  setRelative (pos: RelativePosition) {
    this._pos = this._resolveRelativePos(pos)
    this.updatePosition()
  }

  /** 更新容器的位置 */
  updatePosition () {
    const parent = this.parent
    if (!parent) {
      // 没有父节点，相对位置无从计算
      return
    }

    // TS 编译无法识别我的判别函数，所以只能这么写
    let { top, bottom, left, right, centerX, centerY } = this._pos
    const { canvasWidth, canvasHeight, shouldRotateStage } = this.screenFix
    let globalX = 0, globalY = 0
    if (!!top) {
      top = this._calcRelative(top, Direction.vertical)
      if (shouldRotateStage) {
        globalX = canvasHeight - top
      }
      else {
        globalY = top
      }
    }
    else if (!!bottom) {
      bottom = this._calcRelative(bottom, Direction.vertical)
      if (shouldRotateStage) {
        globalX = bottom
      }
      else {
        globalY = canvasHeight - bottom
      }
    }
    else if (centerY) {
      centerY = this._calcRelative(centerY, Direction.vertical)
      if (shouldRotateStage) {
        globalX = (canvasHeight / 2) - centerY
      }
      else {
        globalY = (canvasHeight / 2) + centerY
      }
    }

    if (!!left) {
      left = this._calcRelative(left, Direction.horizontal)
      if (shouldRotateStage) {
        globalY = left
      }
      else {
        globalX = left
      }
    }
    else if (!!right) {
      right = this._calcRelative(right, Direction.horizontal)
      if (shouldRotateStage) {
        globalY = canvasWidth - right
      }
      else {
        globalX = canvasWidth - right
      }
    }
    else if (!!centerX) {
      centerX = this._calcRelative(centerX, Direction.horizontal)
      if (shouldRotateStage) {
        globalY = (canvasWidth / 2) + centerX
      }
      else {
        globalX = (canvasWidth / 2) + centerX
      }
    }

    const point = parent.toLocal({
      x: globalX, y: globalY
    })

    // console.log(globalX, globalY,  point.x, point.y)

    this.position.set(point.x, point.y)
  }

  onAdded () {
    super.onAdded()
    this.screenFix.addRelativeContainer(this)
    this.updatePosition()
  }

  onRemoved () {
    super.onRemoved()
    this.screenFix.removeRelativeContainer(this)
  }
}
