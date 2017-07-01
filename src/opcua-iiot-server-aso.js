/*
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Address space object Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let core = require('./core/opcua-iiot-core')

  function OPCUAIIoTASO (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.browsename = config.browsename
    this.displayname = config.displayname
    this.objecttype = config.objecttype
    this.referencetype = config.referencetype
    this.referenceNodeId = config.referenceNodeId
    this.datatype = config.datatype
    this.value = config.value
    this.name = config.name

    let node = this

    node.on('input', function (msg) {
      if (msg.nodetype === 'inject') {
        node.nodeId = msg.topic || node.nodeId
        node.datatype = msg.datatype || node.datatype
        node.value = msg.payload || node.value
      }

      msg = {payload: {}} // clean message
      msg.topic = 'ServerAddressSpaceObject'
      msg.nodetype = 'ASO'

      if (node.nodeId.includes('i=') || node.nodeId.includes('s=') || node.nodeId.includes('b=')) {
        msg.payload.nodeId = node.nodeId
        msg.payload.browsename = node.browsename
        msg.payload.displayname = node.displayname
        msg.payload.objecttype = node.objecttype
        msg.payload.datatype = node.datatype
        msg.payload.value = node.value

        msg.payload.referenceNodeId = node.referenceNodeId || core.nodeOPCUA.OBJECTS_ROOT
        msg.payload.referencetype = node.referencetype || core.nodeOPCUA.ReferenceTypeIds.Organizes

        core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
        node.send(msg)
      } else {
        node.error(new Error('ASO NodeId Is Not Valid', msg))
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Server-ASO', OPCUAIIoTASO)

  // opcua_node_ids.js - node-opcua

  // ObjectTypeIds, VariableTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/ObjectTypeIds', RED.auth.needsPermission('opcuaIIoT.ASO.read'), function (req, res) {
    res.json(core.nodeOPCUA.ObjectTypeIds)
  })

  RED.httpAdmin.get('/opcuaIIoT/object/VariableTypeIds', RED.auth.needsPermission('opcuaIIoT.ASO.read'), function (req, res) {
    res.json(core.nodeOPCUA.VariableTypeIds)
  })

  // ReferenceTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/ReferenceTypeIds', RED.auth.needsPermission('opcuaIIoT.ASO.read'), function (req, res) {
    res.json(core.nodeOPCUA.ReferenceTypeIds)
  })

  // DataTypeIds via REST
  RED.httpAdmin.get('/opcuaIIoT/object/DataTypeIds', RED.auth.needsPermission('opcuaIIoT.ASO.read'), function (req, res) {
    res.json(core.nodeOPCUA.DataTypeIds)
  })
}
