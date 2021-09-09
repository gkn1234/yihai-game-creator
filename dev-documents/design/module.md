<!--
 * @Autor: Guo Kainan
 * @Date: 2021-09-08 15:53:57
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-08 16:05:22
 * @Description: 
-->
# 模块

# ScreenResize 屏幕适配模块

## 设计参考

参考文章：[LayaAir引擎是如何考虑屏幕适配的](https://ldc2.layabox.com/doc/?language=zh&nav=zh-ts-1-8-0)

提供以下适配模式：
- noscale：默认不缩放，canvas和舞台直接贴在界面中。
- exactfit：强行拉伸全屏模式

## 实现方式
由于我们的画布默认占满屏幕，我们需要通过游戏舞台的相对位置来实现**相对布局**与**屏幕适配**

游戏舞台是实现屏幕适配的核心。

一般我们在设计游戏界面时，会有以下基本属性：
- 设计宽度 `dw`
- 设计高度 `dh`

我们在摆放游戏内容器时，都是按照设计尺寸摆放的。

由于 `PixiJS` 中 `Container` 的相对布局特性，我们只要让 `canvas` 画布永远铺满屏幕，那么无论是横屏竖屏，我们只要修改根节点(即舞台)的相对位置即可。




# SceneManager 场景管理器模块