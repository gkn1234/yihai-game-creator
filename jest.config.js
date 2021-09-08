/*
 * @Autor: Guo Kainan
 * @Date: 2021-08-26 15:07:06
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 16:25:11
 * @Description: 单元测试配置文件
 */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./__mocks__/index.js'],
  testEnvironment: 'jsdom',
  coverageDirectory: "__coverage__",
  moduleNameMapper: {
    '^@yhgame/(.*?)$': '<rootDir>/packages/$1/src',
  },
  globals: {
    'ts-jest': {
      // ts-jest额外配置
    }
  }
}