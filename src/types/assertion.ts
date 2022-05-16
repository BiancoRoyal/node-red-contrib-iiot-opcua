export const isNotDefined = (object: any): object is undefined => {
  return typeof object === 'undefined' || object === null;
}

export const isArray = <T>(object: any): object is Array<T> => {
  return Array.isArray(object)
}
