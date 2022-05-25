/**
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright 2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import debug from 'debug'

const internalDebugLog = debug('opcuaIIoT:discovery') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:discovery:details') // eslint-disable-line no-use-before-define
const DEFAULT_OPCUA_DISCOVERY_PORT = 4840 // eslint-disable-line no-use-before-define

const coreDiscovery = {
  internalDebugLog,
  detailDebugLog,
  DEFAULT_OPCUA_DISCOVERY_PORT,
}

export default coreDiscovery
