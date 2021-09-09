/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 15:57:47
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-05 16:15:10
 * @Description: 
 */
import { defineConfig } from 'vite'
const path = require('path')

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@yhgame\/(.*)/, replacement: path.join(__dirname, '../$1/src/index.ts') },
    ]
  }
})