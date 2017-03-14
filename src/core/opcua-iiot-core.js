/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {}}}}} // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.nodeOPCUA = require('node-opcua')
de.biancoroyal.opcua.iiot.core.internalDebugLog = require('debug')('opcuaIIoT')
de.biancoroyal.opcua.iiot.core.OBJECTS_ROOT = 'ns=0;i=85'

module.exports = de.biancoroyal.opcua.iiot.core
