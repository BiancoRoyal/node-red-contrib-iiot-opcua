/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {response: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.response
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {response: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.core = de.biancoroyal.opcua.iiot.core.response.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.response.internalDebugLog = de.biancoroyal.opcua.iiot.core.response.internalDebugLog || require('debug')('opcuaIIoT:response') // eslint-disable-line no-use-before-define

module.exports = de.biancoroyal.opcua.iiot.core.response
