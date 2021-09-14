/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 19:09:24
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 16:52:48
 * @Description: 场景管理器模块
 */

import { 
  GameModule, 
  Scene,
  SceneManager as ISceneManager
} from '@yhgame/core'


export class SceneManager extends GameModule implements ISceneManager {
  /** 场景缓存 */
  private _sceneCache: Map<string, Scene> = new Map()

  constructor (
    SceneConstructor: typeof Scene,
    sceneId: string | null = null,
    params: any = null,

  ) {
    super()
  }

  /**
   * 加载场景，获取场景实例
   * @param SceneConstructor 场景构造函数
   * @param sceneId 场景对应的管理id，可以从缓存中获取场景
   * @param args 传递给场景的参数
   */
  load (
    SceneConstructor: typeof Scene,
    sceneId: string | null = null,
    ...args: any[]
  ): Scene {
    let sceneInstance: Scene | undefined
    if (!!sceneId) {
      sceneInstance = this._sceneCache.get(sceneId)
    }
    
    if (!sceneInstance) {
      sceneInstance = new SceneConstructor()
    }
    sceneInstance.onLoad(...args)
    sceneInstance.onBeforeOpen()

    return sceneInstance
  }

  open (
    scene: typeof Scene | Scene,

  ) {

  }
}