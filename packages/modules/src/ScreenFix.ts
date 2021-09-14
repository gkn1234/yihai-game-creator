/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-08 13:46:57
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 16:22:25
 * @Description: 屏幕适配模块
 */
import { 
  GameModule, 
  RelativeContainer,
  lifecycle,
  ScreenFix as IScreenFix
} from '@yhgame/core'
import { Renderer, AbstractRenderer } from 'pixi.js'

/** 屏幕适配参数 */
export type ScreenStretch = 'none' | 'exactfit' | 'horizontal' | 'vertical'
export type ScreenDirection = 'none' | 'horizontal' | 'vertical'
export type ScreenAlign = 'center' | 'start' | 'end'
/** 屏幕适配设置接口 */
export interface ScreenFixOption {
  stretch: ScreenStretch,
  direction: ScreenDirection,
  alignX: ScreenAlign,
  alignY: ScreenAlign
}

export enum ScreenFixLifecycle {
  onScreenResize = 'onScreenResize'
}

@lifecycle(ScreenFixLifecycle.onScreenResize, '屏幕尺寸发生改变时触发')
export class ScreenFix extends GameModule implements IScreenFix {
  /** 画布 */
  private _renderer: Renderer | AbstractRenderer
  /** 配置项 */
  private _options: ScreenFixOption
  /** 相对布局容器 */
  private _relativeContainers: Set<RelativeContainer> = new Set()

  /** 屏幕宽 */
  get screenWidth (): number { return self.innerWidth }
  /** 屏幕高 */
  get screenHeight (): number { return self.innerHeight }

  /** 屏幕宽度是否更长 */
  get isWidthLonger (): boolean { return this.screenWidth >= this.screenHeight }
  /** 是否需要旋转舞台，在horizontal模式下，屏幕宽小于高，或者在vertical模式下，屏幕高小于宽 */
  get shouldRotateStage (): boolean {
    return (this._options.direction === 'horizontal' && !this.isWidthLonger) ||
      (this._options.direction === 'vertical' && this.isWidthLonger)
  }

  /** 画布宽，规定为画布水平方向长度 */
  get canvasWidth (): number {
    const { direction } = this._options
    if (direction === 'vertical') { return this.isWidthLonger ? this.screenHeight : this.screenWidth }
    else if (direction === 'horizontal') { return this.isWidthLonger ? this.screenWidth : this.screenHeight }
    return this.screenWidth
  }
  /** 画布高，规定为画布竖直方向长度 */
  get canvasHeight (): number {
    const { direction } = this._options
    if (direction === 'vertical') { return this.isWidthLonger ? this.screenWidth : this.screenHeight }
    else if (direction === 'horizontal') { return this.isWidthLonger ? this.screenHeight : this.screenWidth }
    return this.screenHeight
  }

  /** 舞台宽，方向规定同画布，与设计宽、场景宽等效 */
  get stageWidth (): number { return this.Game.options.width }
  /** 舞台高，方向规定同画布，与设计高、场景高等效 */
  get stageHeight (): number { return this.Game.options.height }

  /**
   * 屏幕适配初始化参数说明：
   * 
   * 屏幕适配模式的第一个维度：拉伸。决定游戏舞台按照何种规则拉伸
   * none - 舞台严格按照设计尺寸，不进行任何拉伸
   * exactfit - 舞台完全无视设计尺寸的比例，强行拉伸满画布
   * horizontal - 舞台在保证设计尺寸比例的前提下，占满画布的水平方向
   * vertical - 舞台在保证设计尺寸比例的前提下，占满画布的垂直方向
   * 
   * 屏幕适配模式的第二个维度：方向。决定游戏舞台的水平方向，通俗地说就是横竖屏
   * none - 游戏画布方向与屏幕方向一致，无论横竖屏，水平方向对应屏幕宽，竖直方向对应屏幕高。
   * horizontal - 游戏画布的水平方向与屏幕长、宽较长的一方一致。
   * vertical - 游戏画布的水平方向与屏幕长、宽较短的一方一致。
   * 
   * 屏幕适配模式的第三个维度；对齐方式。水平，竖直方向的居中、居左、居右
   * center - 游戏舞台在画布的水平(竖直)方向居中
   * left - 游戏舞台在画布的水平(竖直)方向居左
   * right - 游戏舞台在画布的水平(竖直)方向居右
   * 
   * @param stretch 拉伸。
   * @param direction 舞台方向。
   * @param alignX 水平方向对齐方式。
   * @param alignY 竖直方向对齐方式。
   */
  constructor (
    stretch: ScreenStretch = 'none', 
    direction: ScreenDirection = 'none',
    alignX: ScreenAlign = 'center',
    alignY: ScreenAlign = 'center'
  ) {
    super()

    // 记录适配配置
    this._options = { stretch, direction, alignX, alignY }

    // 画布永远顶满屏幕，监听画布的尺寸变化
    this._renderer = this.Game.Renderer
    this._rendererListen()
  }

