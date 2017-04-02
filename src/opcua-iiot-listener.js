/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

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

    setNodeStatusTo('waiting')

    node.createSubscription = function (msg, cb) {
      let timeMilliseconds = msg.payload
      coreListener.internalDebugLog('create subscription')
      subscription = node.makeSubscription(cb, msg, coreListener.getSubscriptionParameters(timeMilliseconds))
    }

    node.resetSubscription = function () {
      subscription = null
      monitoredItems.clear()
      setNodeStatusTo('reset')
    }

    node.subscribeActionInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredItem)
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          setNodeStatusTo('active')
          node.subscribeMonitoredItem(subscription, msg)
        } else {
          node.resetSubscription()
        }
      }
    }

    node.subscribeMonitoredItem = function (subscription, msg) {
      if (!monitoredItems) {
        coreListener.internalDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.queueSize) {
        msg.queueSize = coreListener.SUBSCRIBE_DEFAULT_QUEUE_SIZE
      }

      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        monitoredItem = coreListener.buildNewMonitoredItem(msg, subscription, function (err) {
          if (err) {
            node.error('subscription.monitorItem:' + err)
          }
        })

        monitoredItem.on('initialized', function () {
          setNodeStatusTo('subscribed')
        })

        monitoredItems.set({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('changed', function (dataValue) {
          setNodeStatusTo('active')
          msg.payload = coreListener.core.buildMsgPayloadByDataValue(dataValue)
          node.send(msg)
        })

        monitoredItem.on('terminated', function () {
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
        })
      }

      return monitoredItem
    }

    node.subscribeMonitoredEvent = function (subscription, msg) {
      if (!monitoredItems) {
        coreListener.internalDebugLog('Monitored Item Set Not Valid')
        return
      }

      if (!msg.queueSize) {
        msg.queueSize = coreListener.EVENT_DEFAULT_QUEUE_SIZE
      }

      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        monitoredItem = coreListener.buildNewEventItem(msg, subscription, function (err) {
          if (err) {
            node.error('subscription.monitorEvent:' + err)
          }
        })

        monitoredItems.set({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('initialized', function () {
          setNodeStatusTo('listening')
        })

        monitoredItem.on('changed', function (eventFields) {
          dumpEvent(node, node.opcuaSession, msg.eventFields, eventFields, function (err) {
            if (err) {
              coreListener.internalDebugLog(err)
            } else {
              coreListener.internalDebugLog('successful event call')
            }
          })
          setNodeStatusTo('active')
        })

        monitoredItem.on('error', function (err) {
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
          node.err('monitored Event ', msg.eventTypeId, ' ERROR'.red, err)
          setNodeStatusTo('error')
        })

        monitoredItem.on('terminated', function () {
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
        })
      }

      return monitoredItem
    }

    node.subscribeEventsInput = function (msg) {
      if (!subscription) {
        node.createSubscription(msg, node.subscribeMonitoredEvent)
        setNodeStatusTo('active')
      } else {
        if (subscription.subscriptionId !== 'terminated') {
          setNodeStatusTo('active')
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
        setNodeStatusTo('initialize')
      })

      newSubscription.on('started', function () {
        setNodeStatusTo('started')
        monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('keepalive', function () {
        setNodeStatusTo('keepalive')
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
    function __dumpEvent (node, session, fields, eventFields, _callback) {
      coreListener.internalDebugLog('Send Event Information')
      let msg = {}
      msg.payload = []

      async.forEachOf(eventFields, function (variant, index, callback) {
        coreListener.internalDebugLog('Event Information Index:' + index + ' variant: ' + JSON.stringify(variant))

        if (variant.dataType === DataType.Null) {
          return callback(new Error('variants dataType is Null'))
        }

        if (variant.dataType === DataType.NodeId) {
          node.getBrowseName(session, variant.value, function (err, name) {
            if (!err) {
              coreListener.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
              setNodeStatusTo('active')
              node.send(msg)
            }
            callback(err)
          })
        } else {
          setImmediate(function () {
            coreListener.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
            setNodeStatusTo('active')
            callback()
          })
        }
      }, _callback)
    }

    let eventQueue = new Queue(function (task, callback) {
      __dumpEvent(task.node, task.session, task.fields, task.eventFields, callback)
    })

    function dumpEvent (node, session, fields, eventFields, _callback) {
      coreListener.internalDebugLog('Push Into Event Queue')
      eventQueue.push({
        node: node, session: session, fields: fields, eventFields: eventFields, _callback: _callback
      })
    }

    function statusLog (logMessage) {
      if (RED.settings.verbose && node.statusLog) {
        coreListener.internalDebugLog('Status: ' + logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      statusLog(statusValue)
      let statusParameter = coreListener.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.handleSessionError = function (err) {
      if (node.showErrors) {
        node.error(err, {payload: 'Listener Session Error'})
      }

      node.connector.closeSession(function () {
        node.startOPCUASession(node.opcuaClient)
      })
    }

    node.startOPCUASession = function (opcuaClient) {
      coreListener.internalDebugLog('Listener Start OPC UA Session')
      node.opcuaClient = opcuaClient
      node.connector.startSession(coreListener.core.TEN_SECONDS_TIMEOUT).then(function (session) {
        node.opcuaSession = session
        setNodeStatusTo('connected')
      }).catch(node.handleSessionError)
    }

    if (node.connector) {
      node.connector.on('connected', node.startOPCUASession)
    } else {
      throw new TypeError('Connector Not Valid')
    }

    node.on('input', function (msg) {
      coreListener.internalDebugLog(node.action + ' listener input ' + JSON.stringify(msg))

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

    node.on('close', function () {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
