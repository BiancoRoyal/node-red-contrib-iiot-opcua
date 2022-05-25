/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */


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
