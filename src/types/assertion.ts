/**
 * Asserts that the object is undefined or null
 */
export const isNotDefined = (object: any): object is undefined => {
  return typeof object === 'undefined' || object === null;
}

/**
 * Asserts that the given object is an array of type <T>.
 */
export const isArray = <T>(object: any): object is Array<T> => {
  return Array.isArray(object)
}
