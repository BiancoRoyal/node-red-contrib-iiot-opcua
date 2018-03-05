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
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    node.reconnectTimeout = 1000
    node.sessionTimeout = null

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
      node.setNodeStatusTo('waiting')
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

          monitoredItem = coreListener.buildNewMonitoredItem(addressSpaceItem, msg, subscription, function (err, addressSpaceItem, msg) {
            if (err) {
              coreListener.subscribeDebugLog('Subscribe Error: ' + err + ' on ' + addressSpaceItem.nodeId)

              if (node.showErrors) {
                node.error('Subscription Monitor for Subscribe', msg)
              }
              node.setNodeStatusTo('subscribed' + ' (' + node.monitoredItems.length + ')')
            } else {
              coreListener.subscribeDebugLog('New Monitoring Subscription For ' + addressSpaceItem.nodeId)
            }
          })

          if (monitoredItem) {
            node.setMonitoring(msg, monitoredItem, addressSpaceItem)
          } else {
            coreListener.subscribeDebugLog('Error monitoredItem Is Not Valid')
          }
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

          monitoredItem = coreListener.buildNewEventItem(addressSpaceItem, msg, subscription, function (err, addressSpaceItem, msg) {
            if (err) {
              coreListener.eventDebugLog(err.message)
              if (node.showErrors) {
                node.error(err, msg)
              }
            } else {
              coreListener.eventDebugLog('New Event Subscription For ' + addressSpaceItem.nodeId)
            }
          })

          if (monitoredItem) {
            node.setMonitoring(msg, monitoredItem, addressSpaceItem)
          } else {
            coreListener.subscribeDebugLog('Error monitoredItem Is Not Valid')
          }
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

    node.setMonitoring = function (msg, monitoredItem, addressSpaceItem) {
      // fill up monitored item
      monitoredItem.addressSpaceItem = addressSpaceItem
      monitoredItem.topic = msg.topic || ''
      monitoredItem.nodetype = msg.nodetype || 'none'
      monitoredItem.injectType = msg.injectType || 'listen'
      monitoredItem.readtype = msg.readtype || 'none'
      monitoredItem.eventType = msg.eventType || 'none'
      node.monitoredItems.set(addressSpaceItem.nodeId, monitoredItem)

      monitoredItem.on('initialized', function () {
        node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
      })

      if (msg.nodetype !== 'events') {
        monitoredItem.on('changed', function (dataValue) {
          let result = coreListener.core.buildMsgPayloadByDataValue(dataValue)

          let valueMsg = {
            payload: {},
            topic: monitoredItem.topic,
            addressSpaceItems: [monitoredItem.addressSpaceItem],
            nodetype: monitoredItem.nodetype,
            injectType: monitoredItem.injectType,
            readtype: monitoredItem.readtype,
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

          let valueObject = {
            payload: {
              name: monitoredItem.addressSpaceItem.name,
              nodeId: monitoredItem.addressSpaceItem.nodeId,
              value: valueMsg.payload
            },
            topic: valueMsg.topic,
            addressSpaceItems: valueMsg.addressSpaceItems,
            nodetype: valueMsg.nodetype,
            injectType: valueMsg.injectType,
            readtype: valueMsg.readtype
          }

          if (node.justValue) {
            valueMsg.mode = 'value'
            node.send([valueObject, valueMsg])
          } else {
            valueMsg.mode = 'all'
            node.send([valueMsg, valueObject])
          }
        })
      } else {
        monitoredItem.on('changed', function (eventFieldResponse) {
          coreListener.analyzeEvent(node.opcuaSession, node.getBrowseName, msg.payload.eventFields, eventFieldResponse)
            .then(function (result) {
              coreListener.eventDetailDebugLog('Monitored Event Message ' + JSON.stringify(result.message))
              coreListener.eventDetailDebugLog('Monitored Event Field Message ' + JSON.stringify(result.variantMsg))

              let valueMsg = {
                payload: {},
                topic: monitoredItem.topic,
                addressSpaceItems: [monitoredItem.addressSpaceItem],
                nodetype: monitoredItem.nodetype,
                injectType: monitoredItem.injectType,
                readtype: monitoredItem.readtype,
                result: result
              }

              try {
                valueMsg.payload = JSON.parse(JSON.stringify(result.message.payload))
              } catch (err) {
                coreListener.eventDetailDebugLog(err + ' sending message stringified')
                valueMsg.payload = JSON.stringify(result.message.payload)
              }

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
                  value: valueMsg.payload
                },
                topic: valueMsg.topic,
                addressSpaceItems: valueMsg.addressSpaceItems,
                nodetype: valueMsg.nodetype,
                injectType: valueMsg.injectType,
                eventType: valueMsg.eventType,
                variantMsg: dataValueJSON
              }

              if (node.justValue) {
                valueMsg.mode = 'value'
                node.send([valueObject, valueMsg])
              } else {
                valueMsg.mode = 'all'
                node.send([valueMsg, valueObject])
              }
            })
            .catch(node.errorHandling)
        })
      }

      monitoredItem.on('error', function (err) {
        coreListener.internalDebugLog('Error: ' + err + ' on ' + monitoredItem.addressSpaceItem.nodeId)

        if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
        }

        if (node.showErrors) {
          node.error(err, msg)
        }

        node.setNodeStatusTo('error' + ' (' + node.monitoredItems.length + ')')

        if (err.message && err.message.includes('BadSession')) {
          node.handleSessionError(err)
        }
      })

      monitoredItem.on('terminated', function () {
        coreListener.internalDebugLog('Terminated For ' + monitoredItem.addressSpaceItem.nodeId)

        if (node.monitoredItems.get(monitoredItem.addressSpaceItem.nodeId)) {
          node.monitoredItems.delete(monitoredItem.addressSpaceItem.nodeId)
        }

        node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
      })

      node.setNodeStatusTo('listening' + ' (' + node.monitoredItems.length + ')')
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

    node.on('close', function (done) {
      if (uaSubscription && uaSubscription.isActive()) {
        uaSubscription.terminate()
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
