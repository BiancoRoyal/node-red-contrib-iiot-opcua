/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Event Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreListener = require('./core/opcua-iiot-core-listener')
  let _ = require('underscore')

  function OPCUAIIoTEvent (config) {
    RED.nodes.createNode(this, config)
    this.eventRoot = config.eventRoot
    this.eventType = config.eventType
    this.queueSize = config.queueSize
    this.usingListener = config.usingListener
    this.name = config.name

    let node = this
    node.subscribed = false

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    node.on('input', function (msg) {
      node.subscribed = !node.subscribed

      if (node.usingListener) {
        if (node.subscribed) {
          node.status({fill: 'blue', shape: 'dot', text: 'subscribed'})
        } else {
          node.status({fill: 'blue', shape: 'ring', text: 'not subscribed'})
        }
      } else {
        node.status({fill: 'blue', shape: 'dot', text: 'injected'})
      }

      let eventFields
      if (node.eventType.indexOf('Condition') > -1) {
        eventFields = coreListener.getConditionEventFields()
      } else {
        eventFields = coreListener.getBasicEventFields()
      }

      let eventFilter = coreListener.core.nodeOPCUA.constructEventFilter(eventFields)
      let interval = 1000

      if (typeof msg.payload === 'number') {
        interval = msg.payload // msec.
      }

      msg.nodetype = 'events'

      msg.payload = {
        eventType: node.eventType,
        queueSize: node.queueSize,
        eventFilter: eventFilter,
        eventFields: eventFields,
        interval: interval
      }
      node.send(msg)
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Event', OPCUAIIoTEvent)

  RED.httpAdmin.get('/opcuaIIoT/event/types', RED.auth.needsPermission('opcua.event.types'), function (req, res) {
    let objectTypeIds = require('node-opcua').ObjectTypeIds
    let invertedObjectTypeIds = _.invert(objectTypeIds)
    let eventTypes = _.filter(invertedObjectTypeIds, function (objectTypeId) {
      return objectTypeId.indexOf('Event') > -1
    })

    let typelistEntry
    let eventTypesResults = []
    for (typelistEntry of eventTypes) {
      eventTypesResults.push({ nodeId: 'i=' + objectTypeIds[typelistEntry], label: typelistEntry })
    }

    res.json(eventTypesResults)
  })
}
