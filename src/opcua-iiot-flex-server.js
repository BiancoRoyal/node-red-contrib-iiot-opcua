/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * Server Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreServer = require('./core/opcua-iiot-core-server')
  const {VM} = require('vm2')
  let scriptObjects = {}

  function OPCUAIIoTFlexServer (config) {
    RED.nodes.createNode(this, config)
    coreServer.flex.internalDebugLog('Open Server Node')

    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(this)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)

    const vm = new VM({
      sandbox: {
        node,
        coreServer,
        scriptObjects,
        RED
      }
    })

    node.constructAddressSpaceScript = function (server, constructAddressSpaceScript, eventObjects) {
      server.internalDebugLog('Init Function Block Flex Server')
    }

    vm.run('node.constructAddressSpaceScript = ' + config.addressSpaceScript)

    coreServer.core.nodeOPCUA.OPCUAServer.MAX_SUBSCRIPTION = node.maxAllowedSubscriptionNumber

    node.buildServerOptions = function () {
      let geFullyQualifiedDomainName = coreServer.core.nodeOPCUA.get_fully_qualified_domain_name
      let makeApplicationUrn = coreServer.core.nodeOPCUA.makeApplicationUrn
      let today = new Date()

      let serverOptions = {
        port: node.port,
        nodeset_filename: node.xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDFlexIIoTServer',
        buildInfo: {
          productName: node.name || 'Node-RED Flex IIoT Server',
          buildNumber: today.timestamp,
          buildDate: today
        },
        serverCapabilities: {
          operationLimits: {
            maxNodesPerRead: node.maxNodesPerRead,
            maxNodesPerBrowse: node.maxNodesPerBrowse
          }
        },
        serverInfo: {
          // applicationType: ApplicationType.CLIENTANDSERVER,
          applicationUri: makeApplicationUrn(geFullyQualifiedDomainName(), 'NodeRED-Flex-IIoT-Server'),
          productUri: 'NodeRED-Flex-IIoT-Server',
          applicationName: {text: 'NodeRED', locale: 'en'},
          gatewayServerUri: null,
          discoveryProfileUri: null,
          discoveryUrls: []
        },
        maxAllowedSessionNumber: node.maxAllowedSessionNumber,
        maxConnectionsPerEndpoint: node.maxConnectionsPerEndpoint,
        allowAnonymous: node.allowAnonymous,
        certificateFile: node.publicCertificateFile,
        privateKeyFile: node.privateCertificateFile,
        alternateHostname: node.alternateHostname || '',
        userManager: {
          isValidUser: function (userName, password) {
            coreServer.checkUser(node, userName, password)
          }
        },
        isAuditing: node.isAuditing,
        disableDiscovery: node.disableDiscovery
      }

      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    node.createServer = function (serverOptions) {
      node.opcuaServer = new coreServer.core.nodeOPCUA.OPCUAServer(serverOptions)
      coreServer.core.setNodeStatusTo(node, 'waiting')
      node.opcuaServer.initialize(node.postInitialize)

      node.opcuaServer.on('newChannel', function (channel) {
        coreServer.flex.internalDebugLog('Client connected new channel with address = '.bgYellow, channel.remoteAddress, ' port = ', channel.remotePort)
      })

      node.opcuaServer.on('closeChannel', function (channel) {
        coreServer.flex.internalDebugLog('Client disconnected close channel with address = '.bgCyan, channel.remoteAddress, ' port = ', channel.remotePort)
      })

      node.opcuaServer.on('post_initialize', function () {
        coreServer.flex.internalDebugLog('Client initialized')
      })
    }

    node.initNewServer = function () {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = node.buildServerOptions()
      coreServer.flex.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))

      try {
        node.createServer(serverOptions)
      } catch (err) {
        node.emit('server_compile_error')
        coreServer.flex.internalDebugLog(err.message)
        node.error(err, {payload: 'Flex Server Failure! Please, check the server settings!'})
      }
    }

    node.postInitialize = function () {
      if (node.opcuaServer) {
        node.eventObjects = {} // event objects should stay in memory
        coreServer.constructAddressSpaceFromScript(node.opcuaServer, node.constructAddressSpaceScript, node.eventObjects).then(function () {
          coreServer.start(node.opcuaServer, node).then(function () {
            coreServer.core.setNodeStatusTo(node, 'active')
            node.emit('server_running')
          }).catch(function (err) {
            coreServer.core.setNodeStatusTo(node, 'errors')
            coreServer.flex.internalDebugLog(err)
            if (node.showErrors) {
              node.error(err, {payload: 'start'})
            }
          })
        }).catch(function (err) {
          coreServer.flex.internalDebugLog(err)
          if (node.showErrors) {
            node.error(err, {payload: 'constructAddressSpaceFromScript'})
          }
        })
      } else {
        node.initialized = false
        coreServer.flex.internalDebugLog('OPC UA Server Is Not Ready'.red)
        if (node.showErrors) {
          node.error(new Error('OPC UA Server Is Not Ready'), {payload: ''})
        }
      }
    }

    node.initNewServer()

    node.on('input', function (msg) {
      if (!node.opcuaServer || !node.initialized) {
        node.error(new Error('Server Not Ready For Inputs'), msg)
        return false
      }

      switch (msg.nodetype) {
        case 'CMD':
          node.executeOpcuaCommand(msg)
          break
        default:
          node.error(new Error('Unknown Node Type ' + msg.nodetype), msg)
      }

      node.send(msg)
    })

    node.executeOpcuaCommand = function (msg) {
      let addressSpace = node.opcuaServer.engine.addressSpace
      if (!addressSpace) {
        node.error(new Error('Server AddressSpace Not Valid'), msg)
      }

      switch (msg.payload.commandtype) {
        case 'restart':
          node.restartServer()
          break
        case 'deleteNode':
          if (msg.payload.nodeId) {
            let searchedNode = addressSpace.findNode(msg.payload.nodeId)
            if (searchedNode) {
              coreServer.flex.internalDebugLog('Delete NodeId ' + msg.payload.nodeId)
              addressSpace.deleteNode(searchedNode)
            } else {
              coreServer.flex.internalDebugLog('Delete NodeId Not Found ' + msg.payload.nodeId)
            }
          } else {
            node.error(new Error('OPC UA Command NodeId Not Valid'), msg)
          }
          break
        default:
          node.error(new Error('Unknown OPC UA Command'), msg)
      }
    }

    node.restartServer = function () {
      coreServer.flex.internalDebugLog('Restart OPC UA Server')

      if (node.opcuaServer) {
        node.opcuaServer.shutdown(function () {
          node.opcuaServer = null
          node.emit('shutdown')
          node.initNewServer()
        })
      } else {
        node.opcuaServer = null
        node.emit('shutdown')
        node.initNewServer()
      }

      if (node.opcuaServer) {
        coreServer.flex.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.flex.internalDebugLogr('Can not restart OPC UA Server')
      }
    }

    node.on('close', function (done) {
      node.closeServer(() => {
        coreServer.flex.internalDebugLog('Close Flex Server Node')
        done()
      })
    })

    node.closeServer = function (done) {
      if (coreServer.simulatorInterval) {
        clearInterval(coreServer.simulatorInterval)
        coreServer.simulatorInterval = null
      }

      if (node.opcuaServer) {
        node.opcuaServer.shutdown(node.delayToClose, done)
      } else {
        done()
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Server', OPCUAIIoTFlexServer)
}
