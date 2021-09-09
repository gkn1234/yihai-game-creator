/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 13:53:33
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 20:44:57
 * @Description: 为PIXI节点赋予脚本功能
 */
import { Container } from './pixiNode'

import {
  Graphics,
  Sprite,
  TilingSprite,
  AnimatedSprite,
  Text,
  BitmapText,
  Mesh,
  SimpleMesh,
  NineSlicePlane,
  SimplePlane,
  SimpleRope
} from 'pixi.js'

import { game, Game } from '../Game'
import { enableScript, Scriptable } from '../script/enableScript'

declare module './pixiNode' {
  interface Container extends Scriptable {
    get Game (): Game
  }
}

game(Container)
enableScript(Container)

export {
  Container,
  Graphics,
  Sprite,
  TilingSprite,
  AnimatedSprite,
  Text,
  BitmapText,
  Mesh,
  SimpleMesh,
  NineSlicePlane,
  SimplePlane,
  SimpleRope
}