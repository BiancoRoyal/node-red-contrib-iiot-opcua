/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018,2019 - Klaus Landsdorf (https://bianco-royal.com/)
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
var de = de || { biancoroyal: { opcua: { iiot: { core: { listener: {} } } } } } // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.core = de.biancoroyal.opcua.iiot.core.listener.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.client = de.biancoroyal.opcua.iiot.core.listener.client || require('./opcua-iiot-core-client') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.internalDebugLog = de.biancoroyal.opcua.iiot.core.listener.internalDebugLog || require('debug')('opcuaIIoT:listener') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.detailDebugLog = de.biancoroyal.opcua.iiot.core.listener.detailDebugLog || require('debug')('opcuaIIoT:listener:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog = de.biancoroyal.opcua.iiot.core.listener.subscribeDebugLog || require('debug')('opcuaIIoT:listener:subscribe') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.subscribeDetailDebugLog = de.biancoroyal.opcua.iiot.core.listener.subscribeDetailDebugLog || require('debug')('opcuaIIoT:listener:subscribe:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.eventDebugLog = de.biancoroyal.opcua.iiot.core.listener.eventDebugLog || require('debug')('opcuaIIoT:listener:event') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.eventDetailDebugLog = de.biancoroyal.opcua.iiot.core.listener.eventDetailDebugLog || require('debug')('opcuaIIoT:listener:event:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_INTERVAL = 1000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MIN_LISTENER_INTERVAL = 0 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MAX_LISTENER_INTERVAL = 3600000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.SUBSCRIBE_DEFAULT_QUEUE_SIZE = 1 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_INTERVAL = 250 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.EVENT_DEFAULT_QUEUE_SIZE = 10000 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.METHOD_TYPE = 'ns=0;i=0' // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.RUNNING_STATE = 'STARTED' // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.MAX_INT32 = 2147483647 // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.listener.Stately = de.biancoroyal.opcua.iiot.core.listener.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.listener.createStatelyMachine = function () {
  return de.biancoroyal.opcua.iiot.core.listener.Stately.machine({
    'IDLE': {
      'requestinitsub': 'REQUESTED',
      'endsub': 'END'
    },
    'REQUESTED': {
      'initsub': 'INIT'
    },
    'INIT': {
      'startsub': 'STARTED',
      'terminatesub': 'TERMINATED',
      'errorsub': 'ERROR'
    },
    'STARTED': {
      'terminatesub': 'TERMINATED',
      'errorsub': 'ERROR'
    },
    'TERMINATED': {
      'idlesub': 'IDLE',
      'errorsub': 'ERROR',
      'endsub': 'END'
    },
    'ERROR': {
      'idlesub': 'IDLE',
      'initsub': 'INIT',
      'endsub': 'END'
    },
    'END': {}
  }, 'IDLE')
}

de.biancoroyal.opcua.iiot.core.listener.getEventSubscribtionParameters = function (timeMilliseconds) {
  timeMilliseconds = timeMilliseconds > de.biancoroyal.opcua.iiot.core.listener.MAX_INT32 ? 100 : timeMilliseconds
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
  timeMilliseconds = timeMilliseconds > de.biancoroyal.opcua.iiot.core.listener.MAX_INT32 ? 200 : timeMilliseconds
  return {
    requestedPublishingInterval: timeMilliseconds || 200,
    requestedLifetimeCount: 1000 * 60 * 10,
    requestedMaxKeepAliveCount: 60,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
  }
}

de.biancoroyal.opcua.iiot.core.listener.collectAlarmFields = function (field, dataType, value) {
  return {
    field,
    dataType,
    value
  }
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

de.biancoroyal.opcua.iiot.core.listener.monitorItems = function (node, msg, uaSubscription) {
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  for (let addressSpaceItem of msg.addressSpaceItems) {
    if (!addressSpaceItem.nodeId) {
      coreListener.subscribeDebugLog('Address Space Item Not Valid to Monitor ' + addressSpaceItem)
      return
    }

    if (addressSpaceItem.datatypeName === de.biancoroyal.opcua.iiot.core.listener.METHOD_TYPE) {
      coreListener.subscribeDebugLog('Address Space Item Not Allowed to Monitor ' + addressSpaceItem)
      return
    }

    const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()

    if (nodeIdToMonitor) {
      coreListener.subscribeDebugLog('Monitored Item Subscribing ' + nodeIdToMonitor)
      this.buildNewMonitoredItem(nodeIdToMonitor, msg, uaSubscription)
        .then(function (result) {
          if (result.monitoredItem.monitoredItemId) {
            coreListener.subscribeDebugLog('Monitored Item Subscribed Id:' + result.monitoredItem.monitoredItemId + ' to ' + result.nodeId)
            node.bianco.iiot.monitoredASO.set(result.nodeId.toString(), { monitoredItem: result.monitoredItem, topic: msg.topic || node.topic })
          }
        }).catch(function (err) {
          coreListener.subscribeDebugLog(err)
          if (node.showErrors) {
            node.error(err, msg)
          }
        })
    }
  }
}

de.biancoroyal.opcua.iiot.core.listener.buildNewMonitoredItem = function (nodeId, msg, subscription) {
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!nodeId) {
        reject(new Error('NodeId Is Not Valid'))
        return
      }

      let interval
      let queueSize
      let options = (msg.payload.listenerParameters) ? msg.payload.listenerParameters : msg.payload
      if (typeof options.interval === 'number' &&
        options.interval <= coreListener.MAX_LISTENER_INTERVAL &&
        options.interval >= coreListener.MIN_LISTENER_INTERVAL) {
        interval = parseInt(options.interval)
      } else {
        interval = coreListener.SUBSCRIBE_DEFAULT_INTERVAL
      }

      if (options.queueSize && typeof options.queueSize === 'number') {
        queueSize = parseInt(options.queueSize)
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
            resolve({ nodeId: nodeId, monitoredItem: monitoredItemResult })
          }
        }
      )
    })
}

