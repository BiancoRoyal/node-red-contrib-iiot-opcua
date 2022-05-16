/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

import {recursivePrintTypes, Todo} from "../types/placeholders";

import debug from 'debug'

// @ts-ignore
import * as Stately from 'stately.js'



import {AttributeIds, DataType, DataValue, resolveNodeId, TimestampsToReturn} from "node-opcua";
import {initCoreNode} from "./opcua-iiot-core";

const internalDebugLog = debug('opcuaIIoT:listener') // eslint-disable-line no-use-before-define
const detailDebugLog = debug('opcuaIIoT:listener:details') // eslint-disable-line no-use-before-define
const subscribeDebugLog = debug('opcuaIIoT:listener:subscribe') // eslint-disable-line no-use-before-define
const subscribeDetailDebugLog = debug('opcuaIIoT:listener:subscribe:details') // eslint-disable-line no-use-before-define
const eventDebugLog = debug('opcuaIIoT:listener:event') // eslint-disable-line no-use-before-define
const eventDetailDebugLog = debug('opcuaIIoT:listener:event:details') // eslint-disable-line no-use-before-define
const SUBSCRIBE_DEFAULT_INTERVAL = 1000 // eslint-disable-line no-use-before-define
const MIN_LISTENER_INTERVAL = 100 // eslint-disable-line no-use-before-define
const MAX_LISTENER_INTERVAL = 3600000 // eslint-disable-line no-use-before-define
const SUBSCRIBE_DEFAULT_QUEUE_SIZE = 1 // eslint-disable-line no-use-before-define
const EVENT_DEFAULT_INTERVAL = 250 // eslint-disable-line no-use-before-define
const EVENT_DEFAULT_QUEUE_SIZE = 10000 // eslint-disable-line no-use-before-define
const METHOD_TYPE = 'ns=0;i=0' // eslint-disable-line no-use-before-define
const RUNNING_STATE = 'STARTED' // eslint-disable-line no-use-before-define
const MAX_INT32 = 2147483647 // eslint-disable-line no-use-before-define

const createListenerStateMachine = function () {
  return Stately.machine({
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

const getEventSubscriptionParameters = function (timeMilliseconds: number) {
  timeMilliseconds = timeMilliseconds > MAX_INT32 ? 100 : timeMilliseconds
  return {
    requestedPublishingInterval: timeMilliseconds || 100,
    requestedLifetimeCount: 1000 * 60 * 20,
    requestedMaxKeepAliveCount: 120,
    maxNotificationsPerPublish: 200,
    publishingEnabled: true,
    priority: 2
  }
}

const getSubscriptionParameters = function (timeMilliseconds: number) {
  timeMilliseconds = timeMilliseconds > MAX_INT32 ? 200 : timeMilliseconds
  return {
    requestedPublishingInterval: timeMilliseconds || 200,
    requestedLifetimeCount: 1000 * 60 * 10,
    requestedMaxKeepAliveCount: 60,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
  }
}

const collectAlarmFields = function (field: Todo, dataType: Todo, value: Todo) {
  return {
    field,
    dataType,
    value
  }
}

const getBasicEventFields = function () {
  return ['EventId', 'SourceName', 'Message', 'ReceiveTime']
}

const getAllEventFields = function () {
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

const getStateFields = function () {
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

const getConditionFields = function () {
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

const monitorItems = function (node: Todo, msg: Todo, uaSubscription: Todo) {

  for (let addressSpaceItem of msg.addressSpaceItems) {
    if (!addressSpaceItem.nodeId) {
      subscribeDebugLog('Address Space Item Not Valid to Monitor ' + addressSpaceItem)
      return
    }

    if (addressSpaceItem.datatypeName === METHOD_TYPE) {
      subscribeDebugLog('Address Space Item Not Allowed to Monitor ' + addressSpaceItem)
      return
    }

    const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()

    if (nodeIdToMonitor) {
      subscribeDebugLog('Monitored Item Subscribing ' + nodeIdToMonitor)
      buildNewMonitoredItem(nodeIdToMonitor, msg, uaSubscription)
        .then(function (result: Todo) {
          if (result.monitoredItem.monitoredItemId) {
            subscribeDebugLog('Monitored Item Subscribed Id:' + result.monitoredItem.monitoredItemId + ' to ' + result.nodeId)
            node.iiot.monitoredASO.set(result.nodeId.toString(), { monitoredItem: result.monitoredItem, topic: msg.topic || node.topic })
          }
        }).catch(function (err: Error) {
          subscribeDebugLog(err)
          if (node.showErrors) {
            node.error(err, msg)
          }
        })
    }
  }
}

const buildNewMonitoredItem = function (nodeId: Todo, msg: Todo, subscription: Todo) {
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
        options.interval <= MAX_LISTENER_INTERVAL &&
        options.interval >= MIN_LISTENER_INTERVAL) {
        interval = parseInt(options.interval)
      } else {
        interval = SUBSCRIBE_DEFAULT_INTERVAL
      }

      if (options.queueSize && typeof options.queueSize === 'number') {
        queueSize = parseInt(options.queueSize)
      } else {
        queueSize = SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      subscription.monitor(
        {
          nodeId: resolveNodeId(nodeId),
          attributeId: AttributeIds.Value
        },
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize
        },
        TimestampsToReturn.Both,
        function (err: Error, monitoredItemResult: Todo) {
          if (err) {
            internalDebugLog('subscribing monitored item ' + err)
            reject(err)
          } else {
            resolve({ nodeId: nodeId, monitoredItem: monitoredItemResult })
          }
        }
      )
    })
}

const buildNewMonitoredItemGroup = function (node: Todo, msg: Todo, addressSpaceItems: Todo, subscription: Todo) {
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
        options.interval <= MAX_LISTENER_INTERVAL &&
        options.interval >= MIN_LISTENER_INTERVAL) {
        interval = parseInt(options.interval)
      } else {
        interval = SUBSCRIBE_DEFAULT_INTERVAL
      }

      if (options.queueSize && typeof options.queueSize === 'number') {
        queueSize = parseInt(options.queueSize)
      } else {
        queueSize = SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      let filteredAddressSpaceItems = addressSpaceItems.filter((addressSpaceItem: Todo) => {
        return addressSpaceItem.datatypeName !== METHOD_TYPE
      })

      let subcriptionItems: Todo[] = []
      filteredAddressSpaceItems.forEach((item: Todo) => {
        subcriptionItems.push({
          nodeId: resolveNodeId(item.nodeId),
          attributeId: AttributeIds.Value })
      })

      subscription.monitorItems(
        subcriptionItems,
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize
        },
        TimestampsToReturn.Both,
        function (err: Error, monitoredItemGroup: Todo) {
          if (err) {
            internalDebugLog('subscribing monitored item group ' + err)
            reject(err)
          } else {
            resolve({ addressSpaceItems: addressSpaceItems, monitoredItemGroup: monitoredItemGroup })
          }
        }
      )
    })
}

