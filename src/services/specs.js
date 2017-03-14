/**
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

/**
 * OPC UA specifications list provider node.
 * @module OPCUAIIoTSpecs
 *
 * @param RED
 */
module.exports = function (RED) {
  function OPCUAIIoTSpecs (config) {
    RED.nodes.createNode(this, config)
  }

  RED.nodes.registerType('OPCUA-IIoT-Specs', OPCUAIIoTSpecs)

  RED.httpAdmin.get('/services/specs', RED.auth.needsPermission('services.specs.read'), function (req, res) {
    ['A', 'B', 'C'](function (err, specs) {
      if (err) console.log(err)
      res.json(specs)
    })
  })
}
