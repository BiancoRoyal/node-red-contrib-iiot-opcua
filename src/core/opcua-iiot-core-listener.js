/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

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
de.biancoroyal.opcua.iiot.core.listener.detailDebugLog = de.biancoroyal.opcua.iiot.core.listener.detailDebugLog || require('debug')('opcuaIIoT:listener:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog = de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog || require('debug')('opcuaIIoT:listener:subscribe') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.subscribeDetailDebugLog = de.biancoroyal.opcua.iiot.core.listener.subscribeDetailDebugLog || require('debug')('opcuaIIoT:listener:subscribe:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.eventDebugLog = de.biancoroyal.opcua.iiot.core.listener.eventDebugLog || require('debug')('opcuaIIoT:listener:event') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.eventDetailDebugLog = de.biancoroyal.opcua.iiot.core.listener.eventDetailDebugLog || require('debug')('opcuaIIoT:listener:event:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_INTERVAL = 1000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MIN_LISTENER_INTERVAL = 100 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MAX_LISTENER_INTERVAL = 3600000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_QUEUE_SIZE = 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_INTERVAL = 250 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_QUEUE_SIZE = 10000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.Stately = de.biancoroyal.opcua.iiot.core.listener.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.listener.createStatelyMachine = function () {
  return de.biancoroyal.opcua.iiot.core.listener.Stately.machine({
    'INIT': {
      'start': 'STARTED',
      'terminate': 'TERMINATED',
      'error': 'ERROR'
    },
    'STARTED': {
      'terminate': 'TERMINATED',
      'error': 'ERROR'
    },
    'TERMINATED': {
      'init': 'INIT',
      'error': 'ERROR',
      'end': 'END'
    },
    'ERROR': {
      'init': 'INIT',
      'end': 'END'
    },
    'END': {}
  })
}

de.biancoroyal.opcua.iiot.core.listener.getEventSubscribtionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 1000 * 60 * 20,
    requestedMaxKeepAliveCount: 120,
    maxNotificationsPerPublish: 200,
    publishingEnabled: true,
    priority: 2
  }
}

de.biancoroyal.opcua.iiot.core.listener.getSubscriptionParameters = function (timeMilliseconds) {
  return {
    requestedPublishingInterval: timeMilliseconds || 200,
    requestedLifetimeCount: 1000 * 60 * 10,
    requestedMaxKeepAliveCount: 60,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
  }
}

de.biancoroyal.opcua.iiot.core.listener.collectAlarmFields = function (field, key, value) {
  let eventInformation = {}

  switch (field) {
    // Common fields
    case 'EventId':
      eventInformation.eventId = value
      break
    case 'EventType':
      eventInformation.eventType = value
      break
    case 'SourceNode':
      eventInformation.sourceNode = value
      break
    case 'SourceName':
      eventInformation.sourceName = value
      break
    case 'Time':
      eventInformation.time = value
      break
    case 'ReceiveTime':
      eventInformation.receiveTime = value
      break
    case 'Message':
      eventInformation.message = value.text
      break
    case 'Severity':
      eventInformation.severity = value
      break

    // ConditionType
    case 'ConditionClassId':
      eventInformation.conditionClassId = value
      break
    case 'ConditionClassName':
      eventInformation.conditionClassName = value
      break
    case 'ConditionName':
      eventInformation.conditionName = value
      break
    case 'BranchId':
      eventInformation.branchId = value
      break
    case 'Retain':
      eventInformation.retain = value
      break
    case 'EnabledState':
      eventInformation.enabledState = value.text
      break
    case 'Quality':
      eventInformation.quality = value
      break
    case 'LastSeverity':
      eventInformation.lastSeverity = value
      break
    case 'Comment':
      eventInformation.comment = value.text
      break
    case 'ClientUserId':
      eventInformation.clientUserId = value
      break

    // AcknowledgeConditionType
    case 'AckedState':
      eventInformation.ackedState = value.text
      break
    case 'ConfirmedState':
      eventInformation.confirmedState = value.text
      break

    // AlarmConditionType
    case 'ActiveState':
      eventInformation.activeState = value.text
      break
    case 'InputNode':
      eventInformation.inputNode = value
      break
    case 'SupressedState':
      eventInformation.supressedState = value.text
      break

    // Limits
    case 'HighHighLimit':
      eventInformation.highHighLimit = value
      break
    case 'HighLimit':
      eventInformation.highLimit = value
      break
    case 'LowLimit':
      eventInformation.lowLimit = value
      break
    case 'LowLowLimit':
      eventInformation.lowLowLimit = value
      break
    case 'Value':
      eventInformation.value = value
      break
    default:
      eventInformation.field = {}
      eventInformation.field.name = field
      eventInformation.field.value = value

      if (value.text) {
        eventInformation.field.value.text = value.text
      }
      break
  }

  return eventInformation
}

