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
 * @type {{biancoroyal: {opcua: {iiot: {core: {server: {isa95: {}}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.server.isa95
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {server: {isa95: {}}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.server.core = de.biancoroyal.opcua.iiot.core.server.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define

module.exports = de.biancoroyal.opcua.iiot.core.server.isa95
