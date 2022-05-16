/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Node, NodeMessageInFlow} from "@node-red/registry";
import {Todo, TodoVoidFunction} from "./types/placeholders";

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

// @ts-ignore
import Map from 'es6-map';

import _ from 'underscore';
import coreListener from "./core/opcua-iiot-core-listener";
import {
  buildNodesToListen,
  checkConnectorState,
  checkSessionNotValid, deregisterToConnector,
  isInitializedIIoTNode,
  isNodeId,
  isSessionBad, registerToConnector, resetIiotNode,
  setNodeStatusTo
} from "./core/opcua-iiot-core";
import {AttributeIds, ClientSubscription, DataValue, StatusCodes} from "node-opcua";

import coreClient from "./core/opcua-iiot-core-client";
import {NodeMessage, NodeStatus} from "node-red";
import {EventPayloadLike} from "./opcua-iiot-event";



export type ListenPayload = {
  injectType: 'listen',

}


/**
 * Listener Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTListener (this: OPCUAIIoTCMD, config: OPCUAIIoTCMDDef) {
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

    let nodeConfig: Todo = {
      ...this,
      iiot: coreListener.initListenerNode()
    }

    nodeConfig.iiot.stateMachine = coreListener.createListenerStateMachine()
    coreListener.internalDebugLog('Start FSM: ' + nodeConfig.iiot.stateMachine.getMachineState())
    coreListener.detailDebugLog('FSM events:' + nodeConfig.iiot.stateMachine.getMachineEvents())

    const createSubscription = (msg: Todo) =>{
      if (nodeConfig.iiot.stateMachine.getMachineState() !== 'IDLE') {
        coreListener.internalDebugLog('New Subscription Request On State ' + nodeConfig.iiot.stateMachine.getMachineState())
        return
      }
      coreListener.internalDebugLog('Create Subscription On State ' + nodeConfig.iiot.stateMachine.getMachineState())
      nodeConfig.iiot.opcuaSubscription = null
      nodeConfig.iiot.stateMachine.requestinitsub()

      const timeMilliseconds = (typeof msg.payload === 'number') ? msg.payload : null
      const dynamicOptions = (msg.payload.listenerParameters) ? msg.payload.listenerParameters.options : msg.payload.options

      if (nodeConfig.action !== 'events') {
        coreListener.internalDebugLog('create monitoring subscription')
        const monitoringOptions = dynamicOptions || coreListener.getSubscriptionParameters(timeMilliseconds)
        makeSubscription(monitoringOptions)
      } else {
        coreListener.internalDebugLog('create event subscription')
        const eventOptions = dynamicOptions || coreListener.getEventSubscriptionParameters(timeMilliseconds)
        makeSubscription(eventOptions)
      }
    }

    const setSubscriptionEvents = (subscription: Todo) => {
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
          this.error(err, { payload: 'Internal Error' })
        }
        nodeConfig.oldStatusParameter = setNodeStatusTo(this, 'error', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
        nodeConfig.iiot.stateMachine.errorsub()
        resetSubscription()
      })

      subscription.on('item_added', (monitoredItem: Todo) => {
        setMonitoring(monitoredItem)
        updateSubscriptionStatus()
      })
    }

    const makeSubscription = function (parameters: Todo) {
      if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'ListenerSubscription')) {
        return
      }

      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return
      } else {
        coreListener.internalDebugLog('Subscription Parameters: ' + JSON.stringify(parameters))
      }

      nodeConfig.iiot.opcuaSubscription = ClientSubscription.create(nodeConfig.iiot.opcuaSession, parameters)
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
        addressSpaceItems.push({ name: '', nodeId: key, datatypeName: '' })
      })

      this.send(({ payload: payload, addressSpaceItems: addressSpaceItems } as Todo))

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
        coreListener.buildNewMonitoredItemGroup(this, msg, msg.addressSpaceItems, nodeConfig.iiot.opcuaSubscription)
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
      const itemsToMonitor = msg.addressSpaceItems.filter((addressSpaceItem: Todo) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof nodeConfig.iiot.monitoredASO.get(nodeIdToMonitor) === 'undefined'
      })

      const itemsToTerminate = msg.addressSpaceItems.filter((addressSpaceItem: Todo) => {
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

    const subscribeMonitoredItem =  (msg: Todo) => {
      if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'MonitorListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Monitoring')) {
        return
      }

      if (msg.addressSpaceItems.length) {
        if (nodeConfig.useGroupItems) {
          handleMonitoringOfGroupedItems(msg)
        } else {
          handleMonitoringOfItems(msg)
        }
      }
    }

    const handleEventSubscriptions = (msg: Todo) => {
      for (let addressSpaceItem of msg.addressSpaceItems) {
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
          coreListener.eventDebugLog('Regsiter Event Item ' + nodeIdToMonitor)
          coreListener.buildNewEventItem(nodeIdToMonitor, msg, nodeConfig.iiot.opcuaSubscription)
            .then(function (result: Todo) {
              if (result.monitoredItem.monitoredItemId) {
                coreListener.eventDebugLog('Event Item Regsitered ' + result.monitoredItem.monitoredItemId + ' to ' + result.nodeId)
                nodeConfig.iiot.monitoredASO.set(result.nodeId.toString(), {
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
            nodeConfig.iiot.monitoredItemTerminated(eventMessage, item.monitoredItem, nodeIdToMonitor, err)
          })
        }
      }
    }

    const subscribeMonitoredEvent = (msg: Todo) => {
      if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'EventListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Event')) {
        return
      }

      handleEventSubscriptions(msg)
    }

    const monitoredItemTerminated = (msg: any, monitoredItem: { monitoredItemId: string; }, nodeId: any, err: { message: string; }) => {
      if (err) {
        if (monitoredItem && monitoredItem.monitoredItemId) {
          coreListener.internalDebugLog(err.message + ' on ' + monitoredItem.monitoredItemId)
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
        if (nodeConfig.iiot.monitoredItems.has(monitoredItem.monitoredItemId)) {
          nodeConfig.iiot.monitoredItems.delete(monitoredItem.monitoredItemId)
        }

        if (isNodeId(monitoredItem.itemToMonitor.nodeId)) {
          coreListener.internalDebugLog('UMIL Terminate Monitored Item ' + monitoredItem.itemToMonitor.nodeId)
          if (nodeConfig.iiot.monitoredASO.has(nodeId)) {
            nodeConfig.iiot.monitoredASO.delete(nodeId)
          }
        } else {
          coreListener.internalDebugLog('UMIL monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
          nodeConfig.iiot.monitoredASO.forEach(function (value: Todo, key: Todo, map: Todo) {
            coreListener.internalDebugLog('UMIL monitoredItem removing from ASO list key:' + key + ' value ' + value.monitoredItem.monitoredItemId)
            if (value.monitoredItem.monitoredItemId && value.monitoredItem.monitoredItemId === monitoredItem.monitoredItemId) {
              coreListener.internalDebugLog('UMIL monitoredItem removed from ASO list' + key)
              map.delete(key)
            }
          })
        }

        updateSubscriptionStatus()
      }
    }

    const setMonitoring = (monitoredItemToSet: Todo) => {
      const monitoredItem = monitoredItemToSet
      if (!monitoredItem || monitoredItem.monitoredItemId === void 0) {
        coreListener.internalDebugLog('monitoredItem Id from server is not valid Id: ' + monitoredItem.monitoredItemId)
        return
      }

      if (!isNodeId(monitoredItem.itemToMonitor.nodeId)) {
        coreListener.internalDebugLog('monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
      }

      coreListener.internalDebugLog('add monitoredItem to list Id:' + monitoredItem.monitoredItemId + ' nodeId: ' + monitoredItem.itemToMonitor.nodeId)
      nodeConfig.iiot.monitoredItems.set(monitoredItem.monitoredItemId, monitoredItem)

      monitoredItem.on('initialized', function () {
        coreListener.internalDebugLog('monitoredItem ' + monitoredItem.itemToMonitor.nodeId + ' initialized on ' + monitoredItem.monitoredItemId)
      })

      monitoredItem.on('changed', function (dataValue: DataValue[]) {
        coreListener.detailDebugLog('data changed for item: ' + monitoredItem.itemToMonitor.nodeId + ' with Id ' + monitoredItem.monitoredItemId)
        if (!monitoredItem.monitoringParameters.filter) {
          sendDataFromMonitoredItem(monitoredItem, dataValue)
        } else {
          sendDataFromEvent(monitoredItem, dataValue)
        }
      })

      monitoredItem.on('error', (err: Error) => {
        coreListener.internalDebugLog('monitoredItem Error: ' + err.message + ' on ' + monitoredItem.monitoredItemId)
        if (nodeConfig.showErrors) {
          this.error(err, ({ payload: 'Monitored Item Error', monitoredItem: monitoredItem } as Todo))
        }

        updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)

        if (isSessionBad(err)) {
          sendAllMonitoredItems('BAD SESSION')
          terminateSubscription(() => {
            this.emit('opcua_client_not_ready')
          })
        }
      })

      monitoredItem.on('terminated', function () {
        monitoredItem.removeAllListeners()
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.monitoredItemId)
        updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)
      })
    }

    const sendDataFromMonitoredItem = (monitoredItem: Todo, dataValue: Todo) => {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = nodeConfig.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : nodeConfig.topic

      let msg: Todo = {
        payload: {},
        topic: topic,
        addressSpaceItems: [{ name: '', nodeId, datatypeName: '' }],
        nodetype: 'listen',
        injectType: 'subscribe'
      }

      coreListener.internalDebugLog('sendDataFromMonitoredItem: ' + msg.addressSpaceItems[0].nodeId)

      let dataValuesString: string
      msg.justValue = nodeConfig.justValue
      if (nodeConfig.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (nodeConfig.showErrors) {
            this.warn('JSON not to parse from string for monitored item')
            this.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = { dataValue, monitoredItem }
      }

      this.send(msg)
    }

    const handleEventResults = (msg: Todo, dataValue: Todo, eventResults: string, monitoredItem: Todo) => {
      coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

      let dataValuesString: string
      if (nodeConfig.justValue) {
        dataValuesString = JSON.stringify({ dataValue: dataValue }, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (nodeConfig.showErrors) {
            this.warn('JSON not to parse from string for monitored item')
            this.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = { dataValue, eventResults, monitoredItem }
      }

      this.send(msg)
    }

    const sendDataFromEvent = (monitoredItem: Todo, dataValue: DataValue[]) => {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = nodeConfig.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : nodeConfig.topic

      let msg = {
        payload: {},
        topic: topic || nodeConfig.topic, // default if item.topic is empty
        addressSpaceItems: [{ name: '', nodeId: nodeId, datatypeName: '' }],
        nodetype: 'listen',
        injectType: 'event'
      }

      coreListener.analyzeEvent(nodeConfig.iiot.opcuaSession, getBrowseName, dataValue)
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
        this.error(err, { payload: 'Error Handling' })
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
        nodeConfig.iiot.opcuaSubscription = null
        nodeConfig.iiot.monitoredItems = new Map()
        nodeConfig.iiot.monitoredASO = new Map()
        nodeConfig.iiot.stateMachine = coreListener.createListenerStateMachine()
        nodeConfig.iiot.monitoredItemGroup = null
      })

      nodeConfig.connector.on('connection_stopped', () => {
        terminateSubscription(() => {
          nodeConfig.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection stopped')
        })
      })

      nodeConfig.connector.on('connection_end', () => {
        terminateSubscription(() => {
          nodeConfig.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection ends')
        })
      })

      nodeConfig.connector.on('connection_reconfigure', () => {
        terminateSubscription(() => {
          nodeConfig.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection reconfigure')
        })
      })

      nodeConfig.connector.on('connection_renew', () => {
        terminateSubscription(() => {
          nodeConfig.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection renew')
        })
      })
    }

    const terminateSubscription = function (done: () => void) {
      if (nodeConfig.iiot.opcuaSubscription && nodeConfig.iiot.stateMachine.getMachineState() === coreListener.RUNNING_STATE) {
        nodeConfig.iiot.stateMachine.terminatesub()
        nodeConfig.iiot.opcuaSubscription.terminate(() => {
          nodeConfig.iiot.opcuaSubscription.removeAllListeners()
          nodeConfig.iiot.stateMachine.idlesub()
          done()
        })
      } else {
        nodeConfig.iiot.stateMachine.idlesub()
        done()
      }
    }

    this.on('close', (done: () => void) => {
      terminateSubscription(() => {
        nodeConfig.iiot.opcuaSubscription = null
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
