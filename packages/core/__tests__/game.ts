/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:47:46
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 19:02:53
 * @Description: 对Game实例的测试
 */
import { Game, game } from '@yhgame/core'

beforeEach(() => {
  Game.__GameInstance__ = null
})

describe('Game类的构造', () => {
  test('Game类是单例，以第一次创建为准', () => {
    const game1 = new Game({ width: 1000, height: 1000 })
    const game2 = new Game({ width: 100, height: 100 })
    expect(game1).toBe(game2)
    expect(game2.options.width).toBe(1000)
  })
})

describe('Game实例获取装饰器', () => {
  test('装饰类必须在Game实例创建后才能对其引用', () => {
    @game
    class Test {
      Game!: Game
    }

    const test = new Test()
    expect(() => test.Game).toThrowError('You have to create Game instance first!')

    const gameInstance = new Game()
    expect(test.Game).toBe(gameInstance)
  })
})