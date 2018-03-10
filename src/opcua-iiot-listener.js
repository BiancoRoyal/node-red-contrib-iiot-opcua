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
  let Map = require('collections/map')

  function OPCUAIIoTListener (config) {
    RED.nodes.createNode(this, config)
    this.action = config.action
    this.queueSize = config.queueSize || 1
    this.name = config.name
    this.justValue = config.justValue
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null
    node.opcuaClient = null
    node.opcuaSession = null

    let uaSubscription = null
    let StatusCodes = coreListener.core.nodeOPCUA.StatusCodes
    let AttributeIds = coreListener.core.nodeOPCUA.AttributeIds
    node.monitoredItems = new Map()

    node.verboseLog = function (logMessage) {
      if (RED.settings.verbose) {
        coreListener.internalDebugLog(logMessage)
      }
    }

    node.statusLog = function (logMessage) {
      if (RED.settings.verbose && node.showStatusActivities) {
        node.verboseLog('Status: ' + logMessage)
      }
    }

    node.setNodeStatusTo = function (statusValue) {
      node.statusLog(statusValue)
      let statusParameter = coreListener.core.getNodeStatus(statusValue, node.showStatusActivities)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.createSubscription = function (msg, cb) {
      let timeMilliseconds = (typeof msg.payload === 'number') ? msg.payload : null

      if (msg.nodetype !== 'events') {
        coreListener.internalDebugLog('create monitoring subscription')
        uaSubscription = node.makeSubscription(cb, msg, msg.payload.options || coreListener.getSubscriptionParameters(timeMilliseconds))
      } else {
        coreListener.internalDebugLog('create event subscription')
        uaSubscription = node.makeSubscription(cb, msg, msg.payload.options || coreListener.getEventSubscribtionParameters(timeMilliseconds))
      }
    }

    node.resetSubscription = function () {
      uaSubscription = null
      node.send({payload: 'SUBSCRIPTION TERMINATED', monitoredItems: node.monitoredItems})
      node.monitoredItems.clear()
    }

    node.subscribeActionInput = function (msg) {
      if (!uaSubscription) {
        node.createSubscription(msg, node.subscribeMonitoredItem)
      } else {
        if (uaSubscription.subscriptionId !== 'terminated' && node.subscribingPreCheck(uaSubscription, msg)) {
          node.subscribeMonitoredItem(uaSubscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    node.subscribingPreCheck = function (subscription, msg) {
      if (!node.monitoredItems) {
        coreListener.subscribeDebugLog('Monitored Item Set Not Valid')
        return false
      }

      if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        return false
      }

      return true
    }

    node.updateSubscriptionStatus = function () {
      coreListener.internalDebugLog('listening' + ' (' + node.monitoredItems.length + ')')
      node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
    }

    node.subscribeMonitoredItem = function (subscription, msg) {
      let addressSpaceItem = null

      for (addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          coreListener.subscribeDebugLog('Address Space Item Not Valid to Monitor ' + addressSpaceItem)
          return
        }

        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId.toString())

        if (!monitoredItem) {
          coreListener.subscribeDebugLog('Monitored Item Subscribe ' + addressSpaceItem.nodeId)
          coreListener.buildNewMonitoredItem(addressSpaceItem.nodeId, msg, subscription)
        } else {
          coreListener.subscribeDebugLog('Monitored Item Unsubscribe ' + addressSpaceItem.nodeId)
          monitoredItem.terminate(function (err) {
            node.monitoredItemTerminated(msg, monitoredItem, err)
          })
        }
      }
    }

    node.subscribeMonitoredEvent = function (subscription, msg) {
      let addressSpaceItem = null

      for (addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          coreListener.eventDebugLog('Address Space Item Not Valid to Monitor Event Of ' + addressSpaceItem)
          return
        }

        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId)

        if (!monitoredItem) {
          coreListener.eventDebugLog('Regsiter Event Item ' + addressSpaceItem.nodeId)
          coreListener.buildNewEventItem(addressSpaceItem.nodeId, msg, subscription)
        } else {
          coreListener.subscribeDebugLog('Terminate Event Item' + addressSpaceItem.nodeId)
          monitoredItem.terminate(function (err) {
            node.monitoredItemTerminated(msg, monitoredItem, err)
          })
        }
      }
    }

    node.monitoredItemTerminated = function (msg, monitoredItem, err) {
      coreListener.internalDebugLog('Terminate Monitored Item')

      if (err) {
        coreListener.internalDebugLog(err.message + ' on ' + monitoredItem.itemToMonitor.nodeId.toString())
        if (node.showErrors) {
          node.error(err, msg)
        }
      }

      if (node.monitoredItems.get(monitoredItem.itemToMonitor.nodeId.toString())) {
        node.monitoredItems.delete(monitoredItem.itemToMonitor.nodeId.toString())
        node.updateSubscriptionStatus()
      }
    }

    node.setMonitoring = function (monitoredItem) {
      coreListener.internalDebugLog('add monitoredItem to list' + monitoredItem + ' keys: ' + Object.keys(monitoredItem))
      node.monitoredItems.set(monitoredItem.itemToMonitor.nodeId.toString(), monitoredItem)

      monitoredItem.on('changed', function (dataValue) {
        coreListener.detailDebugLog('Changed Monitored Item Data Value ' + dataValue)
        coreListener.detailDebugLog('Changed Monitored Item Node ' + monitoredItem)

        if (!monitoredItem.monitoringParameters.filter) {
          node.sendDataFromMonitoredItem(monitoredItem, dataValue)
        } else {
          node.sendDataFromEvent(monitoredItem, dataValue)
        }
      })

      monitoredItem.on('error', function (err) {
        coreListener.internalDebugLog('Error: ' + err + ' on ' + monitoredItem.itemToMonitor.nodeId.toString())

        if (node.monitoredItems.get(monitoredItem.itemToMonitor.nodeId.toString())) {
          node.monitoredItems.delete(monitoredItem.itemToMonitor.nodeId.toString())
          node.updateSubscriptionStatus()
        }

        if (node.showErrors) {
          node.error(err, {payload: ''})
        }

        if (err.message && err.message.includes('BadSession')) {
          node.connector.resetBadSession()
        }
      })

      monitoredItem.on('terminated', function () {
        coreListener.internalDebugLog('Terminated For ' + monitoredItem)

        if (node.monitoredItems.get(monitoredItem.itemToMonitor.nodeId.toString())) {
          node.monitoredItems.delete(monitoredItem.itemToMonitor.nodeId.toString())
          node.updateSubscriptionStatus()
        }
      })
    }

    node.sendDataFromMonitoredItem = function (monitoredItem, dataValue) {
      let msg = {
        payload: {},
        topic: node.topic,
        addressSpaceItems: [{name: '', nodeId: monitoredItem.itemToMonitor.nodeId.toString(), datatypeName: ''}],
        nodetype: 'listen',
        injectType: 'subscribe'
      }

      try {
        let dataValuesString = {}
        if (node.justValue) {
          dataValuesString = JSON.stringify(dataValue, null, 2)
        } else {
          dataValuesString = JSON.stringify({ dataValue: dataValue, monitoredItem: monitoredItem }, null, 2)
        }

        RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
      } catch (err) {
        if (node.showErrors) {
          node.warn('JSON not to parse from string for monitored item')
          node.error(err, msg)
          if (node.justValue) {
            msg.payload = JSON.stringify(dataValue, null, 2)
          } else {
            msg.payload = JSON.stringify({ dataValue: dataValue, monitoredItem: monitoredItem }, null, 2)
          }
          msg.error = err.message
        }
      }

      node.send(msg)
    }

    node.sendDataFromEvent = function (monitoredItem, dataValue) {
      let msg = {
        payload: {},
        topic: node.topic,
        addressSpaceItems: [{name: '', nodeId: monitoredItem.itemToMonitor.nodeId.toString(), datatypeName: ''}],
        nodetype: 'listen',
        injectType: 'event'
      }

      coreListener.analyzeEvent(node.opcuaSession, node.getBrowseName, dataValue)
        .then(function (eventResults) {
          coreListener.eventDetailDebugLog('Monitored Event Results ' + eventResults)

          try {
            let dataValuesString = {}
            if (node.justValue) {
              dataValuesString = JSON.stringify({ dataValue: dataValue }, null, 2)
            } else {
              dataValuesString = JSON.stringify({ dataValue: dataValue, eventResults: eventResults, monitoredItem: monitoredItem }, null, 2)
            }

            RED.util.setMessageProperty(msg, 'payload', JSON.parse(dataValuesString))
          } catch (err) {
            if (node.showErrors) {
              node.warn('JSON not to parse from string for monitored item')
              node.error(err, msg)
              if (node.justValue) {
                msg.payload = JSON.stringify({ dataValue: dataValue }, null, 2)
              } else {
                msg.payload = JSON.stringify({ dataValue: dataValue, eventResults: eventResults, monitoredItem: monitoredItem }, null, 2)
              }
              msg.error = err.message
            }
          }

          node.send(msg)
        }).catch(node.errorHandling)
    }

    node.errorHandling = function (err) {
      node.verboseLog('Listener Handle Error '.red + err)

      if (node.showErrors) {
        node.error(err)
      }

      coreListener.internalDebugLog(err.message)

      if (err && err.message && err.message.includes('BadSession')) {
        node.connector.resetBadSession()
      }
    }

    node.subscribeEventsInput = function (msg) {
      if (!uaSubscription) {
        node.createSubscription(msg, node.subscribeMonitoredEvent)
      } else {
        if (uaSubscription.subscriptionId !== 'terminated' && node.subscribingPreCheck(uaSubscription, msg)) {
          node.subscribeMonitoredEvent(uaSubscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    node.makeSubscription = function (callback, cbParameters, parameters) {
      let newSubscription = null

      if (!node.opcuaSession) {
        coreListener.subscribeDebugLog('Subscription Session Not Valid')
        return newSubscription
      }

      if (!parameters) {
        coreListener.subscribeDebugLog('Subscription Parameters Not Valid')
        return newSubscription
      }

      newSubscription = new coreListener.core.nodeOPCUA.ClientSubscription(node.opcuaSession, parameters)
      coreListener.subscribeDebugLog('New Subscription Created')

      newSubscription.on('initialized', function () {
        node.setNodeStatusTo('initialized')
      })

      newSubscription.on('started', function () {
        node.setNodeStatusTo('started')
        node.monitoredItems.clear()
        callback(newSubscription, cbParameters)
      })

      newSubscription.on('terminated', function () {
        node.setNodeStatusTo('terminated')
        node.resetSubscription()
      })

      newSubscription.on('item_added', function (monitoredItem) {
        coreListener.subscribeDebugLog('New Monitoring For ' + monitoredItem)
        node.setMonitoring(monitoredItem)
        node.updateSubscriptionStatus()
      })

      return newSubscription
    }

    node.getBrowseName = function (session, nodeId, callback) {
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

    node.on('input', function (msg) {
      if (!node.opcuaSession) {
        node.error(new Error('Session Not Ready To Listen'), msg)
        return
      }

      if (msg.nodetype === 'browse') { /* browse is just to address listening to many nodes */
        msg.nodetype = 'inject'
        msg.injectType = 'listen'
        msg.addressSpaceItems = coreListener.core.buildNodesToListen(msg)
      }

      switch (node.action) {
        case 'subscribe':
          node.subscribeActionInput(msg)
          break
        case 'events':
          node.subscribeEventsInput(msg)
          break
        default:
          throw new TypeError('Unknown Action Type')
      }
    })

    node.setOPCUAConnected = function (opcuaClient) {
      node.opcuaClient = opcuaClient
      node.setNodeStatusTo('connected')
    }

    node.opcuaSessionStarted = function (opcuaSession) {
      node.opcuaSession = opcuaSession
      node.setNodeStatusTo('active')
    }

    node.connectorShutdown = function (opcuaClient) {
      coreListener.internalDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
    }

    if (node.connector) {
      node.connector.on('connected', node.setOPCUAConnected)
      node.connector.on('session_started', node.opcuaSessionStarted)
      node.connector.on('after_reconnection', node.connectorShutdown)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.setNodeStatusTo('waiting')

    node.on('close', function () {
      let monitoredItem = null
      for (monitoredItem of node.monitoredItems) {
        if (monitoredItem.terminate) {
          monitoredItem.terminate(function (err) {
            node.monitoredItemTerminated({payload: 'close listener'}, monitoredItem, err)
          })
        }
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
