/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
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
de.biancoroyal.opcua.iiot.core.listener.internalDebugLog = de.biancoroyal.opcua.iiot.core.listener.internalDebugLog || require('debug')('opcuaIIoT:listener') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog = de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog || require('debug')('opcuaIIoT:listener:subscribe') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.eventDebugLog = de.biancoroyal.opcua.iiot.core.listener.eventDebugLog || require('debug')('opcuaIIoT:listener:event') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_INTERVAL = 250 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MAX_LISTENER_INTERVAL = 3600000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_QUEUE_SIZE = 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_INTERVAL = 250 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_QUEUE_SIZE = 10000 // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.listener.getEventSubscribtionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 60,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 4,
    publishingEnabled: true,
    priority: 1
  }
}

de.biancoroyal.opcua.iiot.core.listener.getSubscriptionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 1000,
    requestedMaxKeepAliveCount: 12,
    maxNotificationsPerPublish: 10,
    publishingEnabled: true,
    priority: 10
  }
}

de.biancoroyal.opcua.iiot.core.listener.collectAlarmFields = function (field, key, value) {
  let eventInformation = {}

  switch (field) {
    // Common fields
    case 'EventId':
      eventInformation.EventId = value
      break
    case 'EventType':
      eventInformation.EventType = value
      break
    case 'SourceNode':
      eventInformation.SourceNode = value
      break
    case 'SourceName':
      eventInformation.SourceName = value
      break
    case 'Time':
      eventInformation.Time = value
      break
    case 'ReceiveTime':
      eventInformation.ReceiveTime = value
      break
    case 'Message':
      eventInformation.Message = value.text
      break
    case 'Severity':
      eventInformation.Severity = value
      break

    // ConditionType
    case 'ConditionClassId':
      eventInformation.ConditionClassId = value
      break
    case 'ConditionClassName':
      eventInformation.ConditionClassNameName = value
      break
    case 'ConditionName':
      eventInformation.ConditionName = value
      break
    case 'BranchId':
      eventInformation.BranchId = value
      break
    case 'Retain':
      eventInformation.Retain = value
      break
    case 'EnabledState':
      eventInformation.EnabledState = value.text
      break
    case 'Quality':
      eventInformation.Quality = value
      break
    case 'LastSeverity':
      eventInformation.LastSeverity = value
      break
    case 'Comment':
      eventInformation.Comment = value.text
      break
    case 'ClientUserId':
      eventInformation.ClientUserId = value
      break

    // AcknowledgeConditionType
    case 'AckedState':
      eventInformation.AckedState = value.text
      break
    case 'ConfirmedState':
      eventInformation.ConfirmedState = value.text
      break

    // AlarmConditionType
    case 'ActiveState':
      eventInformation.ActiveState = value.text
      break
    case 'InputNode':
      eventInformation.InputNode = value
      break
    case 'SupressedState':
      eventInformation.SupressedState = value.text
      break

    // Limits
    case 'HighHighLimit':
      eventInformation.HighHighLimit = value
      break
    case 'HighLimit':
      eventInformation.HighLimit = value
      break
    case 'LowLimit':
      eventInformation.LowLimit = value
      break
    case 'LowLowLimit':
      eventInformation.LowLowLimit = value
      break
    case 'Value':
      eventInformation.Value = value
      break
    default:
      eventInformation = 'Unknown Collected Alarm Field ' + field
      break
  }

  return eventInformation
}

de.biancoroyal.opcua.iiot.core.listener.getBasicEventFields = function () {
  return [
    'EventId',
    'ConditionName',
    'ConditionClassName',
    'ConditionClassId',
    'SourceName',
    'SourceNode',
    'BranchId',
    'EventType',
    'ReceiveTime',
    'Severity',
    'Message',
    'Retain',
    'Comment',
    'Comment.SourceTimestamp',
    'EnabledState',
    'EnabledState.Id',
    'EnabledState.EffectiveDisplayName',
    'EnabledState.TransitionTime',
    'LastSeverity',
    'LastSeverity.SourceTimestamp',
    'Quality',
    'Quality.SourceTimestamp',
    'Time',
    'ClientUserId',
    'AckedState',
    'AckedState.Id',
    'ConfirmedState',
    'ConfirmedState.Id',
    'LimitState',
    'LimitState.Id',
    'ActiveState',
    'ActiveState.Id'
  ]
}