const buildNewEventItem = function (nodeId: Todo, msg: Todo, subscription: Todo) {
  return new Promise(
    function (resolve, reject) {
      if (!nodeId) {
        reject(new Error('NodeId Is Not Valid'))
        return
      }

      let interval
      let queueSize

      if (typeof msg.payload.interval === 'number' && msg.payload.interval < MAX_LISTENER_INTERVAL) {
        interval = parseInt(msg.payload.interval)
      } else {
        interval = EVENT_DEFAULT_INTERVAL
      }

      if (typeof msg.payload.queueSize === 'number') {
        queueSize = parseInt(msg.payload.queueSize)
      } else {
        queueSize = EVENT_DEFAULT_QUEUE_SIZE
      }

      subscription.monitor(
        {
          nodeId: resolveNodeId(nodeId),
          attributeId: AttributeIds.EventNotifier
        },
        {
          samplingInterval: interval,
          discardOldest: true,
          queueSize: queueSize,
          filter: msg.payload.eventFilter
        },
        TimestampsToReturn.Both,
        function (err: Error, monitoredItemResult: Todo) {
          if (err) {
            internalDebugLog('subscribing event item ' + err)
            reject(err)
          } else {
            resolve({ nodeId: nodeId, monitoredItem: monitoredItemResult })
          }
        }
      )
    })
}

const analyzeEvent = function (session: Todo, browseForBrowseName: (...args: Todo) => Todo, dataValue: DataValue[]) {
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
        let eventInformation: Todo = {}
        let eventResults: Todo[] = []

        dataValue.forEach(function (dv) {
          const variant = dv.value
          eventDebugLog('variant entry: ' + variant.toString())

          try {
            if (variant.dataType && variant.value) {
              eventInformation = collectAlarmFields((dataValue as Todo).monitoringParameters.filter.selectClauses[index], variant.dataType.toString(), variant.value)

              if (variant.dataType === DataType.NodeId) {
                browseForBrowseName(session, variant.value, function (err: Error | undefined, browseName: Todo) {
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

const checkState = function (node: Todo, msg: Todo, callerType: Todo) {
  internalDebugLog('Check Listener State ' + node.iiot.stateMachine.getMachineState() + ' By ' + callerType)

  if (node.connector && node.iiot.stateMachine && node.iiot.stateMachine.getMachineState() !== RUNNING_STATE) {
    internalDebugLog('Wrong Listener State ' + node.iiot.stateMachine.getMachineState() + ' By ' + callerType)
    if (node.showErrors) {
      node.error(new Error('Listener Not ' + RUNNING_STATE + ' On ' + callerType), msg)
    }
    return false
  } else {
    return true
  }
}

const initListenerNode = function () {
  return {
    ...initCoreNode(),
    opcuaSubscription: null,
    monitoredItems: new Map(),
    monitoredASO: new Map(),
    messageQueue: []
  }
}

const coreListener = {
  internalDebugLog,
  detailDebugLog,
  subscribeDebugLog,
  subscribeDetailDebugLog,
  eventDebugLog,
  eventDetailDebugLog,

  SUBSCRIBE_DEFAULT_INTERVAL,
  MIN_LISTENER_INTERVAL,
  MAX_LISTENER_INTERVAL,
  SUBSCRIBE_DEFAULT_QUEUE_SIZE,
  EVENT_DEFAULT_INTERVAL,
  EVENT_DEFAULT_QUEUE_SIZE,
  METHOD_TYPE,
  RUNNING_STATE,
  MAX_INT32,

  createListenerStateMachine,
  getEventSubscriptionParameters,
  getSubscriptionParameters,
  collectAlarmFields,
  getBasicEventFields,
  getAllEventFields,
  getStateFields,
  getConditionFields,
  monitorItems,
  buildNewMonitoredItem,
  buildNewMonitoredItemGroup,
  buildNewEventItem,
  analyzeEvent,
  checkState,
  initListenerNode,
}

export default coreListener;
