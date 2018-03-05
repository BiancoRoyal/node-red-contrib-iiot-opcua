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
  // SOURCE-MAP-REQUIRED
  let coreListener = require('./core/opcua-iiot-core-listener')
  let _ = require('underscore')

  function OPCUAIIoTEvent (config) {
    RED.nodes.createNode(this, config)
    this.eventRoot = config.eventRoot
    this.eventType = config.eventType
    this.queueSize = config.queueSize
    this.usingListener = config.usingListener
    this.name = config.name
    this.parseStrings = config.parseStrings
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

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

      let uaEventFields = null
      if (node.eventType.indexOf('Condition') > -1) {
        uaEventFields = coreListener.getConditionEventFields()
      } else {
        uaEventFields = coreListener.getBasicEventFields()
      }

      let uaEventFilter = coreListener.core.nodeOPCUA.constructEventFilter(uaEventFields)
      let interval = 1000

      if (typeof msg.payload === 'number') {
        interval = msg.payload // msec.
      }

      msg.nodetype = 'events'

      let eventSubscriptionPayload = {
        eventType: msg.payload.eventType || node.eventType,
        eventFilter: msg.payload.uaEventFilter || uaEventFilter,
        eventFields: msg.payload.uaEventFields || uaEventFields,
        queueSize: msg.payload.queueSize || node.queueSize,
        interval: msg.payload.interval || interval
      }

      // TODO: send works but it has a problem with debug node and ByteString
      msg.payload = eventSubscriptionPayload

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
