/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 19:09:46
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 16:40:07
 * @Description: 场景节点
 */
import { GameModule } from '../GameModule'
import { Layer } from './Layer'
import { Container } from './pixiNodeExtend'

/** 描述场景管理器功能，避免和 modules 包的循环依赖问题，详见 @yhgame/modules/SceneManager 中的具体实现 */
export interface SceneManager extends GameModule {

}

export class Scene extends Layer {
  /** 场景管理器对象 */
  get SceneManager (): SceneManager {
    const module = this.Game.module('SceneManager')
    if (!module) {
      throw new Error('Scene can not work without SceneManager module!')
    }
    return module as SceneManager
  }

  constructor () {
    super()
  }

  /** 场景被加载，主要用于获取参数 */
  onLoad (...args: any[]) {

  }

  /** 场景打开之前的回调，主要用于处理开场动效 */
  onBeforeOpen () {

  }

  /** 为场景中的内容增减场景索引 */
  onChildAdded (triggerNode: Container, child: Container) {
    child.Scene = this
  }
  onChildRemoved (triggerNode: Container, child: Container) {
    child.Scene = null
  }
}