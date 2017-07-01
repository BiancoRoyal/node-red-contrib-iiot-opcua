/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * ISA95 server Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreServer = require('./core/opcua-iiot-core-server')
  let path = require('path')
  let os = require('os')

  let xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml'),
    path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.ISA95.NodeSet2.xml')]

  function OPCUAIIoTServerISA95 (config) {
    let counterValue = 0
    let vendorName
    let initialized = false
    let server = null

    RED.nodes.createNode(this, config)
    this.port = config.port
    this.endpoint = config.endpoint
    this.securityPolicy = config.securityPolicy
    this.messageSecurityMode = config.securityMode
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors

    let node = this

    node.opcuaServerOptions = {
      securityPolicy: coreServer.core.nodeOPCUA.SecurityPolicy[node.securityPolicy] || coreServer.core.nodeOPCUA.SecurityPolicy.None,
      securityMode: coreServer.core.nodeOPCUA.MessageSecurityMode[node.messageSecurityMode] || coreServer.core.nodeOPCUA.MessageSecurityMode.NONE
    }

    let nodeOPCUAPath = coreServer.core.getNodeOPCUAPath()

    node.publicCertificateFile = path.join(nodeOPCUAPath, '/certificates/server_selfsigned_cert_2048.pem')
    coreServer.detailDebugLog(node.publicCertificateFile)
    node.privateCertificateFile = path.join(nodeOPCUAPath, '/certificates/server_key_2048.pem')
    coreServer.detailDebugLog(node.privateCertificateFile)

    setNodeStatusTo('waiting')

    function setNodeStatusTo (statusValue) {
      let statusParameter = coreServer.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    coreServer.internalDebugLog('node set:' + xmlFiles.toString())

    function initNewServer () {
      initialized = false

      coreServer.name = 'NodeREDIIOTServerISA95'

      server = new coreServer.core.nodeOPCUA.OPCUAServer({
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDIIOTServerISA95',
        buildInfo: {
          productName: node.name.concat(' IIoT Server'),
          buildNumber: '160479',
          buildDate: new Date(2017, 5, 16)
        },
        serverCapabilities: {
          operationLimits: {
            maxNodesPerRead: 1000,
            maxNodesPerBrowse: 2000
          }
        },
        certificateFile: node.publicCertificate,
        privateKeyFile: node.privateCertificate,
        securityPolicy: node.opcuaServerOptions.securityPolicy,
        securityMode: node.opcuaServerOptions.securityMode,
        hostname: os.hostname(),
        userManager: {
          isValidUser: node.isValidUser
        }
      })

      server.initialize(postInitialize)

      let hostname = os.hostname()

      if (hostname) {
        let discoveryEndpointUrl = 'opc.tcp://' + hostname + ':4840/UADiscovery'
        coreServer.internalDebugLog('registering server to :' + discoveryEndpointUrl)

        server.registerServer(discoveryEndpointUrl, function (err) {
          if (err) {
            coreServer.internalDebugLog('Register Server Error' + err)
          } else {
            coreServer.internalDebugLog('Discovery Setup Done')
          }
        })
      }
    }

    // TODO: User Management from Node
    node.isValidUser = function (userName, userPassword) {
      if (userName === 'bianco' && userPassword === 'royal') {
        return true
      }
      if (userName === 'user' && userPassword === 'S3cr3t.OPCua') {
        return true
      }
      return false
    }

    function constructAddressSpace (addressSpace) {
      vendorName = addressSpace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        nodeId: 'ns=4;s=VendorName',
        browseName: 'VendorName'
      })

      let variable2 = 10.0

      addressSpace.addVariable({
        componentOf: vendorName,
        nodeId: 'ns=4;s=MyVariable2',
        browseName: 'MyVariable2',
        dataType: coreServer.core.nodeOPCUA.DataType.Double,

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
        nodeId: 'ns=4;s=FreeMemory',
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

        coreServer.internalDebugLog('Hello World ! I will bark ', nbBarks, ' times')
        coreServer.internalDebugLog('the requested volume is ', volume, '')
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
            coreServer.internalDebugLog('Server endpointUrl: ' + endpoint.endpointUrl + ' securityMode: ' + endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString())
          })

          let endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl
          coreServer.internalDebugLog(' the primary server endpoint url is ' + endpointUrl)
        })
        setNodeStatusTo('active')
        initialized = true
        coreServer.internalDebugLog('server initialized')
      } else {
        coreServer.internalDebugLog('server was not initialized')
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
            coreServer.internalDebugLog('addressSpace undefinded')
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
      coreServer.internalDebugLog('Restart OPC UA Server')

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
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLogr('Can not restart OPC UA server')
      }
    }

    node.on('close', function () {
      closeServer()
    })

    function closeServer () {
      if (server) {
        if (coreServer.simulatorInterval) {
          clearInterval(coreServer.simulatorInterval)
        }
        coreServer.simulatorInterval = null
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

  RED.nodes.registerType('OPCUA-IIoT-Server-ISA95', OPCUAIIoTServerISA95)

  RED.httpAdmin.get('/opcuaIIoT/server/ISA95/specifications', RED.auth.needsPermission('opcuaIIoT.server.ISA95.read'), function (req, res) {
    xmlFiles.list(function (err, ports) {
      if (err) {
        console.log(err)
      }
      res.json(ports)
    })
  })
}
