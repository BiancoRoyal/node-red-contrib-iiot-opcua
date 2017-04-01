/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

module.exports = function (RED) {
  let coreServer = require('./core/opcua-iiot-core-server')
  let path = require('path')
  let os = require('os')

  let xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml')]

  function OPCUAIIoTServer (config) {
    let node
    let counterValue = 0
    let vendorName
    let initialized = false
    let server = null

    RED.nodes.createNode(this, config)
    this.port = config.port
    this.endpoint = config.endpoint
    this.name = config.name
    this.statusLog = config.statusLog

    node = this

    setNodeStatusTo('waiting')

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        coreServer.core.internalDebugLog(logMessage)
      }
    }

    function statusLog (logMessage) {
      if (RED.settings.verbose && node.statusLog) {
        coreServer.core.internalDebugLog('Status: ' + logMessage)
      }
    }

    function setNodeStatusTo (statusValue) {
      statusLog(statusValue)
      let statusParameter = coreServer.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    coreServer.core.internalDebugLog('node set:' + xmlFiles.toString())

    function initNewServer () {
      initialized = false

      server = new coreServer.core.nodeOPCUA.OPCUAServer({
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDIIOTServer',
        buildInfo: {
          productName: node.name.concat(' IIoT Server'),
          buildNumber: '1604',
          buildDate: new Date(2017, 4, 1)
        }
      })

      server.initialize(postInitialize)
    }

    function constructAddressSpace (addressSpace) {
      vendorName = addressSpace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        nodeId: 'ns=4;s=VendorName',
        browseName: 'VendorName'
      })

      let variable1 = 1

      setInterval(function () { variable1 += 1 }, 500)

      addressSpace.addVariable({
        componentOf: vendorName,
        browseName: 'MyVariable1',
        dataType: 'Double',
        value: {
          get: function () {
            return new coreServer.core.nodeOPCUA.Variant({
              dataType: coreServer.core.nodeOPCUA.DataType.Double,
              value: variable1
            })
          }
        }
      })

      let variable2 = 10.0

      server.engine.addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=1;b=1020FFAA',
        browseName: 'MyVariable2',
        dataType: 'Double',
        value: {
          get: function () {
            return new coreServer.core.nodeOPCUA.Variant({
              dataType: coreServer.core.nodeOPCUA.DataType.Double,
              value: variable2
            })
          },
          set: function (variant) {
            variable2 = parseFloat(variant.value)
            return coreServer.core.nodeOPCUA.StatusCodes.Good
          }
        }
      })

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=free_memory',
        browseName: 'FreeMemory',
        dataType: coreServer.core.nodeOPCUA.DataType.Double,

        value: {
          get: function () {
            return new coreServer.core.nodeOPCUA.Variant({
              dataType: coreServer.core.nodeOPCUA.DataType.Double,
              value: availableMemory()
            })
          }
        }
      })

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=Counter',
        browseName: 'Counter',
        dataType: coreServer.core.nodeOPCUA.DataType.UInt16,

        value: {
          get: function () {
            return new coreServer.core.nodeOPCUA.Variant({
              dataType: coreServer.core.nodeOPCUA.DataType.UInt16,
              value: counterValue
            })
          }
        }
      })

      let method = addressSpace.addMethod(
        vendorName, {
          browseName: 'Bark',

          inputArguments: [
            {
              name: 'nbBarks',
              description: {text: 'specifies the number of time I should bark'},
              dataType: coreServer.core.nodeOPCUA.DataType.UInt32
            }, {
              name: 'volume',
              description: {text: 'specifies the sound volume [0 = quiet ,100 = loud]'},
              dataType: coreServer.core.nodeOPCUA.DataType.UInt32
            }
          ],

          outputArguments: [{
            name: 'Barks',
            description: {text: 'the generated barks'},
            dataType: coreServer.core.nodeOPCUA.DataType.String,
            valueRank: 1
          }]
        })

      method.bindMethod(function (inputArguments, context, callback) {
        let nbBarks = inputArguments[0].value
        let volume = inputArguments[1].value

        verboseLog('Hello World ! I will bark ', nbBarks, ' times')
        verboseLog('the requested volume is ', volume, '')
        let soundVolume = new Array(volume).join('!')

        let barks = []
        for (let i = 0; i < nbBarks; i++) {
          barks.push('Whaff' + soundVolume)
        }

        let callMethodResult = {
          statusCode: coreServer.core.nodeOPCUA.StatusCodes.Good,
          outputArguments: [{
            dataType: coreServer.core.nodeOPCUA.DataType.String,
            arrayType: coreServer.core.nodeOPCUA.VariantArrayType.Array,
            value: barks
          }]
        }
        callback(null, callMethodResult)
      })
    }

    function postInitialize () {
      if (server) {
        let addressSpace = server.engine.addressSpace
        constructAddressSpace(addressSpace)

        server.start(function () {
          server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
            coreServer.core.internalDebugLog('Server endpointUrl: ' + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString())
          })

          let endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl
          verboseLog(' the primary server endpoint url is ' + endpointUrl)
        })
        setNodeStatusTo('active')
        initialized = true
        coreServer.core.internalDebugLog('server initialized')
      } else {
        coreServer.core.internalDebugLog('server was not initialized')
      }
    }

    function availableMemory () {
      return os.freemem() / os.totalmem() * 100.0
    }

    initNewServer()

    node.on('input', function (msg) {
      if (server === undefined || !initialized) {
        return false
      }

      let payload = msg.payload

      if (containsMessageType(payload)) {
        readMessage(payload)
      }

      if (msg && payload && containsOpcuaCommand(payload)) {
        executeOpcuaCommand(msg)
      }

      node.send(msg)
    })

    function containsMessageType (payload) {
      return payload.hasOwnProperty('messageType')
    }

    function readMessage (payload) {
      switch (payload.messageType) {
        case 'Variable':
          if (payload.variableName === 'Counter') {
            // Code for the Node-RED function to send the data by an inject
            // msg = { payload : { "messageType" : "Variable", "variableName": "Counter", "variableValue": msg.payload }};
            // return msg;
            counterValue = payload.variableValue
          }
          break
        default:
          break
      }
    }

    function containsOpcuaCommand (payload) {
      return payload.hasOwnProperty('opcuaCommand')
    }

    function executeOpcuaCommand (msg) {
      let addressSpace = server.engine.addressSpace

      switch (msg.payload.opcuaCommand) {
        case 'restartOPCUAServer':
          restartServer()
          break
        case 'deleteNode':
          if (addressSpace === undefined) {
            coreServer.core.internalDebugLog('addressSpace undefinded')
            return false
          }

          let searchedNode = addressSpace.findNode(msg.payload.nodeId)
          if (searchedNode !== undefined) {
            addressSpace.deleteNode(searchedNode)
          }
          break
        default:
          node.error(new Error('Unknown OPC UA Command'), msg)
      }
    }

    function restartServer () {
      coreServer.core.internalDebugLog('Restart OPC UA Server')

      if (server) {
        server.shutdown(0, function () {
          server = null
          vendorName = null
          initNewServer()
        })
      } else {
        server = null
        vendorName = null
        initNewServer()
      }

      if (server) {
        coreServer.core.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.core.internalDebugLogr('Can not restart OPC UA server')
      }
    }

    node.on('close', function () {
      closeServer()
    })

    function closeServer () {
      if (server) {
        server.shutdown(0, function () {
          server = null
          vendorName = null
        })
      } else {
        server = null
        vendorName = null
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)

  RED.httpAdmin.get('/opcua/server/specifications', RED.auth.needsPermission('coreServer.core.nodeOPCUA.server.read'), function (req, res) {
    xmlFiles.list(function (err, ports) {
      if (err) console.log(err)
      res.json(ports)
    })
  })
}
