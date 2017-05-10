/*
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Server Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  let coreServer = require('./core/opcua-iiot-core-server')
  let path = require('path')
  let os = require('os')
  let Map = require('collections/map')
  let xmlFiles = [path.join(__dirname, 'public/vendor/opc-foundation/xml/Opc.Ua.NodeSet2.xml')]

  function OPCUAIIoTServer (config) {
    let initialized = false
    let server = null
    let addressSpaceMessages = new Map()

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

    node.publicCertificate = null
    // path.join(__dirname, '../node_modules/node-opcua/certificates/server_cert_2048.pem')
    node.privateCertificate = null
    // path.join(__dirname, '../node_modules/node-opcua/certificates/server_key_2048.pem')

    setNodeStatusTo('waiting')

    function setNodeStatusTo (statusValue) {
      let statusParameter = coreServer.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    coreServer.internalDebugLog('node set:' + xmlFiles.toString())

    function initNewServer () {
      initialized = false

      coreServer.name = 'NodeREDIIOTServer'

      server = new coreServer.core.nodeOPCUA.OPCUAServer({
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDIIOTServer',
        buildInfo: {
          productName: node.name.concat(' IIoT Server'),
          buildNumber: '160417',
          buildDate: new Date(2017, 4, 16)
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

    function postInitialize () {
      if (server) {
        coreServer.constructAddressSpace(server)

        server.start(function () {
          server.endpoints[0].endpointDescriptions().forEach(function (endpoint) {
            coreServer.internalDebugLog('Server endpointUrl: ' + endpoint.endpointUrl + ' securityMode: ' +
              endpoint.securityMode.toString() + ' securityPolicyUri: ' + endpoint.securityPolicyUri.toString())
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

    initNewServer()

    node.on('input', function (msg) {
      if (server === undefined || !initialized) {
        return false
      }

      addressSpaceMessages.clear()

      let payload = msg.payload

      if (containsMessageType(payload)) {
        readMessage(payload)
      }

      if (msg && payload && containsOpcuaCommand(payload)) {
        executeOpcuaCommand(msg)
      }

      node.send([msg, {payload: addressSpaceMessages}])
    })

    function containsMessageType (payload) {
      return payload.hasOwnProperty('messageType')
    }

    function readMessage (payload) {
      switch (payload.messageType) {
        case 'Variable':
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
          initNewServer()
        })
      } else {
        server = null
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
        })
      } else {
        server = null
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)

  RED.httpAdmin.get('/opcuaIIoT/server/specifications', RED.auth.needsPermission('opcuaIIoT.server.read'), function (req, res) {
    xmlFiles.list(function (err, ports) {
      if (err) {
        console.log(err)
      }
      res.json(ports)
    })
  })
}
