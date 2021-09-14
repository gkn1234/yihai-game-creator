/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-09 20:30:43
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-13 14:14:30
 * @Description: 场景中的层
 */
import { Container } from './pixiNodeExtend'

export class Layer extends Container {
  constructor () {
    super()
  }

  /** 层与场景原则上位置永远为(0, 0)，禁止修改位置。 */
  set x (val: number) {
    throw new Error('You can not change the position of Layer or Scene!')
  }
  set y (val: number) {
    throw new Error('You can not change the position of Layer or Scene!')
  }
}