/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-15 22:09:16
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-22 11:41:28
 * @Description: 游戏舞台
 */
import { Container } from './pixiNodeExtend'

export class Stage extends Container {
  constructor () {
    super()
  }

  /** 舞台上有节点添加 */
  onAdded (node: Container, addTo: Container) {
    // 从被添加的节点开始，向下深入
    node.deepTrave((n: Container) => {
      // 记录舞台节点
      n.Stage = this
      // 开启脚本
      n.$enableScript(true)
    })
  }
  /** 舞台上有节点移除 */
  onRemoved (node: Container, removeFrom: Container) {
    // 从被删除的节点开始，向下深入
    node.deepTrave((n: Container) => {
      // 取消记录舞台节点
      n.Stage = null
      // 由于移出了舞台，禁止脚本
      n.$enableScript(false)
    })
  }
}
