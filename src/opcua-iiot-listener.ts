/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {NodeMessage, NodeStatus} from "node-red";
import {Node, NodeMessageInFlow} from "@node-red/registry";
import {Todo, TodoVoidFunction} from "./types/placeholders";
import _ from 'underscore';
import coreListener from "./core/opcua-iiot-core-listener";
import {
  buildNodesToListen,
  checkConnectorState,
  checkSessionNotValid,
  deregisterToConnector,
  isInitializedIIoTNode,
  isNodeId,
  isSessionBad,
  registerToConnector,
  resetIiotNode,
  setNodeStatusTo
} from "./core/opcua-iiot-core";
import {
  AttributeIds,
  ClientMonitoredItem,
  ClientSubscription,
  ClientSubscriptionOptions,
  DataValue,
  StatusCodes
} from "node-opcua";

import coreClient from "./core/opcua-iiot-core-client";
import {EventPayloadLike} from "./opcua-iiot-event";
import {isArray} from "./types/assertion";

interface OPCUAIIoTCMD extends nodered.Node {
  action: string
  queueSize: number
  name: string
  topic: string
  justValue: string
  useGroupItems: string
  showStatusActivities: string
  showErrors: string
  connector: Node & Todo
}

interface OPCUAIIoTCMDDef extends nodered.NodeDef {
  action: string
  queueSize: number
  name: string
  topic: string
  justValue: string
  useGroupItems: string
  showStatusActivities: string
  showErrors: string
  connector: string
}


export type ListenPayload = Todo &{
  injectType: 'listen',
  value: Todo
}


