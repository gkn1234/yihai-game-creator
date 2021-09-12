/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-05 23:05:32
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-10 12:11:40
 * @Description: 
 */
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      copyDtsFiles: false
    })
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'YhGameModules',
      fileName: 'yhgame-modules'
    },
    minify: false,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      // 不需要打包进来的内容
      external: [
        'pixi.js',
        '@yhgame/core'
      ],
      output: {
        // 所有external排除打包的模块，要在globals中声明变量名称
        globals: {
          'pixi.js': 'PIXI',
          '@yhgame/core': 'YhGameCore'
        }
      }
    }
  }
})