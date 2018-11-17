/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Listener Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreListener = require('./core/opcua-iiot-core-listener')
  let Map = require('es6-map')
  const _ = require('underscore')

  function OPCUAIIoTListener (config) {
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

    let node = coreListener.initListenerNode(this)
    coreListener.core.assert(node.bianco.iiot)

    const StatusCodes = coreListener.core.nodeOPCUA.StatusCodes
    const AttributeIds = coreListener.core.nodeOPCUA.AttributeIds

    node.bianco.iiot.stateMachine = coreListener.createStatelyMachine()
    coreListener.internalDebugLog('Start FSM: ' + node.bianco.iiot.stateMachine.getMachineState())
    coreListener.detailDebugLog('FSM events:' + node.bianco.iiot.stateMachine.getMachineEvents())

    node.bianco.iiot.createSubscription = function (msg) {
      if (node.bianco.iiot.stateMachine.getMachineState() !== 'IDLE') {
        coreListener.internalDebugLog('New Subscription Request On State ' + node.bianco.iiot.stateMachine.getMachineState())
        return
      }
      coreListener.internalDebugLog('Create Subscription On State ' + node.bianco.iiot.stateMachine.getMachineState())
      node.bianco.iiot.opcuaSubscription = null
      node.bianco.iiot.stateMachine.requestinitsub()

      const timeMilliseconds = (typeof msg.payload === 'number') ? msg.payload : null
      const dynamicOptions = (msg.payload.listenerParameters) ? msg.payload.listenerParameters.options : msg.payload.options

      if (node.action !== 'events') {
        coreListener.internalDebugLog('create monitoring subscription')
        const monitoringOptions = dynamicOptions || coreListener.getSubscriptionParameters(timeMilliseconds)
        node.bianco.iiot.makeSubscription(monitoringOptions)
      } else {
        coreListener.internalDebugLog('create event subscription')
        const eventOptions = dynamicOptions || coreListener.getEventSubscribtionParameters(timeMilliseconds)
        node.bianco.iiot.makeSubscription(eventOptions)
      }
    }

    node.bianco.iiot.setSubscriptionEvents = function (subscription) {
      subscription.on('started', function () {
        coreListener.internalDebugLog('Subscription started')
        coreListener.core.setNodeStatusTo(node, 'started')
        node.bianco.iiot.monitoredItems.clear()
        node.bianco.iiot.stateMachine.startsub()
      })

      subscription.on('terminated', function () {
        coreListener.internalDebugLog('Subscription terminated')
        coreListener.core.setNodeStatusTo(node, 'terminated')
        node.bianco.iiot.stateMachine.terminatesub().idlesub()
        node.bianco.iiot.resetSubscription()
      })

      subscription.on('internal_error', function (err) {
        coreListener.internalDebugLog('internal_error: ' + err.message)
        if (node.showErrors) {
          node.error(err, {payload: 'Internal Error'})
        }
        coreListener.core.setNodeStatusTo(node, 'error')
        node.bianco.iiot.stateMachine.errorsub()
        node.bianco.iiot.resetSubscription()
      })

      subscription.on('item_added', function (monitoredItem) {
        node.bianco.iiot.setMonitoring(monitoredItem)
        node.bianco.iiot.updateSubscriptionStatus()
      })
    }

    node.bianco.iiot.makeSubscription = function (parameters) {
      if (coreListener.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'ListenerSubscription')) {
        return
      }

      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return
      } else {
        coreListener.internalDebugLog('Subscription Parameters: ' + JSON.stringify(parameters))
      }

      node.bianco.iiot.opcuaSubscription = new coreListener.core.nodeOPCUA.ClientSubscription(node.bianco.iiot.opcuaSession, parameters)
      coreListener.internalDebugLog('New Subscription Created')

      if (node.connector) {
        node.connector.bianco.iiot.hasOpcUaSubscriptions = true
      }

      node.bianco.iiot.setSubscriptionEvents(node.bianco.iiot.opcuaSubscription)
      node.bianco.iiot.stateMachine.initsub()
    }

    node.bianco.iiot.resetSubscription = function () {
      node.bianco.iiot.sendAllMonitoredItems('SUBSCRIPTION TERMINATED')
    }

    node.bianco.iiot.sendAllMonitoredItems = function (payload) {
      let addressSpaceItems = []

      node.bianco.iiot.monitoredASO.forEach(function (value, key) {
        addressSpaceItems.push({name: '', nodeId: key, datatypeName: ''})
      })

      node.send({payload: payload, addressSpaceItems: addressSpaceItems})

      node.bianco.iiot.monitoredItems.clear()
      node.bianco.iiot.monitoredASO.clear()
    }

    node.bianco.iiot.subscribeActionInput = function (msg) {
      if (node.bianco.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        node.bianco.iiot.messageQueue.push(msg)
      } else {
        node.bianco.iiot.subscribeMonitoredItem(msg)
      }
    }

    node.bianco.iiot.subscribeEventsInput = function (msg) {
      if (node.bianco.iiot.stateMachine.getMachineState() !== coreListener.RUNNING_STATE) {
        node.bianco.iiot.messageQueue.push(msg)
      } else {
        node.bianco.iiot.subscribeMonitoredEvent(msg)
      }
    }

    node.bianco.iiot.updateSubscriptionStatus = function () {
      coreListener.internalDebugLog('listening' + ' (' + node.bianco.iiot.monitoredItems.size + ')')
      coreListener.core.setNodeStatusTo(node, 'listening' + ' (' + node.bianco.iiot.monitoredItems.size + ')')
    }

    node.bianco.iiot.handleMonitoringOfGroupedItems = function (msg) {
      if (node.bianco.iiot.monitoredItemGroup && node.bianco.iiot.monitoredItemGroup.groupId !== null) {
        node.bianco.iiot.monitoredItemGroup.terminate(function (err) {
          if (err) {
            coreListener.internalDebugLog('Monitoring Terminate Error')
            coreListener.internalDebugLog(err)
          }
          node.bianco.iiot.monitoredItems.clear()
          node.bianco.iiot.monitoredASO.clear()
          node.bianco.iiot.monitoredItemGroup.groupId = null
          node.bianco.iiot.updateSubscriptionStatus()
        })
      } else {
        coreListener.buildNewMonitoredItemGroup(node, msg, msg.addressSpaceItems, node.bianco.iiot.opcuaSubscription)
          .then(function (result) {
            if (!result.monitoredItemGroup) {
              node.error(new Error('No Monitored Item Group In Result Of NodeOPCUA'))
            } else {
              result.monitoredItemGroup.groupId = _.uniqueId('group_')
              node.bianco.iiot.monitoredItemGroup = result.monitoredItemGroup
            }
          }).catch(function (err) {
            coreListener.subscribeDebugLog('Monitoring Build Item Group Error')
            coreListener.subscribeDebugLog(err)
            if (node.showErrors) {
              node.error(err, msg)
            }
          })
      }
    }

    node.bianco.iiot.handleMonitoringOfItems = function (msg) {
      const itemsToMonitor = msg.addressSpaceItems.filter(addressSpaceItem => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof node.bianco.iiot.monitoredASO.get(nodeIdToMonitor) === 'undefined'
      })

      const itemsToTerminate = msg.addressSpaceItems.filter(addressSpaceItem => {
        const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
        return typeof node.bianco.iiot.monitoredASO.get(nodeIdToMonitor) !== 'undefined'
      })

      if (itemsToMonitor.length > 0) {
        const monitorMessage = Object.assign({}, msg)
        monitorMessage.addressSpaceItems = itemsToMonitor
        coreListener.subscribeDebugLog('itemsToMonitor ' + itemsToMonitor.length)
        coreListener.monitorItems(node, monitorMessage, node.bianco.iiot.opcuaSubscription)
      }

      if (itemsToTerminate.length > 0) {
        coreListener.subscribeDebugLog('itemsToTerminate ' + itemsToTerminate.length)
        itemsToTerminate.forEach((addressSpaceItem) => {
          const nodeIdToMonitor = (typeof addressSpaceItem.nodeId === 'string') ? addressSpaceItem.nodeId : addressSpaceItem.nodeId.toString()
          const item = node.bianco.iiot.monitoredASO.get(nodeIdToMonitor)
          if (item && item.monitoredItem) {
            coreListener.subscribeDebugLog('Monitored Item Unsubscribe ' + nodeIdToMonitor)
            item.monitoredItem.terminate(function (err) {
              coreListener.subscribeDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
              node.bianco.iiot.monitoredItemTerminated(msg, item.monitoredItem, nodeIdToMonitor, err)
            })
          } else {
            coreListener.subscribeDebugLog('Monitored Item Was Not Monitoring ' + nodeIdToMonitor)
          }
        })
      }
    }

    node.bianco.iiot.subscribeMonitoredItem = function (msg) {
      if (coreListener.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'MonitorListener')) {
        return
      }

      if (!coreListener.checkState(node, msg, 'Monitoring')) {
        return
      }

      if (msg.addressSpaceItems.length) {
        if (node.useGroupItems) {
          node.bianco.iiot.handleMonitoringOfGroupedItems(msg)
        } else {
          node.bianco.iiot.handleMonitoringOfItems(msg)
        }
      }
    }

    node.bianco.iiot.handleEventSubscriptions = function (msg) {
      for (let addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          coreListener.eventDebugLog('Address Space Item Not Valid to Monitor Event Of ' + addressSpaceItem)
          return
        }

        if (addressSpaceItem.datatypeName === 'ns=0;i=0') {
          coreListener.subscribeDebugLog('Address Space Item Not Allowed to Monitor ' + addressSpaceItem)
          return
        }

        let nodeIdToMonitor
        if (typeof addressSpaceItem.nodeId === 'string') {
          nodeIdToMonitor = addressSpaceItem.nodeId
        } else {
          nodeIdToMonitor = addressSpaceItem.nodeId.toString()
        }

        const item = node.bianco.iiot.monitoredASO.get(nodeIdToMonitor)

        if (!item) {
          coreListener.eventDebugLog('Regsiter Event Item ' + nodeIdToMonitor)
          coreListener.buildNewEventItem(nodeIdToMonitor, msg, node.bianco.iiot.opcuaSubscription)
            .then(function (result) {
              if (result.monitoredItem.monitoredItemId) {
                coreListener.eventDebugLog('Event Item Regsitered ' + result.monitoredItem.monitoredItemId + ' to ' + result.nodeId)
                node.bianco.iiot.monitoredASO.set(result.nodeId.toString(), {
                  monitoredItem: result.monitoredItem,
                  topic: msg.topic || node.topic
                })
              }
            }).catch(function (err) {
              coreListener.eventDebugLog('Build Event Error')
              coreListener.eventDebugLog(err)
              if (node.showErrors) {
                node.error(err, msg)
              }
            })
        } else {
          coreListener.eventDebugLog('Terminate Event Item' + nodeIdToMonitor)
          const eventMessage = Object.assign({}, msg)
          item.monitoredItem.terminate(function (err) {
            coreListener.eventDebugLog('Terminated Monitored Item ' + item.monitoredItem.itemToMonitor.nodeId)
            node.bianco.iiot.monitoredItemTerminated(eventMessage, item.monitoredItem, nodeIdToMonitor, err)
          })
        }
      }
    }

    node.bianco.iiot.subscribeMonitoredEvent = function (msg) {
      if (coreListener.core.checkSessionNotValid(node.bianco.iiot.opcuaSession, 'EventListener')) {
        return
      }

      if (!coreListener.checkState(node, msg, 'Event')) {
        return
      }

      node.bianco.iiot.handleEventSubscriptions(msg)
    }

    node.bianco.iiot.monitoredItemTerminated = function (msg, monitoredItem, nodeId, err) {
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
      node.bianco.iiot.updateMonitoredItemLists(monitoredItem, nodeId)
    }

    node.bianco.iiot.updateMonitoredItemLists = function (monitoredItem, nodeId) {
      coreListener.internalDebugLog('updateMonitoredItemLists = UMIL')

      if (monitoredItem && monitoredItem.itemToMonitor) {
        if (node.bianco.iiot.monitoredItems.has(monitoredItem.monitoredItemId)) {
          node.bianco.iiot.monitoredItems.delete(monitoredItem.monitoredItemId)
        }

        if (coreListener.core.isNodeId(monitoredItem.itemToMonitor.nodeId)) {
          coreListener.internalDebugLog('UMIL Terminate Monitored Item ' + monitoredItem.itemToMonitor.nodeId)
          if (node.bianco.iiot.monitoredASO.has(nodeId)) {
            node.bianco.iiot.monitoredASO.delete(nodeId)
          }
        } else {
          coreListener.internalDebugLog('UMIL monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
          node.bianco.iiot.monitoredASO.forEach(function (value, key, map) {
            coreListener.internalDebugLog('UMIL monitoredItem removing from ASO list key:' + key + ' value ' + value.monitoredItem.monitoredItemId)
            if (value.monitoredItem.monitoredItemId && value.monitoredItem.monitoredItemId === monitoredItem.monitoredItemId) {
              coreListener.internalDebugLog('UMIL monitoredItem removed from ASO list' + key)
              map.delete(key)
            }
          })
        }

        node.bianco.iiot.updateSubscriptionStatus()
      }
    }

    node.bianco.iiot.setMonitoring = function (monitoredItemToSet) {
      const monitoredItem = monitoredItemToSet
      if (!monitoredItem || monitoredItem.monitoredItemId === void 0) {
        coreListener.internalDebugLog('monitoredItem Id from server is not valid Id: ' + monitoredItem.monitoredItemId)
        return
      }

      if (!coreListener.core.isNodeId(monitoredItem.itemToMonitor.nodeId)) {
        coreListener.internalDebugLog('monitoredItem NodeId is not valid Id:' + monitoredItem.monitoredItemId)
      }

      coreListener.internalDebugLog('add monitoredItem to list Id:' + monitoredItem.monitoredItemId + ' nodeId: ' + monitoredItem.itemToMonitor.nodeId)
      node.bianco.iiot.monitoredItems.set(monitoredItem.monitoredItemId, monitoredItem)

      monitoredItem.on('initialized', function () {
        coreListener.internalDebugLog('monitoredItem ' + monitoredItem.itemToMonitor.nodeId + ' initialized on ' + monitoredItem.monitoredItemId)
      })

      monitoredItem.on('changed', function (dataValue) {
        coreListener.detailDebugLog('data changed for item: ' + monitoredItem.itemToMonitor.nodeId + ' with Id ' + monitoredItem.monitoredItemId)
        if (!monitoredItem.monitoringParameters.filter) {
          node.bianco.iiot.sendDataFromMonitoredItem(monitoredItem, dataValue)
        } else {
          node.bianco.iiot.sendDataFromEvent(monitoredItem, dataValue)
        }
      })

      monitoredItem.on('error', function (err) {
        coreListener.internalDebugLog('monitoredItem Error: ' + err.message + ' on ' + monitoredItem.monitoredItemId)
        if (node.showErrors) {
          node.error(err, {payload: 'Monitored Item Error', monitoredItem: monitoredItem})
        }

        node.bianco.iiot.updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)

        if (coreListener.core.isSessionBad(err)) {
          node.bianco.iiot.sendAllMonitoredItems('BAD SESSION')
          node.bianco.iiot.terminateSubscription(() => {
            node.emit('opcua_client_not_ready')
          })
        }
      })

      monitoredItem.on('terminated', function () {
        monitoredItem.removeAllListeners()
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.monitoredItemId)
        node.bianco.iiot.updateMonitoredItemLists(monitoredItem, monitoredItem.itemToMonitor.nodeId)
      })
    }

    node.bianco.iiot.sendDataFromMonitoredItem = function (monitoredItem, dataValue) {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (coreListener.core.isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = node.bianco.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : node.topic

      let msg = {
        payload: {},
        topic: topic,
        addressSpaceItems: [{name: '', nodeId, datatypeName: ''}],
        nodetype: 'listen',
        injectType: 'subscribe'
      }

      coreListener.internalDebugLog('sendDataFromMonitoredItem: ' + msg.addressSpaceItems[0].nodeId)

      let dataValuesString = {}
      msg.justValue = node.justValue
      if (node.justValue) {
        dataValuesString = JSON.stringify(dataValue, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for monitored item')
            node.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = {dataValue, monitoredItem}
      }

      node.send(msg)
    }

    node.bianco.iiot.handleEventResults = function (msg, dataValue, eventResults, monitoredItem) {
      coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

      let dataValuesString = {}
      if (node.justValue) {
        dataValuesString = JSON.stringify({dataValue: dataValue}, null, 2)
        try {
          RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
        } catch (err) {
          if (node.showErrors) {
            node.warn('JSON not to parse from string for monitored item')
            node.error(err, msg)
          }

          msg.payload = dataValuesString
          msg.error = err.message
        }
      } else {
        msg.payload = {dataValue, eventResults, monitoredItem}
      }

      node.send(msg)
    }

    node.bianco.iiot.sendDataFromEvent = function (monitoredItem, dataValue) {
      if (!monitoredItem) {
        coreListener.internalDebugLog('Monitored Item Is Not Valid On Change Event While Monitoring')
        return
      }

      const nodeId = (coreListener.core.isNodeId(monitoredItem.itemToMonitor.nodeId)) ? monitoredItem.itemToMonitor.nodeId.toString() : 'invalid'
      const item = node.bianco.iiot.monitoredASO.get(nodeId)
      const topic = (item) ? item.topic : node.topic

      let msg = {
        payload: {},
        topic: topic || node.topic, // default if item.topic is empty
        addressSpaceItems: [{name: '', nodeId: nodeId, datatypeName: ''}],
        nodetype: 'listen',
        injectType: 'event'
      }

      coreListener.analyzeEvent(node.bianco.iiot.opcuaSession, node.bianco.iiot.getBrowseName, dataValue)
        .then(function (eventResults) {
          node.bianco.iiot.handleEventResults(msg, dataValue, eventResults, monitoredItem)
        }).catch(function (err) {
          (coreListener.core.isInitializedBiancoIIoTNode(node)) ? node.bianco.iiot.errorHandling(err) : coreListener.internalDebugLog(err.message)
        })
    }

    node.bianco.iiot.errorHandling = function (err) {
      coreListener.internalDebugLog('Basic Error Handling')
      coreListener.internalDebugLog(err)
      if (node.showErrors) {
        node.error(err, {payload: 'Error Handling'})
      }

      if (err) {
        if (coreListener.core.isSessionBad(err)) {
          node.bianco.iiot.sendAllMonitoredItems('BAD SESSION')
          node.bianco.iiot.terminateSubscription(() => {
            node.emit('opcua_client_not_ready')
          })
        }
      }
    }

    node.bianco.iiot.getBrowseName = function (session, nodeId, callback) {
      coreListener.client.read(session, [{
        nodeId: nodeId,
        attributeId: AttributeIds.BrowseName
      }], function (err, org, readValue) {
        if (!err) {
          if (readValue[0].statusCode === StatusCodes.Good) {
            let browseName = readValue[0].value.value.name
            return callback(null, browseName)
          }
        }
        callback(err, 'Unknown')
      })
    }

    node.bianco.iiot.handleListenerInput = function (msg) {
      switch (node.action) {
        case 'subscribe':
          node.bianco.iiot.subscribeMonitoredItem(msg)
          break
        case 'events':
          node.bianco.iiot.subscribeMonitoredEvent(msg)
          break
        default:
          node.error(new Error('Type Of Action To Listener Is Not Valid'), msg)
      }
    }

    node.on('input', function (msg) {
      if (!coreListener.core.checkConnectorState(node, msg, 'Listener')) {
        return
      }

      if (msg.nodetype === 'browse') { /* browse is just to address listening to many nodes */
        msg.nodetype = 'inject'
        msg.injectType = 'listen'
        msg.addressSpaceItems = coreListener.core.buildNodesToListen(msg)
      }

      if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        if (node.showErrors) {
          node.error(new Error('Address-Space-Item Set Not Valid'), msg)
        }
        return
      }

      if (node.bianco.iiot.stateMachine.getMachineState() === 'IDLE') {
        node.bianco.iiot.messageQueue.push(msg)
        node.bianco.iiot.createSubscription(msg)
      } else {
        if (!coreListener.checkState(node, msg, 'Input')) {
          node.bianco.iiot.messageQueue.push(msg)
          return
        }
        node.bianco.iiot.handleListenerInput(msg)
      }
    })

    coreListener.core.registerToConnector(node)

    if (node.connector) {
      node.connector.on('connector_init', () => {
        coreListener.internalDebugLog('Reset Subscription On Connector Init')
        node.bianco.iiot.opcuaSubscription = null
        node.bianco.iiot.monitoredItems = new Map()
        node.bianco.iiot.monitoredASO = new Map()
        node.bianco.iiot.stateMachine = coreListener.createStatelyMachine()
        node.bianco.iiot.monitoredItemGroup = null
      })

      node.connector.on('connection_stopped', () => {
        node.bianco.iiot.terminateSubscription(() => {
          node.bianco.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection stopped')
        })
      })

      node.connector.on('connection_end', () => {
        node.bianco.iiot.terminateSubscription(() => {
          node.bianco.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection ends')
        })
      })

      node.connector.on('connection_reconfigure', () => {
        node.bianco.iiot.terminateSubscription(() => {
          node.bianco.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection reconfigure')
        })
      })

      node.connector.on('connection_renew', () => {
        node.bianco.iiot.terminateSubscription(() => {
          node.bianco.iiot.opcuaSubscription = null
          coreListener.internalDebugLog('Subscription Was Terminated On Connector Event -> connection renew')
        })
      })
    }

    node.bianco.iiot.terminateSubscription = function (done) {
      if (node.bianco.iiot.opcuaSubscription && node.bianco.iiot.stateMachine.getMachineState() === coreListener.RUNNING_STATE) {
        node.bianco.iiot.stateMachine.terminatesub()
        node.bianco.iiot.opcuaSubscription.terminate(() => {
          node.bianco.iiot.opcuaSubscription.removeAllListeners()
          node.bianco.iiot.stateMachine.idlesub()
          done()
        })
      } else {
        node.bianco.iiot.stateMachine.idlesub()
        done()
      }
    }

    node.on('close', function (done) {
      node.bianco.iiot.terminateSubscription(() => {
        node.bianco.iiot.opcuaSubscription = null
        coreListener.core.deregisterToConnector(node, () => {
          coreListener.core.resetBiancoNode(node)
          done()
        })
        coreListener.internalDebugLog('Close Listener Node')
      })
    })

    /* #########   FSM EVENTS  #########     */

    node.bianco.iiot.stateMachine.onIDLE = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener IDLE Event FSM')
    }

    node.bianco.iiot.stateMachine.onREQUESTED = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener REQUESTED Event FSM')
    }

    node.bianco.iiot.stateMachine.onINIT = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener INIT Event FSM')
    }

    node.bianco.iiot.stateMachine.onSTARTED = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener STARTED Event FSM')

      switch (node.action) {
        case 'subscribe':
          while (node.bianco.iiot.messageQueue.length > 0) {
            node.bianco.iiot.subscribeMonitoredItem(node.bianco.iiot.messageQueue.shift())
          }
          break
        case 'events':
          while (node.bianco.iiot.messageQueue.length > 0) {
            node.bianco.iiot.subscribeMonitoredEvent(node.bianco.iiot.messageQueue.shift())
          }
          break
        default:
          coreListener.internalDebugLog('Unknown Action Type ' + node.action)
      }
    }

    node.bianco.iiot.stateMachine.onTERMINATED = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener TERMINATED Event FSM')
    }

    node.bianco.iiot.stateMachine.onERROR = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener ERROR Event FSM')
    }

    node.bianco.iiot.stateMachine.onEND = function (event, oldState, newState) {
      coreListener.detailDebugLog('Listener END Event FSM')
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