de.biancoroyal.opcua.iiot.core.listener.getConditionEventFields = function () {
  return [
    'ConditionName',
    'ConditionType',
    'ConditionClassId',
    'ConditionClassName',
    'ConditionVariableType',
    'Message',
    'SourceName',
    'SourceNode',
    'BranchId',
    'EventType',
    'ReceiveTime'
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

  if (typeof msg.payload.interval === 'number' && msg.payload.interval < this.MAX_LISTENER_INTERVAL) {
    interval = parseInt(msg.payload.interval)
  } else {
    interval = this.SUBSCRIBE_DEFAULT_INTERVAL
  }

  if (msg.payload.queueSize && typeof msg.payload.queueSize === 'number') {
    queueSize = parseInt(msg.payload.queueSize)
  } else {
    queueSize = this.SUBSCRIBE_DEFAULT_QUEUE_SIZE
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

  if (typeof msg.payload.interval === 'number' && msg.payload.interval < this.MAX_LISTENER_INTERVAL) {
    interval = parseInt(msg.payload.interval)
  } else {
    interval = this.EVENT_DEFAULT_INTERVAL
  }

  if (typeof msg.payload.queueSize === 'number') {
    queueSize = parseInt(msg.payload.queueSize)
  } else {
    queueSize = this.EVENT_DEFAULT_QUEUE_SIZE
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
      filter: msg.payload.eventFilter
    },
    this.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
    handleErrorCallback
  )
}

de.biancoroyal.opcua.iiot.core.listener.getAllEventTypes = function (session, callback) {
  let entries = []
  let makeNodeId = this.core.nodeOPCUA.makeNodeId
  let ObjectTypeIds = this.core.nodeOPCUA.ObjectTypeIds

  let browseEventTypes = {
    nodeId: makeNodeId(ObjectTypeIds.BaseEventType),
    referenceTypeId: this.core.nodeOPCUA.resolveNodeId('HasSubtype'),
    browseDirection: this.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
    includeSubtypes: true,
    nodeClassMask: this.core.nodeOPCUA.browse_service.NodeClassMask.ObjectType,
    resultMask: 63 // All ResultMask_Schema
  }

  let nodesToBrowse = [browseEventTypes]

  session.browse(nodesToBrowse, function (err, results, diagnostics) {
    if (err) { callback(err) }
    results[0].references.forEach(function (reference) {
      entries.push({displayName: reference.displayName.text, nodeId: reference.nodeId, reference: reference})
    })

    callback(null, entries, diagnostics)
  })
}

de.biancoroyal.opcua.iiot.core.listener.analyzeEvent = function (session, browseForBrowseName, eventFields, response) {
  let core = de.biancoroyal.opcua.iiot.core.listener.core
  let coreListener = de.biancoroyal.opcua.iiot.core.listener
  let eventFieldMessage = {payload: {eventFields: eventFields, response: response}}
  let msg = {payload: []}

  return new Promise(
    function (resolve, reject) {
      if (!response) {
        reject(new Error('Event Response Not Valid'))
      } else {
        let index = 0
        let eventInformation

        response.forEach(function (variant) {
          coreListener.eventDebugLog('Event Information Variant: ' + JSON.stringify(variant))

          if (variant.dataType !== core.nodeOPCUA.DataType.Null) {
            eventInformation = coreListener.collectAlarmFields(eventFields[index], variant.dataType.key.toString(), variant.value)

            if (variant.dataType === core.nodeOPCUA.DataType.NodeId) {
              browseForBrowseName(session, variant.value, function (err, browseName) {
                if (err) {
                  coreListener.eventDebugLog(err)
                }
                eventInformation.browseName = browseName
                msg.payload.push(eventInformation)
              })
            } else {
              msg.payload.push(eventInformation)
            }
          }
        })

        index++
      }

      resolve(msg, eventFieldMessage)
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.listener
