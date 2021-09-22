/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 19:09:46
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:41:24
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

  /** 场景中有节点添加 */
  onAdded (node: Container, addTo: Container) {
    // 从被添加的节点开始，向下深入
    node.deepTrave((n: Container) => {
      // 记录场景节点
      n.Scene = this
    })
  }
  /** 场景中有节点移除 */
  onRemoved (node: Container, removeFrom: Container) {
    // 从被删除的节点开始，向下深入
    node.deepTrave((n: Container) => {
      // 取消记录场景节点
      n.Scene = null
    })
  }
}