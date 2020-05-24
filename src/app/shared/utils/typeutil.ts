/**
 * 判断是否为字符串
 * @param str
 */
export function isString(str: any): str is string {
  return typeof(str) === 'string';
}

/**
 * 转换为10进制数字.对不能被转换者均会返回NaN
 * @param num
 */
export function toIntTen(num: any): number {
  if(!num) {
    return NaN;
  }
  if(typeof(num) == 'number') {
    return num;
  }
  if(typeof(num) == 'string') {
    return parseInt(num, 10);
  }
  return NaN;
}