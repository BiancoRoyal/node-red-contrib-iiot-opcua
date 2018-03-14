/**
 The BSD 3-Clause License

 Copyright 2018 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {discovery: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.discovery
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {discovery: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.discovery.core = de.biancoroyal.opcua.iiot.core.discovery.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.discovery.internalDebugLog = de.biancoroyal.opcua.iiot.core.discovery.internalDebugLog || require('debug')('opcuaIIoT:discovery') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.discovery.detailDebugLog = de.biancoroyal.opcua.iiot.core.discovery.detailDebugLog || require('debug')('opcuaIIoT:discovery:details') // eslint-disable-line no-use-before-define

module.exports = de.biancoroyal.opcua.iiot.core.discovery
