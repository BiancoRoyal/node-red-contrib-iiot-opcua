/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let opcua = require('node-opcua')
  let opcuaIIoTCore = require('./core/opcua-iiot-core')
  let nodeId = require('node-opcua/lib/datamodel/nodeid')
  let async = require('async')
  let Queue = require('async').queue
  let treeify = require('treeify')
  let Set = require('collections/set')
  let DataType = opcua.DataType
  let AttributeIds = opcua.AttributeIds

  function OPCUAIIoTReader (n) {
    RED.nodes.createNode(this, n)

    this.name = n.name
    this.action = n.action
    this.time = n.time
    this.timeUnit = n.timeUnit

    let node = this

    let opcuaEndpoint = RED.nodes.getNode(n.endpoint)
    let userIdentity = {}
    if (opcuaEndpoint.login) {
      userIdentity.userName = opcuaEndpoint.credentials.user
      userIdentity.password = opcuaEndpoint.credentials.password
    }
    let items = []
    let subscription // only one subscription needed to hold multiple monitored Items

    let monitoredItems = new Set(null, function (a, b) {
      return a.topicName === b.topicName
    }, function (object) {
      return object.topicName
    }) // multiple monitored Items should be registered only once

    function verboseWarn (logMessage) {
      if (RED.settings.verbose) {
        node.warn((node.name) ? node.name + ': ' + logMessage : 'OPCUAIIoTReader: ' + logMessage)
      }
    }

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        node.log(logMessage)
      }
    }

    function getBrowseName (session, nodeId, callback) {
      session.read([{nodeId: nodeId, attributeId: AttributeIds.BrowseName}], function (err, org, readValue) {
        if (!err) {
          if (readValue[0].statusCode === opcua.StatusCodes.Good) {
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

      verboseLog('EventFields=' + eventFields)

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

    function createOpcuaClient (callback) {
      node.client = null
      verboseWarn('create Client ...')
      node.client = new opcua.OPCUAClient()
      items = []
      node.items = items
      setNodeStatusTo('create client')
      if (callback) {
        callback()
      }
    }

    function resetOpcuaClient (callback) {
      if (node.client) {
        node.client.disconnect(function () {
          verboseLog('Client disconnected!')
          createOpcuaClient(callback)
        })
      }
    }

    function closeOpcuaClient (callback) {
      if (node.client) {
        node.client.disconnect(function () {
          node.client = null
          verboseLog('Client disconnected!')
          if (callback) {
            callback()
          }
        })
      }
    }

    function setNodeStatusTo (statusValue) {
      verboseLog('Client status: ' + statusValue)
      let statusParameter = opcuaIIoTCore.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    function connectOpcuaClient () {
      node.session = null

      async.series([
        // First connect to server´s endpoint
        function (callback) {
          verboseLog('async series - connecting ', opcuaEndpoint.endpoint)
          try {
            setNodeStatusTo('connecting')
            node.client.connect(opcuaEndpoint.endpoint, callback)
          } catch (err) {
            callback(err)
          }
        },
        function (callback) {
          verboseLog('async series - create session ...')
          try {
            node.client.createSession(userIdentity, function (err, session) {
              if (!err) {
                node.session = session
                node.session.timeout = opcuaIIoTCore.calcMllisecondsByTimeAndUnit(10, 's')
                node.session.startKeepAliveManager() // General for read/write/subscriptions/events
                verboseLog('session active')
                setNodeStatusTo('session active')
                callback()
              } else {
                setNodeStatusTo('session error')
                callback(err)
              }
            })
          } catch (err) {
            callback(err)
          }
        }
      ], function (err) {
        if (err) {
          node.error(node.name + ' OPC UA connection error: ' + err.message)
          verboseLog(err)
          node.session = null
          closeOpcuaClient(setNodeStatusTo('connection error'))
        }
      })
    }

    function makeSubscription (callback, msg, parameters) {
      let newSubscription = null

      if (!node.session) {
        verboseLog('Subscription without session')
        return newSubscription
      }

      if (!parameters) {
        verboseLog('Subscription without parameters')
        return newSubscription
      }

      newSubscription = new opcua.ClientSubscription(node.session, parameters)

      newSubscription.on('initialized', function () {
        verboseLog('Subscription initialized')
        setNodeStatusTo('initialized')
      })

      newSubscription.on('started', function () {
        verboseLog('Subscription subscribed ID: ' + newSubscription.subscriptionId)
        setNodeStatusTo('subscribed')
        monitoredItems.clear()
        callback(newSubscription, msg)
      })

      newSubscription.on('keepalive', function () {
        verboseLog('Subscription keepalive ID: ' + newSubscription.subscriptionId)
        setNodeStatusTo('keepalive')
      })

      newSubscription.on('terminated', function () {
        verboseLog('Subscription terminated ID: ' + newSubscription.subscriptionId)
        setNodeStatusTo('terminated')
        subscription = null
        monitoredItems.clear()
      })

      return newSubscription
    }

    createOpcuaClient(connectOpcuaClient)

    node.on('input', function (msg) {
      if (!node.action) {
        verboseWarn("can't work without action (read, write, browse ...)")
        // node.send(msg); // do not send in case of error
        return
      }

      if (!node.client || !node.session) {
        verboseWarn("can't work without OPC UA Session")
        resetOpcuaClient(connectOpcuaClient)
        // node.send(msg); // do not send in case of error
        return
      }

      // node.warn("secureChannelId:" + node.session.secureChannelId);

      if (!node.session.sessionId === 'terminated') {
        verboseWarn('terminated OPC UA Session')
        resetOpcuaClient(connectOpcuaClient)
        // node.send(msg); // do not send in case of error
        return
      }

      if (!msg || !msg.topic) {
        verboseWarn("can't work without OPC UA NodeId - msg.topic")
        // node.send(msg); // do not send in case of error
        return
      }

      verboseLog('Action on input:' + node.action +
        ' Item from Topic: ' + msg.topic +
        ' session Id: ' + node.session.sessionId)

      switch (node.action) {
        case 'read':
          readActionInput(msg)
          break
        case 'write':
          writeActionInput(msg)
          break
        case 'subscribe':
          subscribeActionInput(msg)
          break
        case 'browse':
          browseActionInput(msg)
          break
        case 'events':
          subscribeEventsInput(msg)
          break
        default:
          break
      }

      // node.send(msg); // msg.payload is here actual inject caused wrong values
    })

    function readActionInput (msg) {
      verboseLog('reading')

      items[0] = msg.topic // TODO support for multiple item reading
      if (node.session) {
        node.session.readVariableValue(items, function (err, dataValues, diagnostics) {
          if (err) {
            verboseLog('diagnostics:' + diagnostics)
            node.error(err)
            setNodeStatusTo('error')
            resetOpcuaClient(connectOpcuaClient)
          } else {
            setNodeStatusTo('active reading')

            for (let i = 0; i < dataValues.length; i++) {
              let dataValue = dataValues[i]

              verboseLog('\tNode : ' + (msg.topic).cyan.bold)

              if (dataValue) {
                try {
                  verboseLog('\tValue : ' + dataValue.value.value)
                  verboseLog('\tDataType: ' + dataValue.value.dataType + ' (' + dataValue.value.dataType.toString() + ')')
                  verboseLog('\tMessage: ' + msg.topic + ' (' + msg.datatype + ')')
                  if (msg.datatype.localeCompare(dataValue.value.dataType.toString()) !== 0) {
                    node.error('\tMessage types are not matching: ' + msg.topic + ' types: ' + msg.datatype + ' <> ' + dataValue.value.dataType.toString())
                  }
                  if (dataValue.value.dataType === opcua.DataType.UInt16) {
                    verboseLog('UInt16:' + dataValue.value.value + ' -> Int32:' + opcuaIIoTCore.toInt32(dataValue.value.value))
                  }

                  verboseLog('read item changed dataType: ' + dataValue.value.dataType + ' value:' + dataValue.value.value)
                  msg.payload = opcuaIIoTCore.buildNewValueByDatatype(dataValue.value.dataType, dataValue.value.value)

                  if (dataValue.statusCode && dataValue.statusCode.toString(16) === 'Good (0x00000)') {
                    verboseLog('\tStatus-Code:' + (dataValue.statusCode.toString(16)).green.bold)
                  } else {
                    verboseLog('\tStatus-Code:' + dataValue.statusCode.toString(16).red.bold)
                  }

                  node.send(msg)
                } catch (e) {
                  if (dataValue) {
                    node.error('\tBad read: ' + (dataValue.statusCode.toString(16)).red.bold)
                    node.error('\tMessage:' + msg.topic + ' dataType:' + msg.datatype)
                    node.error('\tData:' + JSON.stringify(dataValue))
                  } else {
                    node.error(e.message)
                  }
                }
              }
            }
          }
        })
      } else {
        setNodeStatusTo('Session invalid')
        node.error('Session is not active!')
      }
    }

    function writeActionInput (msg) {
      verboseLog('writing')

      // Topic value: ns=2;s=1:PST-007-Alarm-Level@Training?SETPOINT
      // Topic value: ns=2;s=10023
      // Topic value: ns=12;s=10023

      let nodeid = {} // new nodeId.NodeId(nodeId.NodeIdType.STRING, s, ns);

      let namespace = msg.topic.substring(3, msg.topic.indexOf(';')) // Parse namespace, ns=2

      verboseLog(opcua.browse_service.makeBrowsePath(msg.topic, '.'))

      let nodeIdent = null

      if (msg.topic.toString().includes(';s=')) {
        nodeIdent = msg.topic.substring(msg.topic.indexOf(';s=') + 3) // s=1:PST-007-Alarm-Level@Training?SETPOINT
        nodeid = new nodeId.NodeId(nodeId.NodeIdType.STRING, nodeIdent, parseInt(namespace))
      } else if (msg.topic.toString().includes(';i=')) {
        nodeIdent = msg.topic.substring(msg.topic.indexOf(';i=') + 3) // i=10023
        nodeid = new nodeId.NodeId(nodeId.NodeIdType.NUMERIC, parseInt(nodeIdent), parseInt(namespace))
      } else {
        verboseWarn('topic is not valid search for (;s=) or (;i=) -> ' + msg.topic)
        return
      }

      verboseLog('msg=' + JSON.stringify(msg))
      verboseLog('namespace=' + namespace)
      verboseLog('string=' + nodeIdent)
      verboseLog('value=' + msg.payload)
      verboseLog(nodeid.toString())

      let opcuaVariant = opcuaIIoTCore.buildNewVariant(opcua, msg.datatype, msg.payload)
      if (node.session) {
        node.session.writeSingleNode(nodeid, opcuaVariant, function (err) {
          if (err) {
            setNodeStatusTo('error')
            node.error(node.name + ' Cannot write value (' + msg.payload + ') to msg.topic:' + msg.topic + ' error:' + err)
            resetOpcuaClient(connectOpcuaClient)
          } else {
            setNodeStatusTo('active writing')
            verboseLog('Value written!')
          }
        })
      } else {
        setNodeStatusTo('Session invalid')
        node.error('Session is not active!')
      }
    }

    function subscribeActionInput (msg) {
      verboseLog('subscribing')

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
          resetOpcuaClient(connectOpcuaClient)
        }
      }
    }

    function subscribeMonitoredItem (subscription, msg) {
      verboseLog('Session subscriptionId: ' + subscription.subscriptionId)

      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        let interval = 100

        if (typeof msg.payload === 'number') {
          interval = Number(msg.payload)
        }

        verboseLog(msg.topic + ' samplingInterval ' + interval)
        verboseWarn('Monitoring Event: ' + msg.topic + ' by interval of ' + interval + ' ms')

        monitoredItem = subscription.monitor(
          {
            nodeId: msg.topic,
            attributeId: opcua.AttributeIds.Value
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
              resetOpcuaClient(connectOpcuaClient)
            }
          }
        )

        monitoredItems.add({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('initialized', function () {
          verboseLog('initialized monitoredItem on ' + msg.topic)
        })

        monitoredItem.on('changed', function (dataValue) {
          setNodeStatusTo('active subscribed')

          verboseLog(msg.topic + ' value has changed to ' + dataValue.value.value)

          if (dataValue.statusCode === opcua.StatusCodes.Good) {
            verboseLog('\tStatus-Code:' + (dataValue.statusCode.toString(16)).green.bold)
          } else {
            verboseLog('\tStatus-Code:' + dataValue.statusCode.toString(16))
          }

          verboseLog('subscribed item changed dataType: ' + dataValue.value.dataType + ' value:' + dataValue.value.value)
          msg.payload = opcuaIIoTCore.buildNewValueByDatatype(dataValue.value.dataType, dataValue.value.value)
          node.send(msg)
        })

        monitoredItem.on('keepalive', function () {
          verboseLog('keepalive monitoredItem on ' + msg.topic)
        })

        monitoredItem.on('terminated', function () {
          verboseLog('terminated monitoredItem on ' + msg.topic)
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
        })
      }

      return monitoredItem
    }

    function browseActionInput (msg) {
      verboseLog('browsing')

      let NodeCrawler = opcua.NodeCrawler
      let crawler = new NodeCrawler(node.session)

      crawler.read(msg.topic, function (err, obj) {
        let newMessage = opcuaIIoTCore.buildBrowseMessage(msg.topic)

        if (!err) {
          setNodeStatusTo('active browsing')

          treeify.asLines(obj, true, true, function (line) {
            verboseLog(line)

            if (line.indexOf('browseName') > 0) {
              newMessage.browseName = line.substring(line.indexOf('browseName') + 12)
            }
            if (line.indexOf('nodeId') > 0) {
              newMessage.nodeId = line.substring(line.indexOf('nodeId') + 8)
              newMessage.nodeId = newMessage.nodeId.replace('&#x2F;', '/')
            }
            if (line.indexOf('nodeClass') > 0) {
              newMessage.nodeClassType = line.substring(line.indexOf('nodeClass') + 11)
            }
            if (line.indexOf('typeDefinition') > 0) {
              newMessage.typeDefinition = line.substring(line.indexOf('typeDefinition') + 16)
              newMessage.payload = Date.now()
              node.send(newMessage)
            }

            setNodeStatusTo('browse done')
          })
        } else {
          node.error(err.message)
          setNodeStatusTo('error browsing')
          resetOpcuaClient(connectOpcuaClient)
        }
      })
    }

    function subscribeMonitoredEvent (subscription, msg) {
      verboseLog('Session subscriptionId: ' + subscription.subscriptionId)

      let monitoredItem = monitoredItems.get({'topicName': msg.topic})

      if (!monitoredItem) {
        let interval = 100

        if (typeof msg.payload === 'number') {
          interval = Number(msg.payload)
        }

        verboseLog(msg.topic + ' samplingInterval ' + interval)
        verboseWarn('Monitoring Event: ' + msg.topic + ' by interval of ' + interval + ' ms')

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
              resetOpcuaClient(connectOpcuaClient)
            }
          }
        )

        monitoredItems.add({'topicName': msg.topic, mItem: monitoredItem})

        monitoredItem.on('initialized', function () {
          verboseLog('monitored Event initialized')
          setNodeStatusTo('initialized')
        })

        monitoredItem.on('changed', function (eventFields) {
          dumpEvent(node, node.session, msg.eventFields, eventFields, function () {
          })
          setNodeStatusTo('changed')
        })

        monitoredItem.on('error', function (err) {
          verboseLog('error monitored Event on ' + msg.topic)
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
          node.err('monitored Event ', msg.eventTypeId, ' ERROR'.red, err)
          setNodeStatusTo('error')
        })

        monitoredItem.on('keepalive', function () {
          verboseLog('keepalive monitored Event on ' + msg.topic)
        })

        monitoredItem.on('terminated', function () {
          verboseLog('terminated monitored Event on ' + msg.topic)
          if (monitoredItems.get({'topicName': msg.topic})) {
            monitoredItems.delete({'topicName': msg.topic})
          }
        })
      }

      return monitoredItem
    }

    function subscribeEventsInput (msg) {
      verboseLog('subscribing events')

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
          resetOpcuaClient(connectOpcuaClient)
        }
      }
    }

    node.on('close', function () {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
        // subscription becomes null by its terminated event
      }

      if (node.session) {
        node.session.close(function (err) {
          verboseLog('Session closed')
          setNodeStatusTo('session closed')
          if (err) {
            node.error(node.name + ' ' + err)
          }

          node.session = null
          closeOpcuaClient(setNodeStatusTo('closed'))
        })
      } else {
        node.session = null
        closeOpcuaClient(setNodeStatusTo('closed'))
      }
    })

    node.on('error', function () {
      if (subscription && subscription.isActive()) {
        subscription.terminate()
        // subscription becomes null by its terminated event
      }

      if (node.session) {
        node.session.close(function (err) {
          verboseLog('Session closed on error emit')
          if (err) {
            node.error(node.name + ' ' + err)
          }

          setNodeStatusTo('session closed')
          node.session = null
          closeOpcuaClient(setNodeStatusTo('node error'))
        })
      } else {
        node.session = null
        closeOpcuaClient(setNodeStatusTo('node error'))
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Reader', OPCUAIIoTReader)
}
