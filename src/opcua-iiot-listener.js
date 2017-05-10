/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Listener Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreListener = require('./core/opcua-iiot-core-listener')
  let async = require('async')
  let Queue = require('async').queue
  let Map = require('collections/map')

  function OPCUAIIoTListener (config) {
    RED.nodes.createNode(this, config)
    this.action = config.action
    this.queueSize = config.queueSize
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connector = RED.nodes.getNode(config.connector)

    let node = this
    let subscription = null
    let StatusCodes = coreListener.core.nodeOPCUA.StatusCodes
    let DataType = coreListener.core.nodeOPCUA.DataType
    let AttributeIds = coreListener.core.nodeOPCUA.AttributeIds
    let monitoredItems = new Map()

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
      let timeMilliseconds = msg.payload
      coreListener.internalDebugLog('create subscription')
      if (msg.nodetype !== 'event') {
        subscription = node.makeSubscription(cb, msg, coreListener.getSubscriptionParameters(timeMilliseconds))
      } else {
        subscription = node.makeSubscription(cb, msg, coreListener.getEventSubscribtionParameters(timeMilliseconds))
      }
    }

    node.resetSubscription = function () {
      subscription = null
      monitoredItems.clear()
      node.setNodeStatusTo('reset')
    }

    node.subscribeActionInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredItem)
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          node.setNodeStatusTo('active')
          node.subscribeMonitoredItem(subscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    node.subscribeMonitoredItem = function (subscription, msg) {
      if (!monitoredItems) {
        coreListener.subscribeDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.queueSize) {
        msg.queueSize = coreListener.SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      let monitoredItem = monitoredItems.get(msg.topic)

      if (!monitoredItem) {
        coreListener.subscribeDebugLog('Monitored Item Subscribe')

        monitoredItem = coreListener.buildNewMonitoredItem(msg, subscription, function (err) {
          if (err) {
            coreListener.subscribeDebugLog('Subscribe Error: ' + err + ' on ' + msg.topic)

            if (node.showErrors) {
              node.error('Subscription Monitor for Subscribe', msg)
            }
          }
        })

        monitoredItem.on('initialized', function () {
          node.setNodeStatusTo('subscribed')
        })

        monitoredItems.set(msg.topic, monitoredItem)

        monitoredItem.on('changed', function (dataValue) {
          node.setNodeStatusTo('active')
          msg.payload = coreListener.core.buildMsgPayloadByDataValue(dataValue)
          node.send([{payload: msg.payload.value}, msg])
        })

        monitoredItem.on('error', function (err) {
          coreListener.subscribeDebugLog('Subscribe Error: ' + err + ' on ' + msg.topic)

          if (monitoredItems.get(msg.topic)) {
            monitoredItems.delete(msg.topic)
          }

          if (node.showErrors) {
            node.error(err, msg)
          }

          node.setNodeStatusTo('error')
        })

        monitoredItem.on('terminated', function () {
          coreListener.subscribeDebugLog('Subscribe Monitoring Terminated For ' + msg.topic)

          if (monitoredItems.get(msg.topic)) {
            monitoredItems.delete(msg.topic)
          }
        })
      } else {
        coreListener.subscribeDebugLog('Monitored Item Unsubscribe')
        monitoredItem.terminate()
      }

      return monitoredItem
    }

    node.subscribeMonitoredEvent = function (subscription, msg) {
      if (!monitoredItems) {
        coreListener.eventDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.queueSize) {
        msg.queueSize = coreListener.EVENT_DEFAULT_QUEUE_SIZE
      }

      let monitoredItem = monitoredItems.get(msg.topic)

      if (!monitoredItem) {
        monitoredItem = coreListener.buildNewEventItem(msg, subscription, function (err) {
          if (err) {
            coreListener.eventDebugLog(err)
            if (node.showErrors) {
              node.error('Subscription Monitor for Event', msg)
            }
          }
        })

        monitoredItems.set(msg.topic, monitoredItem)

        monitoredItem.on('initialized', function () {
          node.setNodeStatusTo('listening')
        })

        monitoredItem.on('changed', function (eventFields) {
          coreListener.eventDebugLog('Monitored Event Changed ' + eventFields)
          coreListener.eventDebugLog('Monitored Event Changed ' + JSON.stringify(eventFields))

          node.dumpEvent(node, node.opcuaSession, msg.eventFields, eventFields, function (err) {
            if (err) {
              coreListener.eventDebugLog('Event Error: ' + err + ' for ' + msg.topic)

              if (node.showErrors) {
                node.error(err, msg)
              }
            } else {
              coreListener.eventDebugLog('Successful Event Call')
            }
          })
          node.setNodeStatusTo('active')
        })

        monitoredItem.on('error', function (err) {
          coreListener.eventDebugLog('Event Error: ' + err + ' for ' + msg.topic)

          if (monitoredItems.get(msg.topic)) {
            monitoredItems.delete(msg.topic)
          }

          if (node.showErrors) {
            node.error(err, msg)
          }

          node.setNodeStatusTo('error')
        })

        monitoredItem.on('terminated', function () {
          coreListener.eventDebugLog('Event Terminated For ' + msg.topic)

          if (monitoredItems.get(msg.topic)) {
            monitoredItems.delete(msg.topic)
          }
        })
      } else {
        coreListener.eventDebugLog('Monitored Event Unsubscribe')
        monitoredItem.terminate()
      }

      return monitoredItem
    }

    node.subscribeEventsInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredEvent)
        node.setNodeStatusTo('active')
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          node.setNodeStatusTo('active')
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
        coreListener.internalDebugLog('Subscription Session Not Valid')
        return newSubscription
      }

      if (!parameters) {
        coreListener.internalDebugLog('Subscription Parameters Not Valid')
        return newSubscription
      }

      newSubscription = new coreListener.core.nodeOPCUA.ClientSubscription(node.opcuaSession, parameters)

      newSubscription.on('initialized', function () {
        node.setNodeStatusTo('initialize')
      })

      newSubscription.on('started', function () {
        node.setNodeStatusTo('started')
        monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('keepalive', function () {
        node.setNodeStatusTo('keepalive')
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
        callback(err, '<??>')
      })
    }

    // looks like the example from node-opcua see:
    // https://github.com/node-opcua/node-opcua/blob/master/bin/interactive_client.js
    // or here:
    // https://github.com/node-opcua/node-opcua/tree/master/test/end_to_end
    //
    // Fields selected alarm fields
    // EventFields same order returned from server array of variants (filled or empty)
    node.dumpQueueEvent = function (node, session, fields, eventFields, _callback) {
      coreListener.eventDebugLog('Send Event Information ' + eventFields)
      let msg = {}
      msg.payload = []

      async.forEachOf(eventFields, function (variant, index, callback) {
        coreListener.eventDebugLog('Event Information Index:' + index + ' variant: ' + JSON.stringify(variant))

        if (variant.dataType === DataType.Null) {
          return callback(new Error('Variants DataType Is Null'))
        }

        if (variant.dataType === DataType.NodeId) {
          node.getBrowseName(session, variant.value, function (err, name) {
            if (!err) {
              coreListener.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
              node.setNodeStatusTo('active')
              node.send([{payload: msg.payload}, msg])
            }
            callback(err)
          })
        } else {
          setImmediate(function () {
            coreListener.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
            node.setNodeStatusTo('active')
            callback()
          })
        }
      }, _callback)
    }

    node.eventQueue = new Queue(function (task, callback) {
      node.dumpQueueEvent(task.node, task.session, task.fields, task.eventFields, callback)
    })

    node.dumpEvent = function (node, session, fields, eventFields, _callback) {
      node.eventQueue.push({
        node: node, session: session, fields: fields, eventFields: eventFields, _callback: _callback
      })
    }

    node.handleSessionError = function (err) {
      coreListener.internalDebugLog('Handle Session Error '.red + err)

      if (node.showErrors) {
        node.error('Listener Session Error')
      }

      node.connector.closeSession(node.opcuaSession, function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      node.verboseLog('Listener Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreListener.core.TEN_SECONDS_TIMEOUT, 'Listener Node').then(function (session) {
        node.opcuaSession = session
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

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('input', function (msg) {
      node.verboseLog(node.action + ' listener input ' + JSON.stringify(msg))

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

      if (node.opcuaSession) {
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
