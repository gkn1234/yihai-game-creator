/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 13:53:03
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-08 15:27:48
 * @Description: 导出PIXI的显示节点
 */
/**
 * @attention 不知道为何必须要在这里导出一层。
 * 但如果直接按照TS文档的方法对 pixi.js 导出的类进行拓展，类会降级为接口。
 * 此问题已经记录，可以查看开发文档issue中的TS部分。
 */
import { Container } from 'pixi.js'
export { Container }