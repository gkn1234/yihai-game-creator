/*
 * @Autor: Guo Kainan
 * @Date: 2021-09-15 17:50:51
 * @LastEditors: Guo Kainan
 * @LastEditTime: 2021-09-15 17:56:38
 * @Description: 数据检查方法
 */
/**
 * @section 数字相关
 */
/** 判断数据是否为有限数字 */
export function isNum (data: any): boolean {
  return typeof data === 'number' && !Number.isNaN(data) && data !== Infinity && data !== -Infinity
}

/** 判断字符是否为数字串 */
export function isNumStr (str: string): boolean {
  return isNum(Number(str))
} 

/** 是否为百分比字符串 */
export function isPercentStr (str: string): boolean {
  return str[str.length - 1] === '%' && isNumStr(str.slice(0, str.length - 1))
}
