/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-15 17:52:23
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-15 18:00:02
 * @Description: 数据转换方法
 */
import { isPercentStr } from './dataCheck'

/**
 * @section 数字相关
 */
/**
 * 百分比字符串转数字
 * @param str 百分比串
 * @returns 若百分比串不合法，返回null
 */
export function percentToNum (str: string): number | null {
  if (!isPercentStr(str)) {
    return null
  }
  return Number(str.slice(0, str.length - 1)) / 100
}