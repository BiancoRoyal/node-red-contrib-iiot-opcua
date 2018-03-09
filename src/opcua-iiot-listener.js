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
          node.error(new Error('Subscription Address Item NodeId Not Valid'), msg)
          return
        }

        coreListener.subscribeDebugLog('Register Monitored Subscription NodeId ' + addressSpaceItem.nodeId)
        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId)

        if (!monitoredItem) {
          coreListener.subscribeDebugLog('Monitored Item Subscribe ' + addressSpaceItem.nodeId)
          coreListener.buildNewMonitoredItem(addressSpaceItem, msg, subscription)
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
                node.updateSubscriptionStatus()
              }
            }
          })
        }
      }
    }

    node.subscribeMonitoredEvent = function (subscription, msg) {
      let addressSpaceItem = null
      for (addressSpaceItem of msg.addressSpaceItems) {
        if (!addressSpaceItem.nodeId) {
          node.error(new Error('Event Address Item NodeId Not Valid'), msg)
          return
        }

        coreListener.eventDebugLog('Register Monitored Event NodeId ' + addressSpaceItem.nodeId)
        let monitoredItem = node.monitoredItems.get(addressSpaceItem.nodeId)

        if (!monitoredItem) {
          coreListener.eventDebugLog('Monitored Event Item ' + addressSpaceItem.nodeId)
          coreListener.buildNewEventItem(addressSpaceItem, msg, subscription)
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
                node.updateSubscriptionStatus()
              }
            }
          })
        }
      }
    }

    node.setMonitoring = function (msg, monitoredItem, addressSpaceItem) {
      // fill up monitored item
      monitoredItem.addressSpaceItem = addressSpaceItem
      monitoredItem.topic = msg.topic || ''
      monitoredItem.nodetype = 'listen'
      monitoredItem.injectType = msg.injectType || 'none'
      monitoredItem.eventType = msg.eventType || 'none'
      node.monitoredItems.set(addressSpaceItem.nodeId, monitoredItem)
      coreListener.internalDebugLog('setMonitoring node.monitoredItems.length:' + node.monitoredItems.length)
      node.updateSubscriptionStatus()

      if (msg.nodetype !== 'events') {
        monitoredItem.on('changed', function (dataValue) {
          let result = coreListener.core.buildMsgPayloadByDataValue(dataValue)

          let valueObject = {
            payload: {
              name: monitoredItem.addressSpaceItem.name,
              nodeId: monitoredItem.addressSpaceItem.nodeId,
              datatype: monitoredItem.addressSpaceItem.datatypeName,
              value: null
            },
            topic: monitoredItem.topic,
            addressSpaceItems: [monitoredItem.addressSpaceItem],
            nodetype: monitoredItem.nodetype,
            injectType: monitoredItem.injectType,
            readtype: monitoredItem.readtype
          }

          if (result.hasOwnProperty('value') && result.value.hasOwnProperty('value')) {
            valueObject.payload.value = result.value.value
            valueObject.payload.datatype = result.value.dataType || monitoredItem.addressSpaceItem.datatypeName
          } else {
            if (result.hasOwnProperty('value')) {
              valueObject.payload.value = result.value
              valueObject.payload.datatype = result.dataType || monitoredItem.addressSpaceItem.datatypeName
            } else {
              valueObject.payload.value = result
            }
          }

          if (node.justValue) {
            valueObject.mode = 'value'
          } else {
            valueObject.mode = 'all'
            valueObject.result = result
          }

          node.send(valueObject)
        })
      } else {
        monitoredItem.on('changed', function (eventFieldResponse) {
          coreListener.analyzeEvent(node.opcuaSession, node.getBrowseName, msg.payload.eventFields, eventFieldResponse)
            .then(function (result) {
              coreListener.eventDetailDebugLog('Monitored Event Message ' + JSON.stringify(result.message))
              coreListener.eventDetailDebugLog('Monitored Event Field Message ' + JSON.stringify(result.variantMsg))

              let dataValueJSON = {}
              try {
                dataValueJSON = JSON.parse(JSON.stringify(result.variantMsg.payload))
              } catch (err) {
                coreListener.eventDetailDebugLog(err + ' sending variantMsg stringified')
                dataValueJSON = JSON.stringify(result.variantMsg.payload)
              }

              let valueObject = {
                payload: {
                  name: monitoredItem.addressSpaceItem.name,
                  nodeId: monitoredItem.addressSpaceItem.nodeId,
                  datatypeName: monitoredItem.addressSpaceItem.datatypeName,
                  value: null
                },
                topic: monitoredItem.topic,
                addressSpaceItems: [monitoredItem.addressSpaceItem],
                nodetype: monitoredItem.nodetype,
                injectType: monitoredItem.injectType,
                readtype: monitoredItem.readtype,
                eventType: monitoredItem.eventType
              }

              try {
                valueObject.payload.value = JSON.parse(JSON.stringify(result.message.payload))
              } catch (err) {
                coreListener.eventDetailDebugLog(err + ' sending message stringified')
                valueObject.payload.value = JSON.stringify(result.message.payload)
              }

              if (node.justValue) {
                valueObject.mode = 'value'
              } else {
                valueObject.mode = 'all'
                valueObject.result = result
                valueObject.variantMsg = dataValueJSON
              }

              node.send(valueObject)
            })
            .catch(node.errorHandling)
        })
      }

      monitoredItem.on('error', function (err) {
        coreListener.internalDebugLog('Error: ' + err + ' on ' + monitoredItem.addressSpaceItem.nodeId)

        if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
          node.updateSubscriptionStatus()
        }

        if (node.showErrors) {
          node.error(err, msg)
        }

        if (err.message && err.message.includes('BadSession')) {
          node.connector.resetBadSession()
        }
      })

      monitoredItem.on('terminated', function () {
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.addressSpaceItem.nodeId)

        if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
          node.updateSubscriptionStatus()
        }
      })
    }

    node.errorHandling = function (err) {
      node.verboseLog('Listener Handle Error '.red + err)

      if (node.showErrors) {
        node.error(err)
      }

      coreListener.internalDebugLog(err.message)

      if (err.message && err.message.includes('BadSession')) {
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
        node.setNodeStatusTo('initialized')
      })

      newSubscription.on('started', function () {
        node.setNodeStatusTo('started')
        node.monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('terminated', function () {
        node.setNodeStatusTo('terminated')
        node.resetSubscription()
      })

      newSubscription.on('item_added', function (monitoredItem) {
        coreListener.subscribeDebugLog('New Monitoring At Subscription For ' + JSON.stringify(monitoredItem))
        node.setMonitoring(msg, monitoredItem)
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
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
