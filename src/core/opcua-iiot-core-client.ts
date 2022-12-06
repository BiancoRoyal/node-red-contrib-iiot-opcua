/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED


import {TodoTypeAny} from "../types/placeholders";

import debug from "debug";
import {ClientSession, ClientSessionWriteService, DataValue, NodeAttributes, StatusCode, StatusCodes} from "node-opcua";
import {ReadValueIdOptions} from "node-opcua-service-read";
import {WriteValueOptions} from "node-opcua-service-write";
import {WriteResult} from "../opcua-iiot-write";
import {ClientSessionReadHistoryService, ClientSessionReadService} from "node-opcua-client/source/client_session";
import {HistoryReadResult} from "node-opcua-service-history";
import {AddressSpaceItem} from "../types/helpers";
import {NodeIdLike} from "node-opcua-nodeid";

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

const write = (session: ClientSessionWriteService, nodesToWrite: WriteValueOptions[], originMsg: TodoTypeAny): Promise<WriteResult> => {
  return new Promise(
    (resolve, reject) => {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.write(nodesToWrite, (err: Error | null, statusCodes?: StatusCode[]) => {
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
        reject(new Error('ClientSessionWriteService Not Valid To Write'))
      }
    }
  )
}

const read = function (session: ClientSessionReadService, nodesToRead: ReadValueIdOptions[], maxAge: number, msg: TodoTypeAny) {
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
        reject(new Error('ClientSessionReadService Not Valid To Read'))
      }
    }
  )
}

const readVariableValue = function (session: ClientSessionReadService, nodesToRead: TodoTypeAny, originMsg: TodoTypeAny) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.read(nodesToRead, function (err: Error | null, dataValues?: DataValue[]) {
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
        reject(new Error('ClientSessionReadService Not Valid To Read Variable Value'))
      }
    }
  )
}

const readHistoryValue = function (session: ClientSessionReadHistoryService, nodesToRead: TodoTypeAny, startDate: TodoTypeAny, endDate: TodoTypeAny, originMsg: TodoTypeAny) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        session.readHistoryValue(nodesToRead, startDate, endDate, function (err: Error | null, results?: HistoryReadResult[]) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results,
              nodesToRead,
              startDate,
              endDate,
              msg
            })
          }
        })
      } else {
        reject(new Error('ClientSessionReadHistoryService Not Valid To Read History Value'))
      }
    }
  )
}

const readAllAttributes = function (session: ClientSession, nodesToRead: TodoTypeAny[], originMsg: TodoTypeAny) {
  return new Promise(
    function (resolve, reject) {
      if (session) {
        let msg = Object.assign({}, originMsg)
        const nodeIdStrings = nodesToRead.map( (item: TodoTypeAny | string) => item.nodeId || item )
        // @ts-ignore see ClientSessionImpl
        session.readAllAttributes(nodeIdStrings, function (err: Error | null, data?: NodeAttributes[]) {
          if (err) {
            reject(err)
          } else {
            resolve({
              results: data,
              nodesToRead,
              msg
            })
          }
        })
      } else {
        reject(new Error('ClientSessionReadService Not Valid To Read All Attributes'))
      }
    }
  )
}

const stringifyFormatted = function (dataValues: TodoTypeAny) {
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