  // 监听画布尺寸变化
  private _rendererListen () {
    this._renderer.off('resize', this._resizeHandler, this)
    this._renderer.on('resize', this._resizeHandler, this)
    // 立即执行一次
    this._resizeHandler()
  }

  // 画布尺寸变化回调
  private _resizeHandler () {
    console.log('resize')
    this._resizeStage()
    this._renderRelativeContainers()

    // 向上向下都触发事件
    this.$trigger(ScreenFixLifecycle.onScreenResize)
    this.Game.$trigger(ScreenFixLifecycle.onScreenResize)
  }

  // 调整舞台位置
  private _resizeStage () {
    const { direction, stretch, alignX, alignY } = this._options
    let posX = 0, posY = 0
    let rotation = 0
    let scaleX = 1, scaleY = 1

    // 先处理旋转以及旋转后的平移
    if (this.shouldRotateStage) {
      if (direction === 'horizontal') {
        rotation = Math.PI / 2
        posX += this.canvasHeight
      }
      else if (direction === 'vertical') {
        rotation = -Math.PI / 2
        posY += this.canvasWidth
      }
    }

    // 再处理拉伸
    if (stretch === 'exactfit') {
      scaleX = this.canvasWidth / this.stageWidth
      scaleY = this.canvasHeight / this.stageHeight
    }
    else if (stretch === 'horizontal') {
      scaleX = this.canvasWidth / this.stageWidth
      scaleY = scaleX
    }
    if (stretch === 'vertical') {
      scaleY = this.canvasHeight / this.stageHeight
      scaleX = scaleY
    }

    // 最后平移完成排版
    let dHor = 0, dVer = 0
    if (alignX === 'center') { dHor = (this.canvasWidth - this.stageWidth * scaleX) / 2 }
    else if (alignX === 'end') { dHor = this.canvasWidth - this.stageWidth * scaleX }
    if (alignY === 'center') { dVer = (this.canvasHeight - this.stageHeight * scaleY) / 2   }
    else if (alignY === 'end') { dVer = this.canvasHeight - this.stageHeight * scaleY }
    posX += (this.shouldRotateStage ? dVer : dHor)
    posY += (this.shouldRotateStage ? dHor : dVer)

    /*
    console.log(stretch, direction, alignX, alignY)
    console.log(this.stageWidth, this.stageHeight, this.canvasWidth, this.canvasHeight)
    console.log(posX, posY, scaleX, scaleY, rotation)
    */
   
    const stage = this.Game.Stage
    stage.position.set(posX, posY)
    stage.rotation = rotation
    stage.scale.set(scaleX, scaleY)
  }

  // 调整相对容器的位置
  private _renderRelativeContainers () {
    this._relativeContainers.forEach((container: RelativeContainer) => {
      container.updatePosition()
    })
  }
  /** 添加相对容器 */
  addRelativeContainer (container: RelativeContainer) {
    this._relativeContainers.add(container)
  }
  /** 删除相对容器 */
  removeRelativeContainer (container: RelativeContainer) {
    this._relativeContainers.delete(container)
  }
}
