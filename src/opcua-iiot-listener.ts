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
import {TodoTypeAny, TodoVoidFunction} from "./types/placeholders";
import _ from 'underscore';
import coreListener from "./core/opcua-iiot-core-listener";
import {
  buildNodeListFromClient,
  buildNodesToListen,
  checkConnectorState,
  checkSessionNotValid,
  deregisterToConnector, FsmListenerStates,
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
  connector: Node & TodoTypeAny
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


export type ListenPayload = TodoTypeAny &{
  injectType: 'listen',
  value: TodoTypeAny
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

    let self: TodoTypeAny = this;

    self.iiot = coreListener.initListenerNode()


    /* #########   FSM EVENTS  #########     */

    const fsmEventHandlerFunction = function (state: any) {
      if(!state.changed) return

      switch (state.value) {
        case FsmListenerStates.StateStarted:

          coreListener.detailDebugLog('Listener STARTED Event FSM')

          switch (self.action) {
            case 'subscribe':
              while (self.iiot.messageQueue.length > 0) {
                subscribeMonitoredItem(self.iiot.messageQueue.shift())
              }
              break
            case 'events':
              while (self.iiot.messageQueue.length > 0) {
                subscribeMonitoredEvent(self.iiot.messageQueue.shift())
              }
              break
            default:
              coreListener.internalDebugLog('Unknown Action Type ' + self.action)
          }
          break
        case FsmListenerStates.StateIdle:
          coreListener.detailDebugLog('Listener IDLE Event FSM')
          break
        case FsmListenerStates.StateRequested:
          coreListener.detailDebugLog('Listener REQUESTED Event FSM')
          break
        case FsmListenerStates.StateInit:
          coreListener.detailDebugLog('Listener INIT Event FSM')
          break
        case FsmListenerStates.StateTerminated:
          coreListener.detailDebugLog('Listener TERMINATED Event FSM')
          break
        case FsmListenerStates.StateError:
          coreListener.detailDebugLog('Listener ERROR Event FSM')
          break
        case FsmListenerStates.StateEnd:
          coreListener.detailDebugLog('Listener END Event FSM')
          break
        default:
          coreListener.detailDebugLog('Listener NO VALID FSM EVENT')
      }
    }

    self.iiot.stateMachine = coreListener.createListenerStateMachine()
    self.iiot.stateService = coreListener.startListenerMachineService(self.iiot.stateMachine)
    self.iiot.stateSubscription = coreListener.subscribeListenerFSMService(self.iiot.stateService, fsmEventHandlerFunction)
    coreListener.internalDebugLog('Start FSM: ' + self.iiot.stateService.state.value)

    const createSubscription = (msg: TodoTypeAny) => {

      if (self.iiot.stateService.state.value !== FsmListenerStates.StateIdle) {
        coreListener.internalDebugLog('New Subscription Request On State ' + self.iiot.stateService.state.value)
        return
      }

      coreListener.internalDebugLog('Create Subscription On State ' + self.iiot.stateService.state.value)

      if (self.iiot?.opcuaSubscription) {
        self.iiot.opcuaSubscription = null
      }

      self.iiot.stateService.send('REQUESTINIT')

      const timeMilliseconds = (typeof msg.payload.value === 'number') ? msg.payload.value : null
      const dynamicOptions = (msg.payload.listenerParameters) ? msg.payload.listenerParameters.options : msg.payload.options
      coreListener.internalDebugLog('create subscription, type: ' + self.action)
      const options = dynamicOptions ||
      self.action === 'events'
        ? coreListener.getEventSubscriptionParameters(timeMilliseconds)
        : coreListener.getSubscriptionParameters(timeMilliseconds);


      makeSubscription(options)
    }

    const setSubscriptionEvents = (subscription: ClientSubscription) => {

      subscription.on('started', () => {
        coreListener.internalDebugLog('Subscription started')
        self.oldStatusParameter = setNodeStatusTo(this, 'started', self.oldStatusParameter, self.showStatusActivities, statusHandler)
        self.iiot.monitoredItems.clear()
        self.iiot.stateService.send('START')
      })

      subscription.on('terminated', () => {
        coreListener.internalDebugLog('Subscription terminated')
        self.oldStatusParameter = setNodeStatusTo(this, 'terminated', self.oldStatusParameter, self.showStatusActivities, statusHandler)
        self.iiot.stateService.send('TERMINATE')
        self.iiot.stateService.send('IDLE')
        resetSubscription()
      })

      subscription.on('internal_error', (err: Error) => {
        coreListener.internalDebugLog('internal_error: ' + err.message)
        if (self.showErrors) {
          this.error(err, {payload: 'Internal Error'})
        }
        self.oldStatusParameter = setNodeStatusTo(this, 'error', self.oldStatusParameter, self.showStatusActivities, statusHandler)
        self.iiot.stateService.send('ERROR')
        resetSubscription()
      })

      subscription.on('item_added', (monitoredItem: ClientMonitoredItem) => {
        setMonitoring(monitoredItem)
        updateSubscriptionStatus()
      })
    }

    const makeSubscription = function (parameters: ClientSubscriptionOptions) {
      if (checkSessionNotValid(self.connector.iiot.opcuaSession, 'ListenerSubscription')) {
        return
      }
      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return
      } else {
        coreListener.internalDebugLog('Subscription Parameters: ' + JSON.stringify(parameters))
      }
      self.iiot.opcuaSubscription = ClientSubscription.create(self.connector.iiot.opcuaSession, parameters)
      coreListener.internalDebugLog('New Subscription Created')

      if (self.connector) {
        self.iiot.hasOpcUaSubscriptions = true
      }
      setSubscriptionEvents(self.iiot.opcuaSubscription)
      self.iiot.stateService.send('INIT')
    }

    const resetSubscription = function () {
      sendAllMonitoredItems('SUBSCRIPTION TERMINATED')
    }

    const sendAllMonitoredItems = (payload: TodoTypeAny) => {
      let addressSpaceItems: TodoTypeAny[] = []

      self.iiot.monitoredASO.forEach(function (key: TodoTypeAny) {
        addressSpaceItems.push({name: '', nodeId: key, datatypeName: ''})
      })

      this.send(({payload: payload, addressSpaceItems: addressSpaceItems} as TodoTypeAny))

      self.iiot.monitoredItems.clear()
      self.iiot.monitoredASO.clear()
    }

    const subscribeActionInput = function (msg: TodoTypeAny) {
      if (self.iiot.stateService.state.value !== coreListener.RUNNING_STATE) {
        self.iiot.messageQueue.push(msg)
      } else {
        subscribeMonitoredItem(msg)
      }
    }

    const subscribeEventsInput = function (msg: TodoTypeAny) {
      if (self.iiot.stateService.state.value !== coreListener.RUNNING_STATE) {
        self.iiot.messageQueue.push(msg)
      } else {
        subscribeMonitoredEvent(msg)
      }
    }

    const updateSubscriptionStatus = () => {
      coreListener.internalDebugLog('listening' + ' (' + self.iiot.monitoredItems.size + ')')
      self.oldStatusParameter = setNodeStatusTo(this, 'listening' + ' (' + self.iiot.monitoredItems.size + ')', self.oldStatusParameter, self.showStatusActivities, statusHandler)
    }

    const handleMonitoringOfGroupedItems = (msg: TodoTypeAny) => {
      if (self.iiot.monitoredItemGroup && self.iiot.monitoredItemGroup.groupId !== null) {
        self.iiot.monitoredItemGroup.terminate(function (err: Error) {
          if (err) {
            coreListener.internalDebugLog('Monitoring Terminate Error')
            coreListener.internalDebugLog(err)
          }
          self.iiot.monitoredItems.clear()
          self.iiot.monitoredASO.clear()
          self.iiot.monitoredItemGroup.groupId = null
          updateSubscriptionStatus()
        })
      } else {
        coreListener.buildNewMonitoredItemGroup(this, msg, msg.payload.addressSpaceItems, self.iiot.opcuaSubscription)
          .then((result: TodoTypeAny) => {
            if (!result.monitoredItemGroup) {
              this.error(new Error('No Monitored Item Group In Result Of NodeOPCUA'))
            } else {
              result.monitoredItemGroup.groupId = _.uniqueId('group_')
              self.iiot.monitoredItemGroup = result.monitoredItemGroup
            }
          }).catch((err: Error) => {
          coreListener.subscribeDebugLog('Monitoring Build Item Group Error')
          coreListener.subscribeDebugLog(err)
          if (self.showErrors) {
            this.error(err, msg)
          }
        })
      }
    }

    const handleMonitoringOfItems = (msg: TodoTypeAny) => {
      const itemsToMonitor = msg.payload.addressSpaceItems.filter((addressSpaceItem: TodoTypeAny) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof self.iiot.monitoredASO.get(nodeIdToMonitor) === 'undefined'
      })

      const itemsToTerminate = msg.payload.addressSpaceItems.filter((addressSpaceItem: TodoTypeAny) => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof self.iiot.monitoredASO.get(nodeIdToMonitor) !== 'undefined'
      })

      if (itemsToMonitor.length > 0) {
        const monitorMessage = Object.assign({}, msg)
        monitorMessage.addressSpaceItems = itemsToMonitor
        coreListener.subscribeDebugLog('itemsToMonitor ' + itemsToMonitor.length)
        coreListener.monitorItems(this, monitorMessage, self.iiot.opcuaSubscription)
      }

      if (itemsToTerminate.length > 0) {
        coreListener.subscribeDebugLog('itemsToTerminate ' + itemsToTerminate.length)
        itemsToTerminate.forEach((addressSpaceItem: TodoTypeAny) => {
          const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
          const item = self.iiot.monitoredASO.get(nodeIdToMonitor)
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

    const subscribeMonitoredItem = (msg: TodoTypeAny) => {
      if (checkSessionNotValid(self?.connector?.iiot?.opcuaSession, 'MonitorListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Monitoring')) {
        return
      }
      if (!msg.payload.addressSpaceItems?.length) {
        msg.payload.addressSpaceItems = msg.payload.browseResults
      }
      if (msg.payload.addressSpaceItems?.length) {
        if (self.useGroupItems) {
          handleMonitoringOfGroupedItems(msg)
        } else {
          handleMonitoringOfItems(msg)
        }
      } else {
        self.oldStatusParameter = setNodeStatusTo(self, 'error', self.oldStatusParameter, true, statusHandler)
        this.send({
          ...msg,
          payload: {
            status: 'error',
            message: 'No address space items to monitor'
          }
        })
      }
    }

    const handleEventSubscriptions = (msg: TodoTypeAny) => {
      msg.payload.addressSpaceItems.forEach((addressSpaceItem: TodoTypeAny) => {
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

        const item = self.iiot.monitoredASO.get(nodeIdToMonitor)

        if (!item) {
          coreListener.eventDebugLog('Register Event Item ' + nodeIdToMonitor)
          coreListener.buildNewEventItem(nodeIdToMonitor, msg, self.iiot.opcuaSubscription)
            .then(function (result: TodoTypeAny) {
              if (result.monitoredItem.itemToMonitor.nodeId) {
                coreListener.eventDebugLog('Event Item Registered ' + result.monitoredItem.itemToMonitor.nodeId + ' to ' + result.nodeId)
                self.iiot.monitoredASO.set(result?.nodeId?.toString(), {
                  monitoredItem: result.monitoredItem,
                  topic: msg.topic || self.topic
                })
              }
            }).catch((err: Error) => {
            coreListener.eventDebugLog('Build Event Error')
            coreListener.eventDebugLog(err)
            if (self.showErrors) {
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

    const subscribeMonitoredEvent = (msg: TodoTypeAny) => {
      if (checkSessionNotValid(self.connector.iiot.opcuaSession, 'EventListener')) {
        return
      }

      if (!coreListener.checkState(this, msg, 'Event')) {
        return
      }

      handleEventSubscriptions(msg)
    }

    const monitoredItemTerminated = (msg: any, monitoredItem: TodoTypeAny, nodeId: any, err: { message: string; }) => {
      if (err) {
        if (monitoredItem && monitoredItem.itemToMonitor.nodeId) {
          coreListener.internalDebugLog(err.message + ' on ' + monitoredItem.itemToMonitor.nodeId)
        } else {
          coreListener.internalDebugLog(err.message + ' on monitoredItem')
        }
        if (self.showErrors) {
          this.error(err, msg)
        }
      }
      updateMonitoredItemLists(monitoredItem, nodeId)
    }

    const updateMonitoredItemLists = function (monitoredItem: TodoTypeAny, nodeId: any) {
      coreListener.internalDebugLog('updateMonitoredItemLists = UMIL')

      if (monitoredItem && monitoredItem.itemToMonitor) {
        if (self.iiot.monitoredItems.has(monitoredItem?.itemToMonitor?.nodeId?.toString())) {
          self.iiot.monitoredItems.delete(monitoredItem?.itemToMonitor?.nodeId?.toString())
        }

        if (isNodeId(monitoredItem.itemToMonitor.nodeId)) {
          coreListener.internalDebugLog('UMIL Terminate Monitored Item ' + monitoredItem.itemToMonitor.nodeId)
          if (self.iiot.monitoredASO.has(nodeId)) {
            self.iiot.monitoredASO.delete(nodeId)
          }
        } else {
          coreListener.internalDebugLog('UMIL monitoredItem NodeId is not valid Id:' + monitoredItem.itemToMonitor.nodeId)
          self.iiot.monitoredASO.forEach(function (value: TodoTypeAny, key: TodoTypeAny, map: TodoTypeAny) {
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
      self.iiot.monitoredItems.set(monitoredItem?.itemToMonitor?.nodeId?.toString(), monitoredItem)

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
        if (self.showErrors) {
          this.error(error, ({payload: 'Monitored Item Error', monitoredItem: monitoredItem} as TodoTypeAny))
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
      monitoredItem.on('terminated', (err: TodoTypeAny) => {
        monitoredItem.removeAllListeners()
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.itemToMonitor.nodeId)
        updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)
      })
    }

    const sendDataFromMonitoredItem = (monitoredItem: TodoTypeAny, dataValue: TodoTypeAny) => {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem?.itemToMonitor?.nodeId?.toString() : 'invalid'
      const item = self.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : self.topic

      let msg: TodoTypeAny = {
        payload: {
          addressSpaceItems: [{name: '', nodeId, datatypeName: ''}],
          nodeId,
          nodetype: 'listen',
          injectType: 'subscribe'
        },
        topic: topic,
      }

      coreListener.internalDebugLog('sendDataFromMonitoredItem: ' + msg.payload.addressSpaceItems[0].nodeId)

      let dataValuesString: string
      msg.justValue = self.justValue
      if (self.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg.payload, 'value', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (self.showErrors) {
            this.warn('JSON not to parse from string for monitored item')
            this.error(err, msg)
          }

          msg.payload.value = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = {
          ... msg.payload,
          value: dataValue,
          statusCode: monitoredItem.statusCode,
          itemToMonitor: monitoredItem.itemToMonitor,
          monitoredItemId: monitoredItem.itemToMonitor
        }
      }

      this.send(msg)
    }

    const handleEventResults = (msg: TodoTypeAny, dataValue: TodoTypeAny, eventResults: string, monitoredItem: TodoTypeAny) => {
      coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

      let dataValuesString: string
      if (self.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg.payload, 'value', JSON.parse(dataValuesString))
        } catch (err: any) {
          if (self.showErrors) {
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
      const item = self.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : self.topic

      let msg = {
        payload: {
          addressSpaceItems: [{name: '', nodeId: nodeId, datatypeName: ''}],
          nodeId,
          nodetype: 'listen',
          injectType: 'event'
        },
        topic: topic || self.topic, // default if item.topic is empty
      }

      coreListener.analyzeEvent(self.connector.iiot.opcuaSession, getBrowseName, dataValue)
        .then((eventResults: TodoTypeAny) => {
          handleEventResults(msg, dataValue, eventResults, monitoredItem)
        }).catch((err: Error) => {
        (isInitializedIIoTNode(this)) ? errorHandling(err) : coreListener.internalDebugLog(err.message)
      })
    }

    const errorHandling = (err: Error) => {
      coreListener.internalDebugLog('Basic Error Handling')
      coreListener.internalDebugLog(err)
      if (self.showErrors) {
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

    const getBrowseName = function (session: TodoTypeAny, nodeId: TodoTypeAny, callback: TodoVoidFunction) {
      coreClient.read(session, [{
        nodeId: nodeId,
        attributeId: AttributeIds.BrowseName
      }], 12, function (err: Error, org: TodoTypeAny, readValue: TodoTypeAny[]) {
        if (!err) {
          if (readValue[0].statusCode === StatusCodes.Good) {
            let browseName = readValue[0].value.value.name
            return callback(null, browseName)
          }
        }
        callback(err, 'Unknown')
      })
    }

    const handleListenerInput = (msg: TodoTypeAny) => {
      switch (self.action) {
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
      if (!checkConnectorState(self, msg, 'Listener', errorHandler, emitHandler, statusHandler)) {
        return
      }
      const payload = msg.payload as EventPayloadLike

      const outputPayload = {
        ...payload,
        nodetype: payload.nodetype === 'browse' ? 'inject' : payload.nodetype,
        injectType: payload.nodetype === 'browse' ? 'listen' : payload.injectType,
        addressSpaceItems: buildNodeListFromClient(payload)
      }

      const outputMessage = {
        ...msg,
        payload: outputPayload
      }

      if (!outputPayload.addressSpaceItems || !outputPayload.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        if (self.showErrors) {
          this.error(new Error('Address-Space-Item Set Not Valid'), msg)
        }
        return
      }

      if (self.iiot.stateService.state.value === FsmListenerStates.StateIdle) {
        self.iiot.messageQueue.push(outputMessage)
        createSubscription(outputMessage)
      } else {
        if (!coreListener.checkState(self, outputMessage, 'Input')) {
          self.iiot.messageQueue.push(outputMessage)
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

    if (self.connector) {
      self.connector.on('connector_init', () => {
        coreListener.internalDebugLog('Reset Subscription On Connector Init')
        if (self.iiot?.opcuaSubscription) {
          self.iiot.opcuaSubscription = null
        }

        self.iiot.monitoredItems = new Map()
        self.iiot.monitoredASO = new Map()
        self.iiot.stateMachine = coreListener.createListenerStateMachine()
        self.iiot.monitoredItemGroup = null
      })

      self.connector.on('connection_stopped', () => {
        terminateSubscription(() => {
          if (self.iiot?.opcuaSubscription)
            self.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection stopped')
        })
      })

      self.connector.on('connection_end', () => {
        terminateSubscription(() => {
          if (self.iiot?.opcuaSubscription) {
            self.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection ends')
        })
      })

      self.connector.on('connection_reconfigure', () => {
        terminateSubscription(() => {
          if (self.iiot?.opcuaSubscription) {
            self.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection reconfigure')
        })
      })

      self.connector.on('connection_renew', () => {
        terminateSubscription(() => {
          if (self.iiot?.opcuaSubscription) {
            self.iiot.opcuaSubscription = null
          }
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection renew')
        })
      })
    }

    const terminateSubscription = function (done: () => void) {
      if (self.iiot?.opcuaSubscription && self.iiot?.stateService.state.value === coreListener.RUNNING_STATE) {
        self.iiot.stateService.send('TERMINATE')
        self.iiot.opcuaSubscription.terminate(() => {
          self.iiot.opcuaSubscription.removeAllListeners()
          self.iiot.stateService.send('IDLE')
          done()
        })
      } else {
        self.iiot.stateService.send('IDLE')
        done()
      }
    }

    if (process.env.TEST === 'true') {
      self.functions = {
        createSubscription,
        subscribeActionInput,
        subscribeMonitoredItem,
        monitoredItemTerminated,
        errorHandling,
        setMonitoring
      }
    }

    this.on('close', (done: () => void) => {
      coreListener.internalDebugLog('Close Listener Node - start with terminate of the OPC UA subscription')
      self.removeAllListeners()

      terminateSubscription(() => {

        if (self.iiot?.opcuaSubscription) {
          self.iiot.opcuaSubscription = null
        }

        coreListener.internalDebugLog('Close Listener Node - start with signal to deregister in the connector')
        deregisterToConnector(self, () => {
          resetIiotNode(self)
          done()
          coreListener.internalDebugLog('Close of Listener Node done')
        })

        coreListener.internalDebugLog('Close Listener Node')
      })
    })

/*
    self.iiot.stateMachine.onIDLE = function () {
      coreListener.detailDebugLog('Listener IDLE Event FSM')
    }

    self.iiot.stateMachine.onREQUESTED = function () {
      coreListener.detailDebugLog('Listener REQUESTED Event FSM')
    }

    self.iiot.stateMachine.onINIT = function () {
      coreListener.detailDebugLog('Listener INIT Event FSM')
    }

    self.iiot.stateMachine.onSTARTED = function () {
      coreListener.detailDebugLog('Listener STARTED Event FSM')

      switch (self.action) {
        case 'subscribe':
          while (self.iiot.messageQueue.length > 0) {
            subscribeMonitoredItem(self.iiot.messageQueue.shift())
          }
          break
        case 'events':
          while (self.iiot.messageQueue.length > 0) {
            subscribeMonitoredEvent(self.iiot.messageQueue.shift())
          }
          break
        default:
          coreListener.internalDebugLog('Unknown Action Type ' + self.action)
      }
    }

    self.iiot.stateMachine.onTERMINATED = function () {
      coreListener.detailDebugLog('Listener TERMINATED Event FSM')
    }

    self.iiot.stateMachine.onERROR = function () {
      coreListener.detailDebugLog('Listener ERROR Event FSM')
    }

    self.iiot.stateMachine.onEND = function () {
      coreListener.detailDebugLog('Listener END Event FSM')
    }
    */
  }



  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
