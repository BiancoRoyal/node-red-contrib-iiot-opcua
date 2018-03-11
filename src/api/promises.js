/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Namespace for promises.
 *
 * @type {{}}
 * @Namespace OPCUAIIoTAPI
 */
var de = de || {biancoroyal: {opcua: {iiot: {api: {}}}}} // eslint-disable-line no-use-before-define

/**
 * Convert function to promise.
 *
 * @param givenFunction - an async function
 * @returns {Function} - converted function
 */
de.biancoroyal.opcua.iiot.api.functionToPromise = function (givenFunction) {
  return function (arg, next) {
    if (next) {
      givenFunction.bind(this)(arg, next)
    } else {
      return new Promise(function (resolve, reject) {
        function cb (err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }

        givenFunction.bind(this)(arg, cb)
      })
    }
  }
}

module.exports = de.biancoroyal.opcua.iiot.api
