/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let opcuaIIoTCore = require('./core/opcua-iiot-core')
  let async = require('async')
  let Queue = require('async').queue
  let Set = require('collections/set')
  let DataType = opcuaIIoTCore.nodeOPCUA.DataType
  let AttributeIds = opcuaIIoTCore.nodeOPCUA.AttributeIds

  function OPCUAIIoTListener (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.action = config.action
    this.time = config.time
    this.timeUnit = config.timeUnit

    let node = this

    let opcuaEndpoint = RED.nodes.getNode(config.endpoint)
    let subscription // only one subscription needed to hold multiple monitored Items

    let monitoredItems = new Set(null, function (a, b) {
      return a.topicName === b.topicName
    }, function (object) {
      return object.topicName
    }) // multiple monitored Items should be registered only once

    /*  Subscription */
    function subscribeActionInput (msg) {
      if (!subscription) {
        // first build and start subscription and subscribe on its started event by callback
        let timeMilliseconds = opcuaIIoTCore.calcMillisecondsByTimeAndUnit(node.time, node.timeUnit)
        subscription = makeSubscription(subscribeMonitoredItem, msg, opcuaIIoTCore.getSubscriptionParameters(timeMilliseconds))
      } else {
        // otherwise check if its terminated start to renew the subscription
        if (subscription.subscriptionId !== 'terminated') {
          setNodeStatusTo('active subscribing')
          subscribeMonitoredItem(subscription, msg)
        } else {
          subscription = null
          monitoredItems.clear()
          setNodeStatusTo('terminated')
          opcuaEndpoint.resetOpcuaClient()
        }
      }
    }

    function subscribeMonitoredItem (subscription, msg) {
      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        let interval = 100

        if (typeof msg.payload === 'number') {
          interval = Number(msg.payload)
        }

        monitoredItem = subscription.monitor(
          {
            nodeId: msg.topic,
            attributeId: opcuaIIoTCore.nodeOPCUA.AttributeIds.Value
          },
          {
            samplingInterval: interval,
            queueSize: 10,
            discardOldest: true
          },
          3,
          function (err) {
            if (err) {
              node.error('subscription.monitorItem:' + err)
              opcuaEndpoint.resetOpcuaClient()
            }
          }
        )

        monitoredItems.add({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('changed', function (dataValue) {
          setNodeStatusTo('active subscribed')
          msg.payload = opcuaIIoTCore.buildNewValueByDatatype(dataValue.value.dataType, dataValue.value.value)
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

    function subscribeMonitoredEvent (subscription, msg) {
      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        let interval = 100

        if (typeof msg.payload === 'number') {
          interval = Number(msg.payload)
        }

        monitoredItem = subscription.monitor(
          {
            nodeId: msg.topic, // serverObjectId
            attributeId: AttributeIds.EventNotifier
          },
          {
            samplingInterval: interval,
            queueSize: 100000,
            filter: msg.eventFilter,
            discardOldest: true
          },
          3,
          function (err) {
            if (err) {
              node.error('subscription.monitorEvent:' + err)
              opcuaEndpoint.resetOpcuaClient()
            }
          }
        )

        monitoredItems.add({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('initialized', function () {
          setNodeStatusTo('initialized')
        })

        monitoredItem.on('changed', function (eventFields) {
          dumpEvent(node, node.session, msg.eventFields, eventFields, function () {
          })
          setNodeStatusTo('changed')
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

    function subscribeEventsInput (msg) {
      if (!subscription) {
        // first build and start subscription and subscribe on its started event by callback
        let timeMilliseconds = opcuaIIoTCore.calcMillisecondsByTimeAndUnit(node.time, node.timeUnit)
        subscription = makeSubscription(subscribeMonitoredEvent, msg, opcuaIIoTCore.getEventSubscribtionParameters(timeMilliseconds))
      } else {
        // otherwise check if its terminated start to renew the subscription
        if (subscription.subscriptionId !== 'terminated') {
          setNodeStatusTo('active subscribing')
          subscribeMonitoredEvent(subscription, msg)
        } else {
          subscription = null
          monitoredItems.clear()
          setNodeStatusTo('terminated')
          opcuaEndpoint.resetOpcuaClient()
        }
      }
    }

    function makeSubscription (callback, msg, parameters) {
      let newSubscription = null

      if (!node.session) {
        return newSubscription
      }

      if (!parameters) {
        return newSubscription
      }

      newSubscription = new opcuaIIoTCore.nodeOPCUA.ClientSubscription(node.session, parameters)

      newSubscription.on('initialized', function () {
        setNodeStatusTo('initialized')
      })

      newSubscription.on('started', function () {
        setNodeStatusTo('subscribed')
        monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('keepalive', function () {
        setNodeStatusTo('keepalive')
      })

      newSubscription.on('terminated', function () {
        setNodeStatusTo('terminated')
        subscription = null
        monitoredItems.clear()
      })

      return newSubscription
    }

    /* Events */
    function getBrowseName (session, nodeId, callback) {
      session.read([{nodeId: nodeId, attributeId: AttributeIds.BrowseName}], function (err, org, readValue) {
        if (!err) {
          if (readValue[0].statusCode === opcuaIIoTCore.nodeOPCUA.StatusCodes.Good) {
            let browseName = readValue[0].value.value.name
            return callback(null, browseName)
          }
        }
        callback(err, '<??>')
      })
    }

    // Fields selected alarm fields
    // EventFields same order returned from server array of variants (filled or empty)
    function __dumpEvent (node, session, fields, eventFields, _callback) {
      let msg = {}
      msg.payload = []

      async.forEachOf(eventFields, function (variant, index, callback) {
        if (variant.dataType === DataType.Null) {
          return callback('variants dataType is Null')
        }

        if (variant.dataType === DataType.NodeId) {
          getBrowseName(session, variant.value, function (err, name) {
            if (!err) {
              opcuaIIoTCore.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
              setNodeStatusTo('active event')
              node.send(msg)
            }
            callback(err)
          })
        } else {
          setImmediate(function () {
            opcuaIIoTCore.collectAlarmFields(fields[index], variant.dataType.key.toString(), variant.value, msg)
            setNodeStatusTo('active event')
            callback()
          })
        }
      }, _callback)
    }

    let eventQueue = new Queue(function (task, callback) {
      __dumpEvent(task.node, task.session, task.fields, task.eventFields, callback)
    })

    function dumpEvent (node, session, fields, eventFields, _callback) {
      eventQueue.push({
        node: node, session: session, fields: fields, eventFields: eventFields, _callback: _callback
      })
    }

    /* Node */
    function setNodeStatusTo (statusValue) {
      let statusParameter = opcuaIIoTCore.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    opcuaEndpoint.createOpcuaClient()

    node.on('input', function (msg) {
      if (!msg || !msg.topic) {
        return
      }

      if (!node.action) {
        return
      }

      if (!node.client || !node.session) {
        opcuaEndpoint.resetOpcuaClient()
        return
      }

      if (!node.session.sessionId === 'terminated') {
        opcuaEndpoint.resetOpcuaClient()
        return
      }

      switch (node.action) {
        case 'subscribe':
          subscribeActionInput(msg)
          break
        case 'events':
          subscribeEventsInput(msg)
          break
        default:
          break
      }
    })

    node.on('close', function () {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
      }

      if (node.session) {
        node.session.close(function (err) {
          setNodeStatusTo('session closed')
          if (err) {
            node.error(node.name + ' ' + err)
          }

          node.session = null
          opcuaEndpoint.closeOpcuaClient()
        })
      } else {
        node.session = null
        opcuaEndpoint.closeOpcuaClient()
      }
    })

    node.on('error', function () {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
      }

      if (node.session) {
        node.session.close(function (err) {
          if (err) {
            node.error(node.name + ' ' + err)
          }

          setNodeStatusTo('session closed')
          node.session = null
          opcuaEndpoint.closeOpcuaClient()
        })
      } else {
        node.session = null
        opcuaEndpoint.closeOpcuaClient()
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Listener', OPCUAIIoTListener)
}
