/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-14 16:48:02
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-14 18:27:53
 * @Description: 广播节点的生命周期
 */
import { 
  Container, 
  Script, 
  lifecycle,
  extendModules
} from '@yhgame/core'

/** 节点生命周期 */
export enum NodeLifecycle {
  onNodeAdded = 'onNodeAdded',
  onChildNodeAdded = 'onChildNodeAdded',
  onNodeRemoved = 'onNodeRemoved',
  onChildNodeRemoved = 'onChildNodeRemoved'
}

@lifecycle(NodeLifecycle.onNodeAdded, '节点加入容器时触发')
@lifecycle(NodeLifecycle.onChildNodeAdded, '有子节点装入时触发')
@lifecycle(NodeLifecycle.onNodeRemoved, '节点移出父容器时触发')
@lifecycle(NodeLifecycle.onChildNodeRemoved, '有子节点移出时触发')
@extendModules(false)
export class NodeListener extends Script {
  constructor () {
    super()
  }

  get Node (): Container {
    if (!this.nodeInstance || !(this.nodeInstance instanceof Container)) {
      throw new Error('NodeListener script must be mounted on node which extends Container!')
    }
    return this.nodeInstance as Container
  }

  onActive () {
    this.Node.on('added', this._addedHandler, this)
    this.Node.on('childAdded', this._childAddedHandler, this)
    this.Node.on('removed', this._removedHandler, this)
    this.Node.on('childRemoved', this._childRemovedHandler, this)
  }

  onDestroy () {
    // 脚本卸载前也要解除监听事件
    this.Node.off('added', this._addedHandler, this)
    this.Node.off('childAdded', this._childAddedHandler, this)
    this.Node.off('removed', this._removedHandler, this)
    this.Node.off('childRemoved', this._childRemovedHandler, this)
  }

  private _addedHandler (node: Container) {
    this.trigger(NodeLifecycle.onNodeAdded, node)
  }

  private _childAddedHandler (node: Container, container: Container, index: number) {
    this.trigger(NodeLifecycle.onChildNodeAdded, node, container, index)
  }

  private _removedHandler (node: Container) {
    this.trigger(NodeLifecycle.onNodeRemoved, node)
  }

  private _childRemovedHandler (node: Container, container: Container, index: number) {
    this.trigger(NodeLifecycle.onChildNodeRemoved, node, container, index)
  }
}