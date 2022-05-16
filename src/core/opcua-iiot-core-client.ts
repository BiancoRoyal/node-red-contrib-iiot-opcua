/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED


import {Todo} from "../types/placeholders";

import debug from "debug";
import {ClientSession, DataValue, StatusCodes} from "node-opcua";
import {ReadValueIdOptions} from "node-opcua-service-read";
import {WriteValueOptions} from "node-opcua-service-write";
import {WriteResult} from "../opcua-iiot-write";

const internalDebugLog = debug('opcuaIIoT:client') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:client:details') // eslint-disable-line no-use-before-define
const readDebugLog = debug('opcuaIIoT:client:read') // eslint-disable-line no-use-before-define
const readDetailsDebugLog = debug('opcuaIIoT:client:read:details') // eslint-disable-line no-use-before-define
const writeDebugLog = debug('opcuaIIoT:client:write') // eslint-disable-line no-use-before-define
const writeDetailsDebugLog = debug('opcuaIIoT:client:write:details') // eslint-disable-line no-use-before-define


const READ_TYPE = Object.freeze({
  ALL: 0,
  NODE_ID: 1,
  NODE_CLASS: 2,
  BROWSE_NAME: 3,
  DISPLAY_NAME: 4,
  VALUE: 13,
  HISTORY: 130
}) // eslint-disable-line no-use-before-define

const write = (session: ClientSession, nodesToWrite: WriteValueOptions[], originMsg: Todo): Promise<WriteResult> => {
  return new Promise(
    (resolve, reject) => {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.write(nodesToWrite, (err: Error | null, statusCodes?: StatusCodes[]) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              statusCodes,
              nodesToWrite,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Write'))
      }
    }
  )
}

const read = function (session: ClientSession, nodesToRead: ReadValueIdOptions[], maxAge: number, msg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        session.read(nodesToRead, maxAge, function (err: Error | null, dataValues?: DataValue[]) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read'))
      }
    }
  )
}

const readVariableValue = function (session: Todo, nodesToRead: Todo, originMsg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readVariableValue(nodesToRead, function (err: Error, dataValues: Todo) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read Variable Value'))
      }
    }
  )
}

const readHistoryValue = function (session: Todo, nodesToRead: Todo, startDate: Todo, endDate: Todo, originMsg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readHistoryValue(nodesToRead, startDate, endDate, function (err: Error, dataValues: Todo) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              startDate,
              endDate,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read History Value'))
      }
    }
  )
}

const readAllAttributes = function (session: Todo, nodesToRead: Todo, originMsg: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readAllAttributes(nodesToRead, function (err: Error, dataValues: Todo) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: dataValues,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('Session Not Valid To Read All Attributes'))
      }
    }
  )
}

const stringifyFormatted = function (dataValues: Todo) {
  return JSON.stringify(dataValues, null, 2)
}

const coreClient = {
  internalDebugLog,
  detailDebugLog,
  readDebugLog,
  readDetailsDebugLog,
  writeDebugLog,
  writeDetailsDebugLog,

  READ_TYPE,
  write,
  read,
  readVariableValue,
  readHistoryValue,
  readAllAttributes,
  stringifyFormatted,
}

export default coreClient
