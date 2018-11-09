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

  function OPCUAIIoTNode (config) {
    RED.nodes.createNode(this, config)
    this.nodeId = config.nodeId
    this.datatype = config.datatype
    this.value = config.value
    this.topic = config.topic
    this.name = config.name
    this.injectType = config.injectType
    this.showErrors = config.showErrors

    let node = this
    node.bianco = core.createBiancoIIoT()
    core.assert(node.bianco.iiot)
    node.bianco.iiot.subscribed = false

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.on('input', function (msg) {
      msg.nodetype = 'node'
      msg.injectType = msg.injectType || node.injectType
      node.bianco.iiot.subscribed = !node.bianco.iiot.subscribed

      if (node.injectType === 'listen') {
        if (node.bianco.iiot.subscribed) {
          node.status({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          node.status({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        node.status({fill: 'blue', shape: 'dot', text: 'injected'})
      }

      msg.topic = msg.topic || node.topic
      msg.addressSpaceItems = msg.addressSpaceItems || [] // eslint-disable-line

      if (node.injectType === 'write') {
        msg.valuesToWrite = msg.valuesToWrite || [] // eslint-disable-line
        msg.addressSpaceItems.push({name: node.name, nodeId: node.nodeId, datatypeName: node.datatype})

        try {
          msg.valuesToWrite.push(core.convertDataValueByDataType({value: msg.payload || node.value}, node.datatype))
        } catch (err) {
          core.internalDebugLog(err)
          if (node.showErrors) {
            node.error(err, msg)
          }
        }
      } else {
        msg.addressSpaceItems.push({name: node.name, nodeId: node.nodeId, datatypeName: node.datatype})
      }

      core.internalDebugLog('node msg stringified: ' + JSON.stringify(msg))
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Node', OPCUAIIoTNode)
}
