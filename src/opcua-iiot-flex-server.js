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
  let path = require('path')
  const {VM} = require('vm2')
  let scriptObjects = {}

  function OPCUAIIoTFlexServer (config) {
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)

    this.port = config.port
    this.endpoint = config.endpoint
    this.maxAllowedSessionNumber = parseInt(config.maxAllowedSessionNumber) || 10
    this.maxConnectionsPerEndpoint = parseInt(config.maxConnectionsPerEndpoint) || 10
    this.maxAllowedSubscriptionNumber = parseInt(config.maxAllowedSubscriptionNumber) || 50
    this.alternateHostname = config.alternateHostname
    this.name = config.name
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.publicCertificateFile = config.publicCertificateFile
    this.privateCertificateFile = config.privateCertificateFile
    // Security
    this.allowAnonymous = config.allowAnonymous
    // User Management
    this.users = config.users
    // XML-Set Management
    this.xmlsets = config.xmlsets
    // Audit
    this.isAuditing = config.isAuditing
    // discovery
    this.disableDiscovery = !config.serverDiscovery
    this.registerServerMethod = config.registerServerMethod || 1
    this.discoveryServerEndpointUrl = config.discoveryServerEndpointUrl
    this.capabilitiesForMDNS = (config.capabilitiesForMDNS) ? config.capabilitiesForMDNS.split(',') : [config.capabilitiesForMDNS]
    // limits
    this.maxNodesPerRead = config.maxNodesPerRead || 1000
    this.maxNodesPerBrowse = config.maxNodesPerBrowse || 2000
    this.delayToClose = config.delayToClose || 1000

    let node = this
    coreServer.flex.internalDebugLog('Open Flex Server Node')
    node.setMaxListeners(UNLIMITED_LISTENERS)
    node.initialized = false
    node.opcuaServer = null

    node.assert = require('better-assert')

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
    let geFullyQualifiedDomainName = coreServer.core.nodeOPCUA.get_fully_qualified_domain_name
    let makeApplicationUrn = coreServer.core.nodeOPCUA.makeApplicationUrn

    let standardNodeSetFile = coreServer.core.nodeOPCUA.standard_nodeset_file
    let xmlFiles = [standardNodeSetFile]

    if (node.xmlsets) {
      node.xmlsets.forEach(function (xmlsetFileName, i) {
        coreServer.flex.detailDebugLog('Load XML Set for ' + xmlsetFileName.name)
        if (xmlsetFileName.path) {
          if (xmlsetFileName.path.startsWith('public/vendor/')) {
            xmlFiles.push(path.join(__dirname, xmlsetFileName.path))
          } else {
            xmlFiles.push(xmlsetFileName.path)
          }

          if (xmlsetFileName.path.includes('ISA95')) {
            // add server ISA95 extension to node-opcua
            coreServer.isa95DebugLog('installing ISA95 extend')
            // require('node-opcua-isa95')(coreServer.core.nodeOPCUA)
          }
        }
      })
      coreServer.flex.detailDebugLog('append xmlFiles: ' + xmlFiles.toString())
    }

    let nodeOPCUAServerPath = coreServer.core.getNodeOPCUAServerPath()

    coreServer.flex.detailDebugLog('config: ' + node.publicCertificateFile)
    if (node.publicCertificateFile === null || node.publicCertificateFile === '') {
      node.publicCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/server_selfsigned_cert_2048.pem')
      coreServer.flex.detailDebugLog('default key: ' + node.publicCertificateFile)
    }

    coreServer.flex.detailDebugLog('config: ' + node.privateCertificateFile)
    if (node.privateCertificateFile === null || node.privateCertificateFile === '') {
      node.privateCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/PKI/own/private/private_key.pem')
      coreServer.flex.detailDebugLog('default key: ' + node.privateCertificateFile)
    }

    coreServer.core.setNodeStatusTo(node, 'waiting')
    coreServer.flex.internalDebugLog('flex node sets:' + xmlFiles.toString())

    node.checkUser = function (userName, password) {
      let isValid = false
      coreServer.flex.internalDebugLog('Is Valid Server User?')

      node.users.forEach(function (user, index, array) {
        if (userName === user.name && password === user.password) {
          coreServer.flex.internalDebugLog('Valid Server User Found')
          isValid = true
        }
      })

      return isValid
    }

    node.initNewServer = function () {
      node.initialized = false
      node.opcuaServer = null

      switch (parseInt(node.registerServerMethod)) {
        case 2:
          node.registerServerMethod = coreServer.core.nodeOPCUA.RegisterServerMethod.MDNS
          break
        case 3:
          node.registerServerMethod = coreServer.core.nodeOPCUA.RegisterServerMethod.LDS
          break
        default:
          node.registerServerMethod = coreServer.core.nodeOPCUA.RegisterServerMethod.HIDDEN
      }

      let serverOptions = {
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDFlexIIoTServer',
        buildInfo: {
          productName: node.name || 'Node-RED Flex IIoT Server',
          buildNumber: '20180701',
          buildDate: new Date(2018, 7, 1)
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
          isValidUser: node.checkUser
        },
        isAuditing: node.isAuditing,
        disableDiscovery: node.disableDiscovery
      }

      if (!node.disableDiscovery) {
        serverOptions.registerServerMethod = node.registerServerMethod

        if (node.discoveryServerEndpointUrl && node.discoveryServerEndpointUrl !== '') {
          serverOptions.discoveryServerEndpointUrl = node.discoveryServerEndpointUrl
        }

        if (node.capabilitiesForMDNS && node.capabilitiesForMDNS.length) {
          serverOptions.capabilitiesForMDNS = node.capabilitiesForMDNS
        }
      }

      coreServer.flex.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))

      try {
        node.opcuaServer = new coreServer.core.nodeOPCUA.OPCUAServer(serverOptions)

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
      } catch (err) {
        node.emit('server_compile_error')
        coreServer.flex.internalDebugLog(err.message)
        node.error(err, {payload: 'Server Failure! Please, check the server settings!'})
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
              node.error(err, {payload: ''})
            }
          })
        }).catch(function (err) {
          coreServer.flex.internalDebugLog(err)
          if (node.showErrors) {
            node.error(err, {payload: ''})
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
