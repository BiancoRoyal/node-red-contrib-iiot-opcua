/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Address space object Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTCMD (config) {
    RED.nodes.createNode(this, config)
    this.commandtype = config.commandtype
    this.nodeId = config.nodeId
    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      if (msg.nodetype === 'inject') {
        node.nodeId = msg.topic || node.nodeId
      }

      msg = {payload: {}} // clean message
      msg.topic = 'ServerCommand'
      msg.nodetype = 'CMD'
      msg.payload.commandtype = node.commandtype
      msg.payload.nodeId = node.nodeId

      core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-Command', OPCUAIIoTCMD)

  // opcua_node_ids.js - node-opcua

  // ObjectTypeIds, VariableTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/ObjectTypeIds', RED.auth.needsPermission('opcuaIIoT.CMD.read'), function (req, res) {
    res.json(core.nodeOPCUA.ObjectTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/object/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.CMD.read'), function (req, res) {
    res.json(core.nodeOPCUA.VariableTypeIds)
  })

  // ReferenceTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.CMD.read'), function (req, res) {
    res.json(core.nodeOPCUA.ReferenceTypeIds)
  })

  // DataTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.CMD.read'), function (req, res) {
    res.json(core.nodeOPCUA.DataTypeIds)
  })
}
