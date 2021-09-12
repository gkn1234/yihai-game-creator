/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-09 18:46:27
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-12 18:18:08
 * @Description: 相对布局节点
 */
import { Container } from './pixiNodeExtend'
import { GameModule } from '../GameModule'

export interface RelativePosition {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number,
  centerX?: number,
  centerY?: number
}

/** 描述屏幕适配模块的功能，避免和 modules 包的循环依赖问题，详见 @yhgame/modules/ScreenFix 中的具体实现 */
interface ScreenFix extends GameModule {
  canvasWidth: number
  canvasHeight: number
  shouldRotateStage: boolean
  addRelativeContainer (container: RelativeContainer): void
  removeRelativeContainer (container: RelativeContainer): void
}

/** 解析相对布局信息 */
function _resolveRelativePos (pos: RelativePosition): RelativePosition {
  let res: RelativePosition = {}
  if (typeof pos.top !== 'undefined') {
    res.top = pos.top
  }
  else if (typeof pos.bottom !== 'undefined') {
    res.bottom = pos.bottom
  }
  else if (typeof pos.centerY !== 'undefined') {
    res.centerY = pos.centerY
  }
  else {
    res.top = 0
  }

  if (typeof pos.left !== 'undefined') {
    res.left = pos.left
  }
  else if (typeof pos.right !== 'undefined') {
    res.right = pos.right
  }
  else if (typeof pos.centerX !== 'undefined') {
    res.centerX = pos.centerX
  }
  else {
    res.left = 0
  }
  return res
}

export class RelativeContainer extends Container {
  private _pos: RelativePosition = { centerX: 0, centerY: 0 }

  /**
   * 相对布局节点的作用是时容器相对于画布布局
   * 相对布局节点的父节点一般是 Stage 、Scene 或者 Layer
   */
  constructor () {
    super()
  }

  /** 相对布局组件强依赖与屏幕适配模块 */
  get screenFix (): ScreenFix {
    const module = this.Game.module('ScreenFix')
    if (!module) {
      throw new Error('RelativeContainer can not work without ScreenFix module!')
    }
    return module as ScreenFix
  }

  /**
   * 设定相对布局信息，相对于画布边界的定位
   * @param pos 相对布局信息，详细说明如下：
   * 不能同时指定 top & bottom & centerY 或者 left & right & centerX，水平和竖直边界定位只能各选其一。
   * 竖直方向的优先级：top -> bottom -> centerY
   * 水平方向的优先级：left -> right -> centerX
   */
  setRelative (pos: RelativePosition) {
    this._pos = _resolveRelativePos(pos)
    this.updatePosition()
  }

  /** 更新容器的位置 */
  updatePosition () {
    const parent = this.parent
    if (!parent) {
      // 父节点不存在，无法进行相对布局
      return
    }
    
    const { top, bottom, left, right, centerX, centerY } = this._pos
    const { canvasWidth, canvasHeight, shouldRotateStage } = this.screenFix
    let globalX = 0, globalY = 0
    if (typeof top !== 'undefined') {
      if (shouldRotateStage) {
        globalX = canvasHeight - top
      }
      else {
        globalY = top
      }
    }
    else if (typeof bottom !== 'undefined') {
      if (shouldRotateStage) {
        globalX = bottom
      }
      else {
        globalY = canvasHeight - bottom
      }
    }
    else if (typeof centerY !== 'undefined') {
      if (shouldRotateStage) {
        globalX = (canvasHeight / 2) - centerY
      }
      else {
        globalY = (canvasHeight / 2) + centerY
      }
    }

    if (typeof left !== 'undefined') {
      if (shouldRotateStage) {
        globalY = left
      }
      else {
        globalX = left
      }
    }
    else if (typeof right !== 'undefined') {
      if (shouldRotateStage) {
        globalY = canvasWidth - right
      }
      else {
        globalX = canvasWidth - right
      }
    }
    else if (typeof centerX !== 'undefined') {
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
  }

  onRemoved () {
    super.onRemoved()
    this.screenFix.removeRelativeContainer(this)
  }
}
