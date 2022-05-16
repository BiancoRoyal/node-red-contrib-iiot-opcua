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
import {AttributeIds, ClientSubscription, DataValue, NodeId, StatusCodes} from "node-opcua";

import coreClient from "./core/opcua-iiot-core-client";
import {NodeMessage, NodeStatus} from "node-red";

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

    let node: Todo = {
      ...this,
      iiot: coreListener.initListenerNode()
    }

    node.iiot.stateMachine = coreListener.createStatelyMachine()
    coreListener.internalDebugLog('Start FSM: ' + node.iiot.stateMachine.getMachineState())
    coreListener.detailDebugLog('FSM events:' + node.iiot.stateMachine.getMachineEvents())

    node.iiot.createSubscription = function (msg: Todo) {
      if (node.iiot.stateMachine.getMachineState() !== 'IDLE') {
        coreListener.internalDebugLog('New Subscription Request On State ' + node.iiot.stateMachine.getMachineState())
        return
      }
      coreListener.internalDebugLog('Create Subscription On State ' + node.iiot.stateMachine.getMachineState())
      node.iiot.opcuaSubscription = null
      node.iiot.stateMachine.requestinitsub()

      const timeMilliseconds = (typeof msg.payload === 'number') ? msg.payload : null
      const dynamicOptions = (msg.payload.listenerParameters) ? msg.payload.listenerParameters.options : msg.payload.options

      if (node.action !== 'events') {
        coreListener.internalDebugLog('create monitoring subscription')
        const monitoringOptions = dynamicOptions || coreListener.getSubscriptionParameters(timeMilliseconds)
        node.iiot.makeSubscription(monitoringOptions)
      } else {
        coreListener.internalDebugLog('create event subscription')
        const eventOptions = dynamicOptions || coreListener.getEventSubscriptionParameters(timeMilliseconds)
        node.iiot.makeSubscription(eventOptions)
      }
    }

    node.iiot.setSubscriptionEvents = function (subscription: Todo) {
      subscription.on('started', function () {
        coreListener.internalDebugLog('Subscription started')
        setNodeStatusTo(node, 'started', node.oldStatusParameter, node.showStatusActivities, statusHandler)
        node.iiot.monitoredItems.clear()
        node.iiot.stateMachine.startsub()
      })

      subscription.on('terminated', function () {
        coreListener.internalDebugLog('Subscription terminated')
        setNodeStatusTo(node, 'terminated', node.oldStatusParameter, node.showStatusActivities, statusHandler)
        node.iiot.stateMachine.terminatesub().idlesub()
        node.iiot.resetSubscription()
      })

      subscription.on('internal_error', function (err: Todo) {
        coreListener.internalDebugLog('internal_error: ' + err.message)
        if (node.showErrors) {
          node.error(err, { payload: 'Internal Error' })
        }
        setNodeStatusTo(node, 'error', node.oldStatusParameter, node.showStatusActivities, statusHandler)
        node.iiot.stateMachine.errorsub()
        node.iiot.resetSubscription()
      })

      subscription.on('item_added', function (monitoredItem: Todo) {
        node.iiot.setMonitoring(monitoredItem)
        node.iiot.updateSubscriptionStatus()
      })
    }

    node.iiot.makeSubscription = function (parameters: Todo) {
      if (checkSessionNotValid(node.iiot.opcuaSession, 'ListenerSubscription')) {
        return
      }

      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return
      } else {
        coreListener.internalDebugLog('Subscription Parameters: ' + JSON.stringify(parameters))
      }

      node.iiot.opcuaSubscription = ClientSubscription.create(node.iiot.opcuaSession, parameters)
      coreListener.internalDebugLog('New Subscription Created')

      if (node.connector) {
        node.iiot.hasOpcUaSubscriptions = true
      }

      node.iiot.setSubscriptionEvents(node.iiot.opcuaSubscription)
      node.iiot.stateMachine.initsub()
    }

    node.iiot.resetSubscription = function () {
      node.iiot.sendAllMonitoredItems('SUBSCRIPTION TERMINATED')
    }

    node.iiot.sendAllMonitoredItems = function (payload: Todo) {
      let addressSpaceItems: Todo[] = []

      node.iiot.monitoredASO.forEach(function (key: Todo) {
        addressSpaceItems.push({ name: '', nodeId: key, datatypeName: '' })
      })

      node.send(({ payload: payload, addressSpaceItems: addressSpaceItems } as Todo))

      node.iiot.monitoredItems.clear()
      node.iiot.monitoredASO.clear()
    }

    node.iiot.subscribeActionInput = function (msg: Todo) {
      if (node.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        node.iiot.messageQueue.push(msg)
      } else {
        node.iiot.subscribeMonitoredItem(msg)
      }
    }

    node.iiot.subscribeEventsInput = function (msg: Todo) {
      if (node.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        node.iiot.messageQueue.push(msg)
      } else {
        node.iiot.subscribeMonitoredEvent(msg)
      }
    }

    node.iiot.updateSubscriptionStatus = function () {
      coreListener.internalDebugLog('listening' + ' (' + node.iiot.monitoredItems.size + ')')
      setNodeStatusTo(node, 'listening' + ' (' + node.iiot.monitoredItems.size + ')', node.oldStatusParameter, node.showStatusActivities, statusHandler)
    }

    node.iiot.handleMonitoringOfGroupedItems = function (msg: Todo) {
      if (node.iiot.monitoredItemGroup && node.iiot.monitoredItemGroup.groupId !== null) {
        node.iiot.monitoredItemGroup.terminate(function (err: Error) {
          if (err) {
            coreListener.internalDebugLog('Monitoring Terminate Error')
            coreListener.internalDebugLog(err)
          }
          node.iiot.monitoredItems.clear()
          node.iiot.monitoredASO.clear()
          node.iiot.monitoredItemGroup.groupId = null
          node.iiot.updateSubscriptionStatus()
        })
      } else {
        coreListener.buildNewMonitoredItemGroup(node, msg, msg.addressSpaceItems, node.iiot.opcuaSubscription)
          .then(function (result: Todo) {
            if (!result.monitoredItemGroup) {
              node.error(new Error('No Monitored Item Group In Result Of NodeOPCUA'))
            } else {
              result.monitoredItemGroup.groupId = _.uniqueId('group_')
              node.iiot.monitoredItemGroup = result.monitoredItemGroup
            }
          }).catch(function (err: Error) {
            coreListener.subscribeDebugLog('Monitoring Build Item Group Error')
            coreListener.subscribeDebugLog(err)
            if (node.showErrors) {
              node.error(err, msg)
            }
          })
      }
    }

    node.iiot.handleMonitoringOfItems = function (msg: Todo) {
      const itemsToMonitor = msg.addressSpaceItems.filter((addressSpaceItem: Todo) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof node.iiot.monitoredASO.get(nodeIdToMonitor) === 'undefined'
      })

      const itemsToTerminate = msg.addressSpaceItems.filter((addressSpaceItem: Todo) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof node.iiot.monitoredASO.get(nodeIdToMonitor) !== 'undefined'
      })

      if (itemsToMonitor.length > 0) {
        const monitorMessage = Object.assign({}, msg)
        monitorMessage.addressSpaceItems = itemsToMonitor
        coreListener.subscribeDebugLog('itemsToMonitor ' + itemsToMonitor.length)
        coreListener.monitorItems(node, monitorMessage, node.iiot.opcuaSubscription)
      }

      if (itemsToTerminate.length > 0) {
        coreListener.subscribeDebugLog('itemsToTerminate ' + itemsToTerminate.length)
        itemsToTerminate.forEach((addressSpaceItem: Todo) => {
          const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
          const item = node.iiot.monitoredASO.get(nodeIdToMonitor)
          if (item && item.monitoredItem) {
            coreListener.subscribeDebugLog('Monitored Item Unsubscribe ' + nodeIdToMonitor)
            item.monitoredItem.terminate(function (err: Error) {
              coreListener.subscribeDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
              node.iiot.monitoredItemTerminated(msg, item.monitoredItem, nodeIdToMonitor, err)
            })
          } else {
            coreListener.subscribeDebugLog('Monitored Item Was Not Monitoring ' + nodeIdToMonitor)
          }
        })
      }
    }

    node.iiot.subscribeMonitoredItem = function (msg: Todo) {
      if (checkSessionNotValid(node.iiot.opcuaSession, 'MonitorListener')) {
        return
      }

      if (!coreListener.checkState(node, msg, 'Monitoring')) {
        return
      }

      if (msg.addressSpaceItems.length) {
        if (node.useGroupItems) {
          node.iiot.handleMonitoringOfGroupedItems(msg)
        } else {
          node.iiot.handleMonitoringOfItems(msg)
        }
      }
    }

    node.iiot.handleEventSubscriptions = function (msg: Todo) {
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

        const item = node.iiot.monitoredASO.get(nodeIdToMonitor)

        if (!item) {
          coreListener.eventDebugLog('Regsiter Event Item ' + nodeIdToMonitor)
          coreListener.buildNewEventItem(nodeIdToMonitor, msg, node.iiot.opcuaSubscription)
            .then(function (result: Todo) {
              if (result.monitoredItem.monitoredItemId) {
                coreListener.eventDebugLog('Event Item Regsitered ' + result.monitoredItem.monitoredItemId + ' to ' + result.nodeId)
                node.iiot.monitoredASO.set(result.nodeId.toString(), {
                  monitoredItem: result.monitoredItem,
                  topic: msg.topic || node.topic
                })
              }
            }).catch(function (err: Error) {
              coreListener.eventDebugLog('Build Event Error')
              coreListener.eventDebugLog(err)
              if (node.showErrors) {
                node.error(err, msg)
              }
            })
        } else {
          coreListener.eventDebugLog('Terminate Event Item' + nodeIdToMonitor)
          const eventMessage = Object.assign({}, msg)
          item.monitoredItem.terminate(function (err: Error) {
            coreListener.eventDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
            node.iiot.monitoredItemTerminated(eventMessage, item.monitoredItem, nodeIdToMonitor, err)
          })
        }
      }
    }

    node.iiot.subscribeMonitoredEvent = function (msg: Todo) {
      if (checkSessionNotValid(node.iiot.opcuaSession, 'EventListener')) {
        return
      }

      if (!coreListener.checkState(node, msg, 'Event')) {
        return
      }

      node.iiot.handleEventSubscriptions(msg)
    }

    node.iiot.monitoredItemTerminated = function (msg: any, monitoredItem: { monitoredItemId: string; }, nodeId: any, err: { message: string; }) {
      if (err) {
        if (monitoredItem && monitoredItem.monitoredItemId) {
          coreListener.internalDebugLog(err.message + ' on ' + monitoredItem.monitoredItemId)
        } else {
          coreListener.internalDebugLog(err.message + ' on monitoredItem')
        }
        if (node.showErrors) {
          node.error(err, msg)
        }
      }
      node.iiot.updateMonitoredItemLists(monitoredItem, nodeId)
    }

    node.iiot.updateMonitoredItemLists = function (monitoredItem: { itemToMonitor: { nodeId: NodeId; }; monitoredItemId: string; }, nodeId: any) {
      coreListener.internalDebugLog('updateMonitoredItemLists = UMIL')

      if (monitoredItem && monitoredItem.itemToMonitor) {
        if (node.iiot.monitoredItems.has(monitoredItem.monitoredItemId)) {
          node.iiot.monitoredItems.delete(monitoredItem.monitoredItemId)
        }

        if (isNodeId(monitoredItem.itemToMonitor.nodeId)) {
          coreListener.internalDebugLog('UMIL Terminate Monitored Item ' + monitoredItem.itemToMonitor.nodeId)
          if (node.iiot.monitoredASO.has(nodeId)) {
            node.iiot.monitoredASO.delete(nodeId)
          }
        } else {
          coreListener.internalDebugLog('UMIL monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
          node.iiot.monitoredASO.forEach(function (value: Todo, key: Todo, map: Todo) {
            coreListener.internalDebugLog('UMIL monitoredItem removing from ASO list key:' + key + ' value ' + value.monitoredItem.monitoredItemId)
            if (value.monitoredItem.monitoredItemId && value.monitoredItem.monitoredItemId === monitoredItem.monitoredItemId) {
              coreListener.internalDebugLog('UMIL monitoredItem removed from ASO list' + key)
              map.delete(key)
            }
          })
        }

        node.iiot.updateSubscriptionStatus()
      }
    }

    node.iiot.setMonitoring = function (monitoredItemToSet: Todo) {
      const monitoredItem = monitoredItemToSet
      if (!monitoredItem || monitoredItem.monitoredItemId === void 0) {
        coreListener.internalDebugLog('monitoredItem Id from server is not valid Id: ' + monitoredItem.monitoredItemId)
        return
      }

      if (!isNodeId(monitoredItem.itemToMonitor.nodeId)) {
        coreListener.internalDebugLog('monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
      }

      coreListener.internalDebugLog('add monitoredItem to list Id:' + monitoredItem.monitoredItemId + ' nodeId: ' + monitoredItem.itemToMonitor.nodeId)
      node.iiot.monitoredItems.set(monitoredItem.monitoredItemId, monitoredItem)

      monitoredItem.on('initialized', function () {
        coreListener.internalDebugLog('monitoredItem ' + monitoredItem.itemToMonitor.nodeId + ' initialized on ' + monitoredItem.monitoredItemId)
      })

      monitoredItem.on('changed', function (dataValue: DataValue[]) {
        coreListener.detailDebugLog('data changed for item: ' + monitoredItem.itemToMonitor.nodeId + ' with Id ' + monitoredItem.monitoredItemId)
        if (!monitoredItem.monitoringParameters.filter) {
          node.iiot.sendDataFromMonitoredItem(monitoredItem, dataValue)
        } else {
          node.iiot.sendDataFromEvent(monitoredItem, dataValue)
        }
      })

      monitoredItem.on('error', function (err: Error) {
        coreListener.internalDebugLog('monitoredItem Error: ' + err.message + ' on ' + monitoredItem.monitoredItemId)
        if (node.showErrors) {
          node.error(err, ({ payload: 'Monitored Item Error', monitoredItem: monitoredItem } as Todo))
        }

        node.iiot.updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)

        if (isSessionBad(err)) {
          node.iiot.sendAllMonitoredItems('BAD SESSION')
          node.iiot.terminateSubscription(() => {
            node.emit('opcua_client_not_ready')
          })
        }
      })

      monitoredItem.on('terminated', function () {
        monitoredItem.removeAllListeners()
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.monitoredItemId)
        node.iiot.updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)
      })
    }

    node.iiot.sendDataFromMonitoredItem = function (monitoredItem: Todo, dataValue: Todo) {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = node.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : node.topic

      let msg: Todo = {
        payload: {},
        topic: topic,
        addressSpaceItems: [{ name: '', nodeId, datatypeName: '' }],
        nodetype: 'listen',
        injectType: 'subscribe'
      }

      coreListener.internalDebugLog('sendDataFromMonitoredItem: ' + msg.addressSpaceItems[0].nodeId)

      let dataValuesString: string
      msg.justValue = node.justValue
      if (node.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for monitored item')
            node.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = { dataValue, monitoredItem }
      }

      node.send(msg)
    }

    node.iiot.handleEventResults = function (msg: Todo, dataValue: Todo, eventResults: string, monitoredItem: Todo) {
      coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

      let dataValuesString: string
      if (node.justValue) {
        dataValuesString = JSON.stringify({ dataValue: dataValue }, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for monitored item')
            node.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = { dataValue, eventResults, monitoredItem }
      }

      node.send(msg)
    }

    node.iiot.sendDataFromEvent = function (monitoredItem: Todo, dataValue: DataValue[]) {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = node.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : node.topic

      let msg = {
        payload: {},
        topic: topic || node.topic, // default if item.topic is empty
        addressSpaceItems: [{ name: '', nodeId: nodeId, datatypeName: '' }],
        nodetype: 'listen',
        injectType: 'event'
      }

      coreListener.analyzeEvent(node.iiot.opcuaSession, node.iiot.getBrowseName, dataValue)
        .then(function (eventResults: Todo) {
          node.iiot.handleEventResults(msg, dataValue, eventResults, monitoredItem)
        }).catch(function (err: Error) {
          (isInitializedIIoTNode(node)) ? node.iiot.errorHandling(err) : coreListener.internalDebugLog(err.message)
        })
    }

    node.iiot.errorHandling = function (err: Error) {
      coreListener.internalDebugLog('Basic Error Handling')
      coreListener.internalDebugLog(err)
      if (node.showErrors) {
        node.error(err, { payload: 'Error Handling' })
      }

      if (err) {
        if (isSessionBad(err)) {
          node.iiot.sendAllMonitoredItems('BAD SESSION')
          node.iiot.terminateSubscription(() => {
            node.emit('opcua_client_not_ready')
          })
        }
      }
    }

    node.iiot.getBrowseName = function (session: Todo, nodeId: Todo, callback: TodoVoidFunction) {
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

    node.iiot.handleListenerInput = function (msg: Todo) {
      switch (node.action) {
        case 'subscribe':
          node.iiot.subscribeMonitoredItem(msg)
          break
        case 'events':
          node.iiot.subscribeMonitoredEvent(msg)
          break
        default:
          node.error(new Error('Type Of Action To Listener Is Not Valid'), msg)
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

    node.on('input', function (msg: Todo) {
      if (!checkConnectorState(node, msg, 'Listener', errorHandler, emitHandler, statusHandler)) {
        return
      }

      if (msg.nodetype === 'browse') { /* browse is just to address listening to many nodes */
        msg.nodetype = 'inject'
        msg.injectType = 'listen'
        msg.addressSpaceItems = buildNodesToListen(msg)
      }

      if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        if (node.showErrors) {
          node.error(new Error('Address-Space-Item Set Not Valid'), msg)
        }
        return
      }

      if (node.iiot.stateMachine.getMachineState() === 'IDLE') {
        node.iiot.messageQueue.push(msg)
        node.iiot.createSubscription(msg)
      } else {
        if (!coreListener.checkState(node, msg, 'Input')) {
          node.iiot.messageQueue.push(msg)
          return
        }
        node.iiot.handleListenerInput(msg)
      }
    })

    const onAlias = (event: string, callback: (...args: any) => void) => {
      if (event == "input") {
        this.on(event, callback)
      } else if (event === "close") {
        this.on(event, callback)
      }
      else this.error('Invalid event to listen on')
    }

    registerToConnector(node, statusHandler, onAlias, errorHandler)

    if (node.connector) {
      node.connector.on('connector_init', () => {
        coreListener.internalDebugLog('Reset Subscription On Connector Init')
        node.iiot.opcuaSubscription = null
        node.iiot.monitoredItems = new Map()
        node.iiot.monitoredASO = new Map()
        node.iiot.stateMachine = coreListener.createStatelyMachine()
        node.iiot.monitoredItemGroup = null
      })

      node.connector.on('connection_stopped', () => {
        node.iiot.terminateSubscription(() => {
          node.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection stopped')
        })
      })

      node.connector.on('connection_end', () => {
        node.iiot.terminateSubscription(() => {
          node.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection ends')
        })
      })

      node.connector.on('connection_reconfigure', () => {
        node.iiot.terminateSubscription(() => {
          node.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection reconfigure')
        })
      })

      node.connector.on('connection_renew', () => {
        node.iiot.terminateSubscription(() => {
          node.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection renew')
        })
      })
    }

    node.iiot.terminateSubscription = function (done: () => void) {
      if (node.iiot.opcuaSubscription && node.iiot.stateMachine.getMachineState() === coreListener.RUNNING_STATE) {
        node.iiot.stateMachine.terminatesub()
        node.iiot.opcuaSubscription.terminate(() => {
          node.iiot.opcuaSubscription.removeAllListeners()
          node.iiot.stateMachine.idlesub()
          done()
        })
      } else {
        node.iiot.stateMachine.idlesub()
        done()
      }
    }

    node.on('close', function (done: () => void) {
      node.iiot.terminateSubscription(() => {
        node.iiot.opcuaSubscription = null
        deregisterToConnector(node, () => {
          resetIiotNode(node)
          done()
        })
        coreListener.internalDebugLog('Close Listener Node')
      })
    })

    /* #########   FSM EVENTS  #########     */

    node.iiot.stateMachine.onIDLE = function () {
      coreListener.detailDebugLog('Listener IDLE Event FSM')
    }

    node.iiot.stateMachine.onREQUESTED = function () {
      coreListener.detailDebugLog('Listener REQUESTED Event FSM')
    }

    node.iiot.stateMachine.onINIT = function () {
      coreListener.detailDebugLog('Listener INIT Event FSM')
    }

    node.iiot.stateMachine.onSTARTED = function () {
      coreListener.detailDebugLog('Listener STARTED Event FSM')

      switch (node.action) {
        case 'subscribe':
          while (node.iiot.messageQueue.length > 0) {
            node.iiot.subscribeMonitoredItem(node.iiot.messageQueue.shift())
          }
          break
        case 'events':
          while (node.iiot.messageQueue.length > 0) {
            node.iiot.subscribeMonitoredEvent(node.iiot.messageQueue.shift())
          }
          break
        default:
          coreListener.internalDebugLog('Unknown Action Type ' + node.action)
      }
    }

    node.iiot.stateMachine.onTERMINATED = function () {
      coreListener.detailDebugLog('Listener TERMINATED Event FSM')
    }

    node.iiot.stateMachine.onERROR = function () {
      coreListener.detailDebugLog('Listener ERROR Event FSM')
    }

    node.iiot.stateMachine.onEND = function () {
      coreListener.detailDebugLog('Listener END Event FSM')
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