de.biancoroyal.opcua.iiot.core.listener.buildNewMonitoredItemGroup = function (node, msg, addressSpaceItems, subscription) {
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!addressSpaceItems) {
        reject(new Error('NodeId Is Not Valid'))
        return
      }

      let interval
      let queueSize

      let options = (msg.payload.listenerParameters) ? msg.payload.listenerParameters : msg.payload
      if (typeof options.interval === 'number' &&
        options.interval <= coreListener.MAX_LISTENER_INTERVAL &&
        options.interval >= coreListener.MIN_LISTENER_INTERVAL) {
        interval = parseInt(options.interval)
      } else {
        interval = coreListener.SUBSCRIBE_DEFAULT_INTERVAL
      }

      if (options.queueSize && typeof options.queueSize === 'number') {
        queueSize = parseInt(options.queueSize)
      } else {
        queueSize = coreListener.SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      let filteredAddressSpaceItems = addressSpaceItems.filter((addressSpaceItem) => {
        return addressSpaceItem.datatypeName !== de.biancoroyal.opcua.iiot.core.listener.METHOD_TYPE
      })

      let subcriptionItems = []
      filteredAddressSpaceItems.forEach((item) => {
        subcriptionItems.push({
          nodeId: coreListener.core.nodeOPCUA.resolveNodeId(item.nodeId),
          attributeId: coreListener.core.nodeOPCUA.AttributeIds.Value })
      })

      subscription.monitorItems(
        subcriptionItems,
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize
        },
        coreListener.core.nodeOPCUA.read_service.TimestampsToReturn.Both,
        function (err, monitoredItemGroup) {
          if (err) {
            coreListener.internalDebugLog('subscribing monitored item group ' + err)
            reject(err)
          } else {
            resolve({ addressSpaceItems: addressSpaceItems, monitoredItemGroup: monitoredItemGroup })
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
        return
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

de.biancoroyal.opcua.iiot.core.listener.analyzeEvent = function (session, browseForBrowseName, dataValue) {
  let core = de.biancoroyal.opcua.iiot.core.listener.core
  let coreListener = de.biancoroyal.opcua.iiot.core.listener

  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Session Is Not Valid To Analyze Event'))
        return
      }

      if (!browseForBrowseName || typeof browseForBrowseName !== 'function') {
        reject(new Error('BrowseForBrowseName Is Not Valid Function'))
        return
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
            eventInformation = { error: err }
            eventResults.push({ eventInformation: eventInformation, eventData: variant.toJSON() })
          }
        })

        resolve(eventResults)
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.listener.checkState = function (node, msg, callerType) {
  this.internalDebugLog('Check Listener State ' + node.bianco.iiot.stateMachine.getMachineState() + ' By ' + callerType)

  if (node.connector && node.bianco.iiot.stateMachine && node.bianco.iiot.stateMachine.getMachineState() !== this.RUNNING_STATE) {
    this.internalDebugLog('Wrong Listener State ' + node.bianco.iiot.stateMachine.getMachineState() + ' By ' + callerType)
    if (node.showErrors) {
      node.error(new Error('Listener Not ' + this.RUNNING_STATE + ' On ' + callerType), msg)
    }
    return false
  } else {
    return true
  }
}

de.biancoroyal.opcua.iiot.core.listener.initListenerNode = function (node) {
  let listenerNode = this.core.initClientNode(node)
  listenerNode.bianco.iiot.opcuaSubscription = null
  listenerNode.bianco.iiot.monitoredItems = new Map()
  listenerNode.bianco.iiot.monitoredASO = new Map()
  listenerNode.bianco.iiot.messageQueue = []
  return listenerNode
}

module.exports = de.biancoroyal.opcua.iiot.core.listener
