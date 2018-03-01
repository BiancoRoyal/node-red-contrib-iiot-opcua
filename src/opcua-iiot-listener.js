/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
    this.multipleRequest = config.multipleRequest
    this.metaDataInject = config.metaDataInject   /* TODO: not finished for now */
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null

    let subscription = null
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

    node.resetSession = function () {
      if (!node.sessionTimeout && node.opcuaClient && node.opcuaSession) {
        coreListener.internalDebugLog('Reset Session')
        node.connector.closeSession(node.opcuaSession, function () {
          node.opcuaSession = null
          node.startOPCUASessionWithTimeout(node.opcuaClient)
        })
      }
    }

    node.createSubscription = function (msg, cb) {
      let timeMilliseconds = (typeof msg.payload === 'number') ? msg.payload : null

      if (msg.nodetype !== 'events') {
        coreListener.internalDebugLog('create subscription')
        subscription = node.makeSubscription(cb, msg, msg.payload.options || coreListener.getSubscriptionParameters(timeMilliseconds))
      } else {
        coreListener.internalDebugLog('create events subscription')
        subscription = node.makeSubscription(cb, msg, msg.payload.options || coreListener.getEventSubscribtionParameters(timeMilliseconds))
      }
    }

    node.resetSubscription = function () {
      subscription = null
      node.monitoredItems.clear()
      node.setNodeStatusTo('waiting')
    }

    node.subscribeActionInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredItem)
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          node.subscribeMonitoredItem(subscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    node.subscribeMonitoredItem = function (subscription, msg) {
      if (!node.monitoredItems) {
        coreListener.subscribeDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        return
      }

      let addressSpaceItem
      for (addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          node.error(new Error('Subscription Address Item NodeId Not Valid'), msg)
          return
        }

        coreListener.subscribeDebugLog('Register Monitored Subscription NodeId ' + addressSpaceItem.nodeId)
        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId)

        if (!monitoredItem) {
          coreListener.subscribeDebugLog('Monitored Item Subscribe ' + addressSpaceItem.nodeId)

          monitoredItem = coreListener.buildNewMonitoredItem(addressSpaceItem, msg, subscription, function (err, addressSpaceItem, msg) {
            if (err || !monitoredItem) {
              coreListener.subscribeDebugLog('Subscribe Error: ' + err + ' on ' + addressSpaceItem.nodeId)

              if (node.showErrors) {
                node.error('Subscription Monitor for Subscribe', msg)
              }
              node.setNodeStatusTo('subscribed' + ' (' + node.monitoredItems.length + ')')
            } else {
              coreListener.subscribeDebugLog('New Monitoring Subscription For ' + addressSpaceItem.nodeId)
            }
          })

          node.monitoredItems.set(addressSpaceItem.nodeId, monitoredItem)
          node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
          node.setMonitoring(msg, monitoredItem, addressSpaceItem)
        } else {
          coreListener.subscribeDebugLog('Monitored Item Unsubscribe')
          monitoredItem.terminate(function (err) {
            if (err) {
              if (node.showErrors) {
                node.error(err, msg)
              }
            } else {
              coreListener.subscribeDebugLog('Unsubscribe Monitoring For ' + monitoredItem.addressSpaceItem.nodeId)

              if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
                node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
                node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
              }
            }
          })
        }
      }
    }

    node.setMonitoring = function (msg, monitoredItem, addressSpaceItem) {
      node.monitoredItems.set(addressSpaceItem.nodeId, monitoredItem)

      monitoredItem.on('changed', function (dataValue) {
        let result = coreListener.core.buildMsgPayloadByDataValue(dataValue)

        let valueMsg = {
          topic: msg.topic,
          input: msg,
          addressSpaceItems: [addressSpaceItem],
          nodetype: 'listen',
          readtype: 'subscribe',
          result: result
        }

        if (result.hasOwnProperty('value') && result.value.hasOwnProperty('value')) {
          valueMsg.payload = result.value.value
        } else {
          if (result.hasOwnProperty('value')) {
            valueMsg.payload = result.value
          } else {
            valueMsg.payload = result
          }
        }

        if (node.justValue) {
          node.send([valueMsg, {payload: 'just value option active'}])
        } else {
          try {
            let dataValueJSON = {
              payload: JSON.parse(JSON.stringify(dataValue.toJSON(dataValue)))
            }
            node.send([valueMsg, dataValueJSON])
          } catch (err) {
            coreListener.subscribeDetailDebugLog(err + ' sending stringified')
            node.send([valueMsg, {payload: JSON.stringify(dataValue)}])
          }
        }
      })

      monitoredItem.on('error', function (err) {
        coreListener.subscribeDebugLog('Subscribe Error: ' + err + ' on ' + addressSpaceItem.nodeId)

        if (node.monitoredItems.get(addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(addressSpaceItem.nodeId)
        }

        if (node.showErrors) {
          node.error(err, msg)
        }

        node.setNodeStatusTo('error' + ' (' + node.monitoredItems.length + ')')

        if (err.message.includes('BadSession')) {
          node.handleSessionError(err)
        }
      })

      monitoredItem.on('terminated', function () {
        coreListener.eventDebugLog('Monitoring Terminated For ' + addressSpaceItem.nodeId)

        if (node.monitoredItems.get(addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(addressSpaceItem.nodeId)
        }
        node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
      })
    }

    node.subscribeMonitoredEvent = function (subscription, msg) {
      if (!node.monitoredItems) {
        coreListener.eventDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.addressSpaceItems || !msg.addressSpaceItems.length) {
        coreListener.subscribeDebugLog('Address-Space-Item Set Not Valid')
        return
      }

      let addressSpaceItem
      for (addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          node.error(new Error('Event Address Item NodeId Not Valid'), msg)
          return
        }

        coreListener.eventDebugLog('Register Monitored Event NodeId ' + addressSpaceItem.nodeId)
        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId)

        if (!monitoredItem) {
          coreListener.eventDebugLog('Monitored Event Item ' + addressSpaceItem.nodeId)

          monitoredItem = coreListener.buildNewEventItem(addressSpaceItem, msg, subscription, function (err, addressSpaceItem, msg) {
            if (err) {
              coreListener.eventDebugLog(err.message)
              if (node.showErrors) {
                node.error(err, msg)
              }
              node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
            } else {
              coreListener.eventDebugLog('New Event Subscription For ' + addressSpaceItem.nodeId)
            }
          })

          node.monitoredItems.set(addressSpaceItem.nodeId, monitoredItem)
          node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
          node.setMonitoring(msg, monitoredItem, addressSpaceItem)
        } else {
          monitoredItem.terminate(function (err) {
            if (err) {
              if (node.showErrors) {
                node.error(err, msg)
              }
            } else {
              coreListener.subscribeDebugLog('Unsubscribe Monitored Event For ' + monitoredItem.addressSpaceItem.nodeId)

              if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
                node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
                node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
              }
            }
          })
        }
      }
    }

    node.errorHandling = function (err) {
      node.verboseLog('Listener Handle Error '.red + err)

      if (node.showErrors) {
        node.error(err)
      }

      coreListener.internalDebugLog(err.message)
      node.setNodeStatusTo('error' + ' (' + node.monitoredItems.length + ')')

      if (err.message && err.message.includes('BadSession')) {
        node.resetSession()
      }
    }

    node.subscribeEventsInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredEvent)
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          node.subscribeMonitoredEvent(subscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    // TODO: transform to promises
    node.makeSubscription = function (callback, msg, parameters) {
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
        node.setNodeStatusTo('initialize')
      })

      newSubscription.on('started', function () {
        node.setNodeStatusTo('started')
        node.monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('terminated', function () {
        node.resetSubscription()
      })

      return newSubscription
    }

    // TODO: clean code
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

    node.handleSessionError = function (err) {
      coreListener.internalDebugLog('Handle Session Error '.red + err)

      if (node.showErrors) {
        node.error('Listener Session Error')
      }

      node.resetSession()
    }

    node.handleSessionClose = function (err) {
      coreListener.internalDebugLog('Handle Session Close Wit Error '.red + err)

      if (node.showErrors) {
        node.error(new Error('Listener Session Close'), {payload: ''})
      }
    }

    node.startOPCUASession = function (opcuaClient) {
      node.verboseLog('Listener Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreListener.core.TEN_SECONDS_TIMEOUT, 'Listener Node').then(function (session) {
        node.opcuaSession = session
        node.opcuaSession.on('close', node.handleSessionClose)

        node.verboseLog('Session Connected')
        node.setNodeStatusTo('connected')

        coreListener.getAllEventTypes(session, function (err, entries) {
          //  TODO: clean code
          if (err) {
            node.verboseLog(err)
          } else {
            entries.forEach(function (entry) {
              node.verboseLog(entry.displayName + ' : ' + entry.nodeId)
            })
          }
        })
      }).catch(node.handleSessionError)
    }

    node.startOPCUASessionWithTimeout = function (opcuaClient) {
      if (node.sessionTimeout !== null) {
        clearTimeout(node.sessionTimeout)
        node.sessionTimeout = null
      }

      coreListener.internalDebugLog('starting OPC UA session with delay of ' + node.reconnectTimeout)
      node.sessionTimeout = setTimeout(function () {
        node.startOPCUASession(opcuaClient)
      }, node.reconnectTimeout)
    }

    node.connectorShutdown = function (opcuaClient) {
      coreListener.internalDebugLog('Connector Shutdown')
      if (opcuaClient) {
        node.opcuaClient = opcuaClient
      }
      node.resetSubscription()
      // node.startOPCUASessionWithTimeout(node.opcuaClient)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASessionWithTimeout)
      node.connector.on('after_reconnection', node.connectorShutdown)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('input', function (msg) {
      coreListener.detailDebugLog(node.action + ' listener input ' + JSON.stringify(msg))

      if (msg.nodetype === 'browse') { /* browse is just to address listening to many nodes */
        msg._msgid = msg.input._msgid
        msg.payload = msg.input.payload
        msg.topic = msg.input.topic
        msg.nodetype = msg.input.nodetype
        msg.injectType = msg.input.injectType

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

    node.on('close', function (done) {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
      }

      if (node.opcuaSession && node.connector.opcuaClient) {
        node.connector.closeSession(node.opcuaSession, function (err) {
          if (err) {
            node.verboseLog('Error On Close Session ' + err)
          }
          node.opcuaSession = null
          done()
        })
      } else {
        node.opcuaSession = null
        done()
      }
    })

    node.setNodeStatusTo('waiting')
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
