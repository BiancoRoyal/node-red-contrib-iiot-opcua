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
 * @type {{biancoroyal: {opcua: {iiot: {core: {client: {listener: {}}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.client.listener
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {listener: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.core = de.biancoroyal.opcua.iiot.core.listener.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.client = de.biancoroyal.opcua.iiot.core.listener.client || require('./opcua-iiot-core-client') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_QUEUE_SIZE = 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_QUEUE_SIZE = 10000 // eslint-disable-line no-use-before-define
/*
 Options defaults node-opcua

 options.requestedPublishingInterval = options.requestedPublishingInterval || 100;
 options.requestedLifetimeCount      = options.requestedLifetimeCount || 60;
 options.requestedMaxKeepAliveCount  = options.requestedMaxKeepAliveCount || 2;
 options.maxNotificationsPerPublish  = options.maxNotificationsPerPublish || 2;
 options.publishingEnabled           = options.publishingEnabled ? true : false;
 options.priority                    = options.priority || 1;
 */

de.biancoroyal.opcua.iiot.core.listener.getEventSubscribtionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 120,
    requestedMaxKeepAliveCount: 3,
    maxNotificationsPerPublish: 4,
    publishingEnabled: true,
    priority: 1
  }
}

de.biancoroyal.opcua.iiot.core.listener.getSubscriptionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 30,
    requestedMaxKeepAliveCount: 3,
    maxNotificationsPerPublish: 10,
    publishingEnabled: true,
    priority: 10
  }
}

de.biancoroyal.opcua.iiot.core.listener.collectAlarmFields = function (field, key, value, msg) {
  switch (field) {
    // Common fields
    case 'EventId':
      msg.EventId = value
      break
    case 'EventType':
      msg.EventType = value
      break
    case 'SourceNode':
      msg.SourceNode = value
      break
    case 'SourceName':
      msg.SourceName = value
      break
    case 'Time':
      msg.Time = value
      break
    case 'ReceiveTime':
      msg.ReceiveTime = value
      break
    case 'Message':
      msg.Message = value.text
      break
    case 'Severity':
      msg.Severity = value
      break

    // ConditionType
    case 'ConditionClassId':
      msg.ConditionClassId = value
      break
    case 'ConditionClassName':
      msg.ConditionClassNameName = value
      break
    case 'ConditionName':
      msg.ConditionName = value
      break
    case 'BranchId':
      msg.BranchId = value
      break
    case 'Retain':
      msg.Retain = value
      break
    case 'EnabledState':
      msg.EnabledState = value.text
      break
    case 'Quality':
      msg.Quality = value
      break
    case 'LastSeverity':
      msg.LastSeverity = value
      break
    case 'Comment':
      msg.Comment = value.text
      break
    case 'ClientUserId':
      msg.ClientUserId = value
      break

    // AcknowledgeConditionType
    case 'AckedState':
      msg.AckedState = value.text
      break
    case 'ConfirmedState':
      msg.ConfirmedState = value.text
      break

    // AlarmConditionType
    case 'ActiveState':
      msg.ActiveState = value.text
      break
    case 'InputNode':
      msg.InputNode = value
      break
    case 'SupressedState':
      msg.SupressedState = value.text
      break

    // Limits
    case 'HighHighLimit':
      msg.HighHighLimit = value
      break
    case 'HighLimit':
      msg.HighLimit = value
      break
    case 'LowLimit':
      msg.LowLimit = value
      break
    case 'LowLowLimit':
      msg.LowLowLimit = value
      break
    case 'Value':
      msg.Value = value
      break
    default:
      msg.error = 'unknown collected Alarm field ' + field
      break
  }

  return msg
}

de.biancoroyal.opcua.iiot.core.listener.getBasicEventFields = function () {
  return [
    // Common fields
    'EventId',
    'EventType',
    'SourceNode',
    'SourceName',
    'Time',
    'ReceiveTime',
    'Message',
    'Severity',

    // ConditionType
    'ConditionClassId',
    'ConditionClassName',
    'ConditionName',
    'BranchId',
    'Retain',
    'EnabledState',
    'Quality',
    'LastSeverity',
    'Comment',
    'ClientUserId',

    // AcknowledgeConditionType
    'AckedState',
    'ConfirmedState',

    // AlarmConditionType
    'ActiveState',
    'InputNode',
    'SuppressedState',

    'HighLimit',
    'LowLimit',
    'HighHighLimit',
    'LowLowLimit',

    'Value'
  ]
}

de.biancoroyal.opcua.iiot.core.listener.MonitoredItemSet = function () {
  let Set = require('collections/set')
  return new Set(null, function (a, b) {
    return a.topicName === b.topicName
  }, function (object) {
    return object.topicName
  })
}

de.biancoroyal.opcua.iiot.core.listener.buildNewMonitoredItem = function (msg, subscription, handleErrorCallback) {
  let interval
  let queueSize

  if (typeof msg.payload === 'number') {
    interval = parseInt(msg.payload)
  } else {
    interval = 100
  }

  if (typeof msg.queueSize === 'number') {
    queueSize = parseInt(msg.queueSize)
  } else {
    queueSize = 1
  }

  return subscription.monitor(
    {
      nodeId: this.core.nodeOPCUA.resolveNodeId(msg.topic),
      attributeId: this.core.nodeOPCUA.AttributeIds.Value
    },
    {
      samplingInterval: interval,
      discardOldest: true,
      queueSize: queueSize
    },
    this.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
    handleErrorCallback
  )
}

de.biancoroyal.opcua.iiot.core.listener.buildNewEventItem = function (msg, subscription, handleErrorCallback) {
  let interval
  let queueSize

  if (typeof msg.payload === 'number') {
    interval = parseInt(msg.payload)
  } else {
    interval = 100
  }

  if (typeof msg.queueSize === 'number') {
    queueSize = parseInt(msg.queueSize)
  } else {
    queueSize = 1
  }

  return subscription.monitor(
    {
      nodeId: this.core.nodeOPCUA.resolveNodeId(msg.topic),
      attributeId: this.core.nodeOPCUA.AttributeIds.EventNotifier
    },
    {
      samplingInterval: interval,
      discardOldest: true,
      queueSize: queueSize,
      filter: msg.eventFilter
    },
    this.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
    handleErrorCallback
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.listener