de.biancoroyal.opcua.iiot.core.listener.getBasicEventFields = function () {
  return ['EventId', 'SourceName', 'Message', 'ReceiveTime']
}

de.biancoroyal.opcua.iiot.core.listener.getAllEventFields = function () {
  return [
    'ConditionName',
    'ConditionType',
    'ConditionClassId',
    'ConditionClassName',
    'ConditionVariableType',
    'SourceNode',
    'BranchId',
    'EventType',
    'Severity',
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

de.biancoroyal.opcua.iiot.core.listener.getStateFields = function () {
  return [
    'ConditionName',
    'SourceNode',
    'Quality',
    'Time',
    'EnabledState',
    'EnabledState.Id',
    'EnabledState.EffectiveDisplayName',
    'EnabledState.TransitionTime',
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

de.biancoroyal.opcua.iiot.core.listener.getConditionFields = function () {
  return [
    'Time',
    'Quality',
    'BranchId',
    'SourceNode',
    'ConditionName',
    'ConditionType',
    'ConditionClassId',
    'ConditionClassName',
    'ConditionVariableType'
  ]
}

de.biancoroyal.opcua.iiot.core.listener.buildNewMonitoredItem = function (nodeId, msg, subscription) {
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!nodeId) {
        reject(new Error('NodeId Is Not Valid'))
      }

      let interval
      let queueSize

      if (typeof msg.payload.interval === 'number' &&
        msg.payload.interval <= coreListener.MAX_LISTENER_INTERVAL &&
        msg.payload.interval >= coreListener.MIN_LISTENER_INTERVAL) {
        interval = parseInt(msg.payload.interval)
      } else {
        interval = coreListener.SUBSCRIBE_DEFAULT_INTERVAL
      }

      if (msg.payload.queueSize && typeof msg.payload.queueSize === 'number') {
        queueSize = parseInt(msg.payload.queueSize)
      } else {
        queueSize = coreListener.SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      subscription.monitor(
        {
          nodeId: coreListener.core.nodeOPCUA.resolveNodeId(nodeId),
          attributeId: coreListener.core.nodeOPCUA.AttributeIds.Value
        },
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize
        },
        coreListener.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
        function (err, monitoredItemResult) {
          if (err) {
            coreListener.internalDebugLog('subscribing monitored item ' + err)
            reject(err)
          } else {
            resolve({nodeId: nodeId, monitoredItem: monitoredItemResult})
          }
        }
      )
    })
}

de.biancoroyal.opcua.iiot.core.listener.buildNewEventItem = function (nodeId, msg, subscription) {
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!nodeId) {
        reject(new Error('NodeId Is Not Valid'))
      }

      let interval
      let queueSize

      if (typeof msg.payload.interval === 'number' && msg.payload.interval < coreListener.MAX_LISTENER_INTERVAL) {
        interval = parseInt(msg.payload.interval)
      } else {
        interval = coreListener.EVENT_DEFAULT_INTERVAL
      }

      if (typeof msg.payload.queueSize === 'number') {
        queueSize = parseInt(msg.payload.queueSize)
      } else {
        queueSize = coreListener.EVENT_DEFAULT_QUEUE_SIZE
      }

      subscription.monitor(
        {
          nodeId: coreListener.core.nodeOPCUA.resolveNodeId(nodeId),
          attributeId: coreListener.core.nodeOPCUA.AttributeIds.EventNotifier
        },
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize,
          filter: msg.payload.eventFilter
        },
        coreListener.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
        function (err, monitoredItemResult) {
          if (err) {
            coreListener.internalDebugLog('subscribing event item ' + err)
            reject(err)
          } else {
            resolve({ nodeId: nodeId, monitoredItem: monitoredItemResult })
          }
        }
      )
    })
}

