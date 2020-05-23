/**
 * 判断是否为字符串
 * @param str
 */
export function isString(str: any): str is string {
  return typeof(str) === 'string';
}