/**
 * Listener Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTListener(this: OPCUAIIoTCMD, config: OPCUAIIoTCMDDef) {
    RED.nodes.createNode(this, config)
    this.action = config.action
    this.queueSize = config.queueSize || 1
    this.name = config.name
    this.topic = config.topic
    this.justValue = config.justValue
    this.useGroupItems = config.useGroupItems
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let nodeConfig: Todo = this;

    nodeConfig.iiot = coreListener.initListenerNode()

    nodeConfig.iiot.stateMachine = coreListener.createListenerStateMachine()
    coreListener.internalDebugLog('Start FSM: ' + nodeConfig.iiot.stateMachine.getMachineState())
    coreListener.detailDebugLog('FSM events:' + nodeConfig.iiot.stateMachine.getMachineEvents())

    const createSubscription = (msg: Todo) => {
      if (nodeConfig.iiot.stateMachine.getMachineState() !== 'IDLE') {
        coreListener.internalDebugLog('New Subscription Request On State ' + nodeConfig.iiot.stateMachine.getMachineState())
        return
      }
      coreListener.internalDebugLog('Create Subscription On State ' + nodeConfig.iiot.stateMachine.getMachineState())
      if (nodeConfig.iiot?.opcuaSubscription)
        nodeConfig.iiot.opcuaSubscription = null
      nodeConfig.iiot.stateMachine.requestinitsub()

      const timeMilliseconds = (typeof msg.payload.value === 'number') ? msg.payload.value : null
      const dynamicOptions = (msg.payload.listenerParameters) ? msg.payload.listenerParameters.options : msg.payload.options
      coreListener.internalDebugLog('create subscription, type: ' + nodeConfig.action)
      const options = dynamicOptions ||
      nodeConfig.action === 'events'
        ? coreListener.getEventSubscriptionParameters(timeMilliseconds)
        : coreListener.getSubscriptionParameters(timeMilliseconds);


      makeSubscription(options)
    }

    const setSubscriptionEvents = (subscription: ClientSubscription) => {
      subscription.on('started', () => {
        coreListener.internalDebugLog('Subscription started')
        nodeConfig.oldStatusParameter = setNodeStatusTo(this, 'started', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
        nodeConfig.iiot.monitoredItems.clear()
        nodeConfig.iiot.stateMachine.startsub()
      })

      subscription.on('terminated', () => {
        coreListener.internalDebugLog('Subscription terminated')
        nodeConfig.oldStatusParameter = setNodeStatusTo(this, 'terminated', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
        nodeConfig.iiot.stateMachine.terminatesub().idlesub()
        resetSubscription()
      })

      subscription.on('internal_error', (err: Error) => {
        coreListener.internalDebugLog('internal_error: ' + err.message)
        if (nodeConfig.showErrors) {
          this.error(err, {payload: 'Internal Error'})
        }
        nodeConfig.oldStatusParameter = setNodeStatusTo(this, 'error', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
        nodeConfig.iiot.stateMachine.errorsub()
        resetSubscription()
      })

      subscription.on('item_added', (monitoredItem: ClientMonitoredItem) => {
        setMonitoring(monitoredItem)
        updateSubscriptionStatus()
      })
    }

    const makeSubscription = function (parameters: ClientSubscriptionOptions) {
      if (checkSessionNotValid(nodeConfig.connector.iiot.opcuaSession, 'ListenerSubscription')) {
        return
      }
      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return
      } else {
        coreListener.internalDebugLog('Subscription Parameters: ' + JSON.stringify(parameters))
      }
      nodeConfig.iiot.opcuaSubscription = ClientSubscription.create(nodeConfig.connector.iiot.opcuaSession, parameters)
      coreListener.internalDebugLog('New Subscription Created')

      if (nodeConfig.connector) {
        nodeConfig.iiot.hasOpcUaSubscriptions = true
      }
      setSubscriptionEvents(nodeConfig.iiot.opcuaSubscription)
      nodeConfig.iiot.stateMachine.initsub()
    }

    const resetSubscription = function () {
      sendAllMonitoredItems('SUBSCRIPTION TERMINATED')
    }

    const sendAllMonitoredItems = (payload: Todo) => {
      let addressSpaceItems: Todo[] = []

      nodeConfig.iiot.monitoredASO.forEach(function (key: Todo) {
        addressSpaceItems.push({name: '', nodeId: key, datatypeName: ''})
      })

      this.send(({payload: payload, addressSpaceItems: addressSpaceItems} as Todo))

      nodeConfig.iiot.monitoredItems.clear()
      nodeConfig.iiot.monitoredASO.clear()
    }

    const subscribeActionInput = function (msg: Todo) {
      if (nodeConfig.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        nodeConfig.iiot.messageQueue.push(msg)
      } else {
        subscribeMonitoredItem(msg)
      }
    }

    const subscribeEventsInput = function (msg: Todo) {
      if (nodeConfig.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        nodeConfig.iiot.messageQueue.push(msg)
      } else {
        subscribeMonitoredEvent(msg)
      }
    }

    const updateSubscriptionStatus = () => {
      coreListener.internalDebugLog('listening' + ' (' + nodeConfig.iiot.monitoredItems.size + ')')
      nodeConfig.oldStatusParameter = setNodeStatusTo(this, 'listening' + ' (' + nodeConfig.iiot.monitoredItems.size + ')', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
    }

    const handleMonitoringOfGroupedItems = (msg: Todo) => {
      if (nodeConfig.iiot.monitoredItemGroup && nodeConfig.iiot.monitoredItemGroup.groupId !== null) {
        nodeConfig.iiot.monitoredItemGroup.terminate(function (err: Error) {
          if (err) {
            coreListener.internalDebugLog('Monitoring Terminate Error')
            coreListener.internalDebugLog(err)
          }
          nodeConfig.iiot.monitoredItems.clear()
          nodeConfig.iiot.monitoredASO.clear()
          nodeConfig.iiot.monitoredItemGroup.groupId = null
          updateSubscriptionStatus()
        })
      } else {
        coreListener.buildNewMonitoredItemGroup(this, msg, msg.payload.addressSpaceItems, nodeConfig.iiot.opcuaSubscription)
          .then((result: Todo) => {
            if (!result.monitoredItemGroup) {
              this.error(new Error('No Monitored Item Group In Result Of NodeOPCUA'))
            } else {
              result.monitoredItemGroup.groupId = _.uniqueId('group_')
              nodeConfig.iiot.monitoredItemGroup = result.monitoredItemGroup
            }
          }).catch((err: Error) => {
          coreListener.subscribeDebugLog('Monitoring Build Item Group Error')
          coreListener.subscribeDebugLog(err)
          if (nodeConfig.showErrors) {
            this.error(err, msg)
          }
        })
      }
    }

    const handleMonitoringOfItems = (msg: Todo) => {
      const itemsToMonitor = msg.payload.addressSpaceItems.filter((addressSpaceItem: Todo) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof nodeConfig.iiot.monitoredASO.get(nodeIdToMonitor) === 'undefined'
      })

      const itemsToTerminate = msg.payload.addressSpaceItems.filter((addressSpaceItem: Todo) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof nodeConfig.iiot.monitoredASO.get(nodeIdToMonitor) !== 'undefined'
      })

      if (itemsToMonitor.length > 0) {
        const monitorMessage = Object.assign({}, msg)
        monitorMessage.addressSpaceItems = itemsToMonitor
        coreListener.subscribeDebugLog('itemsToMonitor ' + itemsToMonitor.length)
        coreListener.monitorItems(this, monitorMessage, nodeConfig.iiot.opcuaSubscription)
      }

      if (itemsToTerminate.length > 0) {
        coreListener.subscribeDebugLog('itemsToTerminate ' + itemsToTerminate.length)
        itemsToTerminate.forEach((addressSpaceItem: Todo) => {
          const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
          const item = nodeConfig.iiot.monitoredASO.get(nodeIdToMonitor)
          if (item && item.monitoredItem) {
            coreListener.subscribeDebugLog('Monitored Item Unsubscribe ' + nodeIdToMonitor)
            item.monitoredItem.terminate(function (err: Error) {
              coreListener.subscribeDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
              monitoredItemTerminated(msg, item.monitoredItem, nodeIdToMonitor, err)
            })
          } else {
            coreListener.subscribeDebugLog('Monitored Item Was Not Monitoring ' + nodeIdToMonitor)
          }
        })
      }
    }

    const subscribeMonitoredItem = (msg: Todo) => {
      if (checkSessionNotValid(nodeConfig?.connector?.iiot?.opcuaSession, 'MonitorListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Monitoring')) {
        return
      }
      if (!msg.payload.addressSpaceItems?.length) {
        msg.payload.addressSpaceItems = msg.payload.browseResults
      }
      if (msg.payload.addressSpaceItems?.length) {
        if (nodeConfig.useGroupItems) {
          handleMonitoringOfGroupedItems(msg)
        } else {
          handleMonitoringOfItems(msg)
        }
      } else {
        nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'error', nodeConfig.oldStatusParameter, true, statusHandler)
        this.send({
          ...msg,
          payload: {
            status: 'error',
            message: 'No address space items to monitor'
          }
        })
      }
    }

    const handleEventSubscriptions = (msg: Todo) => {
      msg.payload.addressSpaceItems.forEach((addressSpaceItem: Todo) => {
        if (!addressSpaceItem.nodeId) {
          coreListener.eventDebugLog('Address Space Item Not Valid to Monitor Event Of ' + addressSpaceItem)
          return
        }

        if (addressSpaceItem.datatypeName === 'ns=0;i=0') {
          coreListener.subscribeDebugLog('Address Space Item Not Allowed to Monitor ' + addressSpaceItem)
          return
        }

        let nodeIdToMonitor: string
        if (typeof addressSpaceItem.nodeId === 'string') {
          nodeIdToMonitor = addressSpaceItem.nodeId
        } else {
          nodeIdToMonitor = addressSpaceItem.nodeId.toString()
        }

        const item = nodeConfig.iiot.monitoredASO.get(nodeIdToMonitor)

        if (!item) {
          coreListener.eventDebugLog('Register Event Item ' + nodeIdToMonitor)
          coreListener.buildNewEventItem(nodeIdToMonitor, msg, nodeConfig.iiot.opcuaSubscription)
            .then(function (result: Todo) {
              if (result.monitoredItem.itemToMonitor.nodeId) {
                coreListener.eventDebugLog('Event Item Registered ' + result.monitoredItem.itemToMonitor.nodeId + ' to ' + result.nodeId)
                nodeConfig.iiot.monitoredASO.set(result?.nodeId?.toString(), {
                  monitoredItem: result.monitoredItem,
                  topic: msg.topic || nodeConfig.topic
                })
              }
            }).catch((err: Error) => {
            coreListener.eventDebugLog('Build Event Error')
            coreListener.eventDebugLog(err)
            if (nodeConfig.showErrors) {
              this.error(err, msg)
            }
          })
        } else {
          coreListener.eventDebugLog('Terminate Event Item' + nodeIdToMonitor)
          const eventMessage = Object.assign({}, msg)
          item.monitoredItem.terminate(function (err: Error) {
            coreListener.eventDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
            monitoredItemTerminated(eventMessage, item.monitoredItem, nodeIdToMonitor, err)
          })
        }
      })
    }

    const subscribeMonitoredEvent = (msg: Todo) => {
      if (checkSessionNotValid(nodeConfig.connector.iiot.opcuaSession, 'EventListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Event')) {
        return
      }

      handleEventSubscriptions(msg)
    }

    const monitoredItemTerminated = (msg: any, monitoredItem: Todo, nodeId: any, err: { message: string; }) => {
      if (err) {
        if (monitoredItem && monitoredItem.itemToMonitor.nodeId) {
          coreListener.internalDebugLog(err.message + ' on ' + monitoredItem.itemToMonitor.nodeId)
        } else {
          coreListener.internalDebugLog(err.message + ' on monitoredItem')
        }
        if (nodeConfig.showErrors) {
          this.error(err, msg)
        }
      }
      updateMonitoredItemLists(monitoredItem, nodeId)
    }

    const updateMonitoredItemLists = function (monitoredItem: Todo, nodeId: any) {
      coreListener.internalDebugLog('updateMonitoredItemLists = UMIL')

      if (monitoredItem && monitoredItem.itemToMonitor) {
        if (nodeConfig.iiot.monitoredItems.has(monitoredItem?.itemToMonitor?.nodeId?.toString())) {
          nodeConfig.iiot.monitoredItems.delete(monitoredItem?.itemToMonitor?.nodeId?.toString())
        }

        if (isNodeId(monitoredItem.itemToMonitor.nodeId)) {
          coreListener.internalDebugLog('UMIL Terminate Monitored Item ' + monitoredItem.itemToMonitor.nodeId)
          if (nodeConfig.iiot.monitoredASO.has(nodeId)) {
            nodeConfig.iiot.monitoredASO.delete(nodeId)
          }
        } else {
          coreListener.internalDebugLog('UMIL monitoredItem NodeId is not valid Id:' + monitoredItem.itemToMonitor.nodeId)
          nodeConfig.iiot.monitoredASO.forEach(function (value: Todo, key: Todo, map: Todo) {
            coreListener.internalDebugLog('UMIL monitoredItem removing from ASO list key:' + key + ' value ' + value.monitoredItem.itemToMonitor.nodeId)
            if (value.monitoredItem.itemToMonitor.nodeId && value.monitoredItem.itemToMonitor.nodeId === monitoredItem.itemToMonitor.nodeId) {
              coreListener.internalDebugLog('UMIL monitoredItem removed from ASO list' + key)
              map.delete(key)
            }
          })
        }

        updateSubscriptionStatus()
      }
    }

    const setMonitoring = (monitoredItemToSet: ClientMonitoredItem) => {
      const monitoredItem: ClientMonitoredItem = monitoredItemToSet
      if (!monitoredItem || !monitoredItem.on) {
        coreListener.internalDebugLog('monitoredItem Id from server is not valid Id: ' + monitoredItem)
        return
      }
      if (!isNodeId(monitoredItem.itemToMonitor?.nodeId)) {
        coreListener.internalDebugLog('monitoredItem NodeId is not valid Id:' + monitoredItem.itemToMonitor.nodeId)
      }
      coreListener.internalDebugLog('add monitoredItem to list Id:' + monitoredItem.itemToMonitor.nodeId + ' nodeId: ' + monitoredItem.itemToMonitor.nodeId)
      nodeConfig.iiot.monitoredItems.set(monitoredItem?.itemToMonitor?.nodeId?.toString(), monitoredItem)

      monitoredItem.on('initialized', function () {
        coreListener.internalDebugLog('monitoredItem ' + monitoredItem.itemToMonitor.nodeId + ' initialized on ' + monitoredItem.itemToMonitor.nodeId)
      })

      monitoredItem.on('changed', (dataValue: DataValue) => {
        coreListener.detailDebugLog('data changed for item: ' + monitoredItem.itemToMonitor.nodeId + ' with Id ' + monitoredItem.itemToMonitor.nodeId)
        if (!monitoredItem.monitoringParameters.filter) {
          sendDataFromMonitoredItem(monitoredItem, dataValue)
        } else {
          sendDataFromEvent(monitoredItem, dataValue)
        }
      })

      // @ts-ignore
      monitoredItem.on('err', (err: Error) => {
        const error = new Error(monitoredItem.itemToMonitor.nodeId.toString() + ': ' + (err?.message || err))
        coreListener.internalDebugLog('monitoredItem Error: ' + error + ' on ' + monitoredItem.itemToMonitor.nodeId)
        if (nodeConfig.showErrors) {
          this.error(error, ({payload: 'Monitored Item Error', monitoredItem: monitoredItem} as Todo))
        }

        updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)

        if (isSessionBad(error)) {
          sendAllMonitoredItems('BAD SESSION')
          terminateSubscription(() => {
            this.emit('opcua_client_not_ready')
          })
        }
      })

      // @ts-ignore
      monitoredItem.on('terminated', (err: Todo) => {
        monitoredItem.removeAllListeners()
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.itemToMonitor.nodeId)
        updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)
      })
    }

    const sendDataFromMonitoredItem = (monitoredItem: Todo, dataValue: Todo) => {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem?.itemToMonitor?.nodeId?.toString() : 'invalid'
      const item = nodeConfig.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : nodeConfig.topic

      let msg: Todo = {
        payload: {
          addressSpaceItems: [{name: '', nodeId, datatypeName: ''}],
          nodetype: 'listen',
          injectType: 'subscribe'
        },
        topic: topic,
      }

      coreListener.internalDebugLog('sendDataFromMonitoredItem: ' + msg.payload.addressSpaceItems[0].nodeId)

      let dataValuesString: string
      msg.justValue = nodeConfig.justValue
      if (nodeConfig.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg.payload, 'value', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (nodeConfig.showErrors) {
            this.warn('JSON not to parse from string for monitored item')
            this.error(err, msg)
          }

          msg.payload.value = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = {
          ...msg.payload,
          value: dataValue,
          statusCode: monitoredItem.statusCode, 
          itemToMonitor: monitoredItem.itemToMonitor,
          monitoredItemId: monitoredItem.itemToMonitor
        }
      }

      this.send(msg)
    }

    const handleEventResults = (msg: Todo, dataValue: Todo, eventResults: string, monitoredItem: Todo) => {
      coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

      let dataValuesString: string
      if (nodeConfig.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg.payload, 'value', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (nodeConfig.showErrors) {
            this.warn('JSON not to parse from string for monitored item')
            this.error(err, msg)
          }

          msg.payload.value = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = {...msg.payload, value: dataValue, eventResults, monitoredItem}
      }

      this.send(msg)
    }

    const sendDataFromEvent = (monitoredItem: ClientMonitoredItem, dataValue: DataValue | DataValue[]) => {
      // @ts-ignore
      if (!isArray(dataValue)) {
        dataValue = [dataValue]
      }
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem?.itemToMonitor?.nodeId?.toString() : 'invalid'
      const item = nodeConfig.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : nodeConfig.topic

      let msg = {
        payload: {
          addressSpaceItems: [{name: '', nodeId: nodeId, datatypeName: ''}],
          nodetype: 'listen',
          injectType: 'event'
        },
        topic: topic || nodeConfig.topic, // default if item.topic is empty
      }

      coreListener.analyzeEvent(nodeConfig.connector.iiot.opcuaSession, getBrowseName, dataValue)
        .then((eventResults: Todo) => {
          handleEventResults(msg, dataValue, eventResults, monitoredItem)
        }).catch((err: Error) => {
        (isInitializedIIoTNode(this)) ? errorHandling(err) : coreListener.internalDebugLog(err.message)
      })
    }

    const errorHandling = (err: Error) => {
      coreListener.internalDebugLog('Basic Error Handling')
      coreListener.internalDebugLog(err)
      if (nodeConfig.showErrors) {
        this.error(err, {payload: 'Error Handling'})
      }

      if (err) {
        if (isSessionBad(err)) {
          sendAllMonitoredItems('BAD SESSION')
          terminateSubscription(() => {
            this.emit('opcua_client_not_ready')
          })
        }
      }
    }

    const getBrowseName = function (session: Todo, nodeId: Todo, callback: TodoVoidFunction) {
      coreClient.read(session, [{
        nodeId: nodeId,
        attributeId: AttributeIds.BrowseName
      }], 12, function (err: Error, org: Todo, readValue: Todo[]) {
        if (!err) {
          if (readValue[0].statusCode === StatusCodes.Good) {
            let browseName = readValue[0].value.value.name
            return callback(null, browseName)
          }
        }
        callback(err, 'Unknown')
      })
    }

    const handleListenerInput = (msg: Todo) => {
      switch (nodeConfig.action) {
        case 'subscribe':
          subscribeMonitoredItem(msg)
          break
        case 'events':
          subscribeMonitoredEvent(msg)
          break
        default:
          this.error(new Error('Type Of Action To Listener Is Not Valid'), msg)
      }
    }

    const errorHandler = (err: Error, msg: NodeMessage) => {
      this.error(err, msg)
    }

    const emitHandler = (msg: string) => {
      this.emit(msg)
    }

    const statusHandler = (status: string | NodeStatus): void => {
      this.status(status)
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (!checkConnectorState(nodeConfig, msg, 'Listener', errorHandler, emitHandler, statusHandler)) {
        return
      }
      const payload = msg.payload as EventPayloadLike

      const outputPayload = {
        ...payload,
        nodetype: payload.nodetype === 'browse' ? 'inject' : payload.nodetype,
        injectType: payload.nodetype === 'browse' ? 'listen' : payload.injectType,
        addressSpaceItems: buildNodesToListen(payload)
      }

      const outputMessage = {
        ...msg,
        payload: outputPayload
      }

      if (!outputPayload.addressSpaceItems || !outputPayload.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        if (nodeConfig.showErrors) {
          this.error(new Error('Address-Space-Item Set Not Valid'), msg)
        }
        return
      }

      if (nodeConfig.iiot.stateMachine.getMachineState() === 'IDLE') {
        nodeConfig.iiot.messageQueue.push(outputMessage)
        createSubscription(outputMessage)
      } else {
        if (!coreListener.checkState(nodeConfig, outputMessage, 'Input')) {
          nodeConfig.iiot.messageQueue.push(outputMessage)
          return
        }
        handleListenerInput(outputMessage)
      }
    })

    const onAlias = (event: string, callback: () => void) => {
      // @ts-ignore
      this.on(event, callback)
    }

    registerToConnector(this, statusHandler, onAlias, errorHandler)

    if (nodeConfig.connector) {
      nodeConfig.connector.on('connector_init', () => {
        coreListener.internalDebugLog('Reset Subscription On Connector Init')
        if (nodeConfig.iiot?.opcuaSubscription) {
          nodeConfig.iiot.opcuaSubscription = null
        }

        nodeConfig.iiot.monitoredItems = new Map()
        nodeConfig.iiot.monitoredASO = new Map()
        nodeConfig.iiot.stateMachine = coreListener.createListenerStateMachine()
        nodeConfig.iiot.monitoredItemGroup = null
      })

      nodeConfig.connector.on('connection_stopped', () => {
        terminateSubscription(() => {
          if (nodeConfig.iiot?.opcuaSubscription)
            nodeConfig.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection stopped')
        })
      })

      nodeConfig.connector.on('connection_end', () => {
        terminateSubscription(() => {
          if (nodeConfig.iiot?.opcuaSubscription) {
            nodeConfig.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection ends')
        })
      })

      nodeConfig.connector.on('connection_reconfigure', () => {
        terminateSubscription(() => {
          if (nodeConfig.iiot?.opcuaSubscription) {
            nodeConfig.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection reconfigure')
        })
      })

      nodeConfig.connector.on('connection_renew', () => {
        terminateSubscription(() => {
          if (nodeConfig.iiot?.opcuaSubscription) {
            nodeConfig.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection renew')
        })
      })
    }

    const terminateSubscription = function (done: () => void) {
      if (nodeConfig.iiot?.opcuaSubscription && nodeConfig.iiot?.stateMachine.getMachineState() === coreListener.RUNNING_STATE) {
        nodeConfig.iiot.stateMachine.terminatesub()
        nodeConfig.iiot.opcuaSubscription.terminate(() => {
          nodeConfig.iiot.opcuaSubscription.removeAllListeners()
          nodeConfig.iiot.stateMachine.idlesub()
          done()
        })
      } else {
        nodeConfig.iiot?.stateMachine.idlesub()
        done()
      }
    }

    if (process.env.TEST === 'true')
      nodeConfig.functions = {
        createSubscription,
        subscribeActionInput,
        subscribeMonitoredItem,
        monitoredItemTerminated,
        errorHandling,
        setMonitoring
      }

    this.on('close', (done: () => void) => {
      terminateSubscription(() => {

        if (nodeConfig.iiot?.opcuaSubscription) {
          nodeConfig.iiot.opcuaSubscription = null
        }

        deregisterToConnector(nodeConfig, () => {
          resetIiotNode(nodeConfig)
          done()
        })

        coreListener.internalDebugLog('Close Listener Node')
      })
    })

    /* #########   FSM EVENTS  #########     */

    nodeConfig.iiot.stateMachine.onIDLE = function () {
      coreListener.detailDebugLog('Listener IDLE Event FSM')
    }

    nodeConfig.iiot.stateMachine.onREQUESTED = function () {
      coreListener.detailDebugLog('Listener REQUESTED Event FSM')
    }

    nodeConfig.iiot.stateMachine.onINIT = function () {
      coreListener.detailDebugLog('Listener INIT Event FSM')
    }

    nodeConfig.iiot.stateMachine.onSTARTED = function () {
      coreListener.detailDebugLog('Listener STARTED Event FSM')

      switch (nodeConfig.action) {
        case 'subscribe':
          while (nodeConfig.iiot.messageQueue.length > 0) {
            subscribeMonitoredItem(nodeConfig.iiot.messageQueue.shift())
          }
          break
        case 'events':
          while (nodeConfig.iiot.messageQueue.length > 0) {
            subscribeMonitoredEvent(nodeConfig.iiot.messageQueue.shift())
          }
          break
        default:
          coreListener.internalDebugLog('Unknown Action Type ' + nodeConfig.action)
      }
    }

    nodeConfig.iiot.stateMachine.onTERMINATED = function () {
      coreListener.detailDebugLog('Listener TERMINATED Event FSM')
    }

    nodeConfig.iiot.stateMachine.onERROR = function () {
      coreListener.detailDebugLog('Listener ERROR Event FSM')
    }

    nodeConfig.iiot.stateMachine.onEND = function () {
      coreListener.detailDebugLog('Listener END Event FSM')
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