de.biancoroyal.opcua.iiot.core.listener.getAllEventTypes = function (session) {
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Session Is Not Valid To Browse For Event Types'))
      }

      let entries = []
      let makeNodeId = this.core.nodeOPCUA.makeNodeId
      let ObjectTypeIds = this.core.nodeOPCUA.ObjectTypeIds

      let browseEventTypes = {
        nodeId: makeNodeId(ObjectTypeIds.BaseEventType),
        referenceTypeId: this.core.nodeOPCUA.resolveNodeId('HasSubtype'),
        browseDirection: this.core.nodeOPCUA.BrowseDirection.Forward,
        includeSubtypes: true,
        nodeClassMask: this.core.nodeOPCUA.NodeClassMask.ObjectType,
        resultMask: 63 // All ResultMask_Schema
      }

      let nodesToBrowse = [browseEventTypes]

      session.browse(nodesToBrowse, function (err, results, diagnostics) {
        if (err) {
          reject(err)
        } else {
          if (results) {
            if (results.length > 0) {
              results[0].references.forEach(function (reference) {
                entries.push({displayName: reference.displayName.text, nodeId: reference.nodeId, reference: reference})
              })
            } else {
              if (results.references) {
                results.references.forEach(function (reference) {
                  entries.push({displayName: reference.displayName.text, nodeId: reference.nodeId, reference: reference})
                })
              }
            }
          }
          resolve(entries)
        }
      })
    })
}

de.biancoroyal.opcua.iiot.core.listener.analyzeEvent = function (session, browseForBrowseName, dataValue) {
  let core = de.biancoroyal.opcua.iiot.core.listener.core
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Session Is Not Valid To Analyze Event'))
      }

      if (!browseForBrowseName || typeof browseForBrowseName !== 'function') {
        reject(new Error('BrowseForBrowseName Is Not Valid Function'))
      }

      if (!dataValue) {
        reject(new Error('Event Response Not Valid'))
      } else {
        let index = 0
        let eventInformation = {}
        let eventResults = []

        dataValue.forEach(function (variant) {
          coreListener.eventDebugLog('variant entry: ' + variant.toString())

          try {
            if (variant.dataType && variant.value) {
              eventInformation = coreListener.collectAlarmFields(dataValue.monitoringParameters.filter.selectClauses[index], variant.dataType.key.toString(), variant.value)

              if (variant.dataType === core.nodeOPCUA.DataType.NodeId) {
                browseForBrowseName(session, variant.value, function (err, browseName) {
                  if (err) {
                    reject(err)
                  } else {
                    eventInformation.browseName = browseName
                    eventResults.push({ eventInformation: eventInformation, eventData: variant.toJSON() })
                  }
                })
              } else {
                eventResults.push({ eventInformation: eventInformation, eventData: variant.toJSON() })
              }
            }
            index++
          } catch (err) {
            eventInformation = {error: err}
            eventResults.push({ eventInformation: eventInformation, eventData: variant.toJSON() })
          }
        })

        resolve(eventResults)
      }
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.listener
