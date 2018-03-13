/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let core = require('./core/opcua-iiot-core')
  let _ = require('underscore')

  function OPCUAIIoTDiscovery (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name

    let node = this

    let discoveryServer = new core.nodeOPCUA.OPCUADiscoveryServer({})
    discoveryServer.start(function (server) {
      node.discoveryServer = server
      core.internalDebugLog('discovery server started')
      node.status({fill: 'green', shape: 'dot', text: 'active'})
    })

    node.status({fill: 'blue', shape: 'ring', text: 'new'})
  }

  RED.nodes.registerType('OPCUA-IIoT-Discovery', OPCUAIIoTDiscovery)
}
