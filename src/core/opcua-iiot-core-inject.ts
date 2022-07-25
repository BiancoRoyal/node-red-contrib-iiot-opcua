/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import debug from 'debug';

const internalDebugLog = debug('opcuaIIoT:inject') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:inject:details') // eslint-disable-line no-use-before-define

const coreInject = {
  internalDebugLog,
  detailDebugLog
}

export default coreInject
