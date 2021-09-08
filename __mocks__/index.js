/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-07 16:04:15
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-07 16:38:24
 * @Description: 模拟WEBGL环境
 */
const { WebGLRenderingContext, Image } = require('./GL')
const Path2D = require('jest-canvas-mock/lib/classes/Path2D').default
const CanvasGradient = require('jest-canvas-mock/lib/classes/CanvasGradient').default
const CanvasPattern = require('jest-canvas-mock/lib/classes/CanvasPattern').default
const CanvasRenderingContext2D = require('jest-canvas-mock/lib/classes/CanvasRenderingContext2D').default
const DOMMatrix = require('jest-canvas-mock/lib/classes/DOMMatrix').default
const ImageData = require('jest-canvas-mock/lib/classes/ImageData').default
const TextMetrics = require('jest-canvas-mock/lib/classes/TextMetrics').default
const ImageBitmap = require('jest-canvas-mock/lib/classes/ImageBitmap').default
const mockPrototype = require('./prototype')
const createImageBitmap = require('jest-canvas-mock/lib/mock/createImageBitmap').default

function mockWindow (win) {
  const d = win.document
  const f = win.document.createElement

  // jsdom@11.6.2 || jest@^22.0.0, console.error in Function getContext();
  // https://github.com/jsdom/jsdom/blob/4c7698f760fc64f20b2a0ddff450eddbdd193176/lib/jsdom/living/nodes/HTMLCanvasElement-impl.js#L55-L58
  // cosole.error will make ci error.
  // try {
  //   // get the context 2d.
  //   const ctx = d.createElement('canvas').getContext('2d');
  //
  //   // if canvas and context2d all exist, means mock is not needed.
  //   if (ctx) {
  //     console.warn('Context 2d of canvas is exist! No need to mock');
  //     return win;
  //   }
  // } catch (_) {
  //   // catch the throw `Error: Not implemented: HTMLCanvasElement.prototype.getContext`
  //   // https://github.com/jsdom/jsdom/blob/4c7698f760fc64f20b2a0ddff450eddbdd193176/lib/jsdom/living/nodes/HTMLCanvasElement-impl.js
  //   // when throw error, means mock is needed.
  //   // code continue
  // }
  // if ctx not exist, mock it.
  // just mock canvas creator.
  /*
  win.document.createElement = param => param.toString().toLowerCase() === 'canvas'
    ? createCanvas('canvas')
    : f.call(d, param);
  */
  // if not exist, then mock it.
  if (!win.Path2D) win.Path2D = Path2D
  if (!win.CanvasGradient) win.CanvasGradient = CanvasGradient
  if (!win.CanvasPattern) win.CanvasPattern = CanvasPattern
  if (!win.CanvasRenderingContext2D) {
    win.CanvasRenderingContext2D = CanvasRenderingContext2D
  }
  if (!win.DOMMatrix) win.DOMMatrix = DOMMatrix
  if (!win.ImageData) win.ImageData = ImageData
  if (!win.TextMetrics) win.TextMetrics = TextMetrics
  if (!win.ImageBitmap) win.ImageBitmap = ImageBitmap
  if (!win.createImageBitmap) win.createImageBitmap = createImageBitmap

  if (!win.Image) win.Image = Image;
  if (!win.HTMLImageElement) win.HTMLImageElement = Image;
  if (!win.HTMLVideoElement) win.HTMLVideoElement = Image;

  // WebGL 1.0
  if (!win.WebGLRenderingContext) win.WebGLRenderingContext = WebGLRenderingContext
  if (!win.WebGLActiveInfo) win.WebGLActiveInfo = function() {}
  if (!win.WebGLBuffer) win.WebGLBuffer = function() {}
  if (!win.WebGLContextEvent) win.WebGLContextEvent = function() {}
  if (!win.WebGLFramebuffer) win.WebGLFramebuffer = function() {}
  if (!win.WebGLProgram) win.WebGLProgram = function() {}
  if (!win.WebGLQuery) win.WebGLQuery = function() {}
  if (!win.WebGLRenderbuffer) win.WebGLRenderbuffer = function() {}
  if (!win.WebGLShader) win.WebGLShader = function() {}
  if (!win.WebGLShaderPrecisionFormat) win.WebGLShaderPrecisionFormat = function() {}
  if (!win.WebGLTexture) win.WebGLTexture = function() {}
  if (!win.WebGLUniformLocation) win.WebGLUniformLocation = function() {}

  mockPrototype()

  return win
}

// mock global window
// TODO: Force coverage to ignore this branch
if (typeof window !== 'undefined') {
  global.window = mockWindow(window)
}

module.exports.ver = '__VERSION__'