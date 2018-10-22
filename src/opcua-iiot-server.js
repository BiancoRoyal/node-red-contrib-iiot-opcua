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
  let LocalizedText = require('node-opcua').LocalizedText

  function OPCUAIIoTServer (config) {
    RED.nodes.createNode(this, config)
    coreServer.internalDebugLog('Open Server Node')

    this.asoDemo = config.asoDemo // ASO (address space objects) Demo
    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(this)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)

    coreServer.core.nodeOPCUA.OPCUAServer.MAX_SUBSCRIPTION = node.maxAllowedSubscriptionNumber

    node.buildServerOptions = function () {
      let geFullyQualifiedDomainName = coreServer.core.nodeOPCUA.get_fully_qualified_domain_name
      let makeApplicationUrn = coreServer.core.nodeOPCUA.makeApplicationUrn
      let today = new Date()

      let serverOptions = {
        port: node.port,
        nodeset_filename: node.xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDIIoTServer',
        buildInfo: {
          productName: node.name || 'NodeOPCUA IIoT Server',
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
          applicationUri: makeApplicationUrn(geFullyQualifiedDomainName(), 'NodeRED-IIoT-Server'),
          productUri: 'NodeRED-IIoT-Server',
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
            return coreServer.checkUser(node, userName, password)
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
        coreServer.internalDebugLog('Client connected new channel with address = '.bgYellow, channel.remoteAddress, ' port = ', channel.remotePort)
      })

      node.opcuaServer.on('closeChannel', function (channel) {
        coreServer.internalDebugLog('Client disconnected close channel with address = '.bgCyan, channel.remoteAddress, ' port = ', channel.remotePort)
      })
    }

    node.initNewServer = function () {
      node = coreServer.initRegisterServerMethod(node)

      let serverOptions = node.buildServerOptions()
      serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)
      coreServer.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))

      try {
        node.createServer(serverOptions)
      } catch (err) {
        node.emit('server_start_error')
        coreServer.internalDebugLog(err.message)
        node.error(err, {payload: 'Server Failure! Please, check the server settings!'})
      }
    }

    node.postInitialize = function () {
      coreServer.constructAddressSpace(node.opcuaServer, node.asoDemo).then(function (err) {
        if (err) {
          coreServer.internalDebugLog(err)
          if (node.showErrors) {
            node.error(err, {payload: ''})
          }
        } else {
          coreServer.start(node.opcuaServer, node).then(function () {
            coreServer.core.setNodeStatusTo(node, 'active')
            node.emit('server_running')
          }).catch(function (err) {
            node.opcuaServer = null
            coreServer.core.setNodeStatusTo(node, 'errors')
            coreServer.internalDebugLog(err)
            if (node.showErrors) {
              node.error(err, {payload: ''})
            }
          })
        }
      }).catch(function (err) {
        coreServer.internalDebugLog(err)
        if (node.showErrors) {
          node.error(err, {payload: ''})
        }
      })
    }

    node.initNewServer()

    node.on('input', function (msg) {
      if (!node.opcuaServer || !node.initialized) {
        if (node.showErrors) {
          node.error(new Error('Server Not Ready For Inputs'), msg)
        }
        return false
      }

      switch (msg.injectType) {
        case 'ASO':
          node.changeAddressSpace(msg)
          break

        case 'CMD':
          node.executeOpcuaCommand(msg)
          break
        default:
          node.error(new Error('Unknown Inject Type ' + msg.injectType), msg)
      }

      node.send(msg)
    })

    node.changeAddressSpace = function (msg) { // TODO: refactor to work with the new OPC UA type list
      if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Variable') > -1) {
        node.addVariableToAddressSpace(msg, msg.payload.objecttype)
      } else {
        node.addObjectToAddressSpace(msg, msg.payload.objecttype)
      }
    }

    node.addVariableToAddressSpace = function (msg, humanReadableType) {
      let addressSpace = node.opcuaServer.engine.addressSpace
      if (!addressSpace) {
        node.error(new Error('Server AddressSpace Not Valid'), msg)
      }

      let rootFolder = addressSpace.findNode(msg.payload.referenceNodeId)
      let variableData = coreServer.core.getVariantValue(msg.payload.datatype, msg.payload.value)

      if (rootFolder) {
        addressSpace.getOwnNamespace().addVariable({
          componentOf: rootFolder,
          nodeId: msg.payload.nodeId,
          browseName: msg.payload.browsename,
          displayName: new LocalizedText({locale: null, text: msg.payload.displayname}),
          dataType: msg.payload.datatype,
          value: {
            get () {
              return new coreServer.core.nodeOPCUA.Variant({
                dataType: coreServer.core.nodeOPCUA.DataType[msg.payload.datatype],
                value: variableData
              })
            },
            set (variant) {
              variableData = variant.value
              return coreServer.core.nodeOPCUA.StatusCodes.Good
            }
          }
        })
        coreServer.internalDebugLog(msg.payload.nodeId + ' ' + humanReadableType + ' Added To Address Space')
      } else {
        node.error(new Error('Root Reference Not Found'), msg)
      }
    }

    node.addObjectToAddressSpace = function (msg, humanReadableType) {
      let addressSpace = node.opcuaServer.engine.addressSpace
      if (!addressSpace) {
        node.error(new Error('Server AddressSpace Not Valid'), msg)
      }

      let rootFolder = addressSpace.findNode(msg.payload.referenceNodeId)

      if (rootFolder) {
        addressSpace.getOwnNamespace().addObject({
          organizedBy: rootFolder,
          nodeId: msg.payload.nodeId,
          browseName: msg.payload.browsename,
          displayName: new LocalizedText({locale: null, text: msg.payload.displayname})
        })
        coreServer.internalDebugLog(msg.payload.nodeId + ' ' + humanReadableType + ' Added To Address Space')
      } else {
        node.error(new Error('Root Reference Not Found'), msg)
      }
    }

    node.deleteNOdeFromAddressSpace = function (msg) {
      let addressSpace = node.opcuaServer.engine.addressSpace
      if (!addressSpace) {
        node.error(new Error('Server AddressSpace Not Valid'), msg)
      }
      if (msg.payload.nodeId) {
        let searchedNode = addressSpace.findNode(msg.payload.nodeId)
        if (searchedNode) {
          coreServer.internalDebugLog('Delete NodeId ' + msg.payload.nodeId)
          addressSpace.deleteNode(searchedNode)
        } else {
          coreServer.internalDebugLog('Delete NodeId Not Found ' + msg.payload.nodeId)
        }
      } else {
        node.error(new Error('OPC UA Command NodeId Not Valid'), msg)
      }
    }

    node.executeOpcuaCommand = function (msg) {
      switch (msg.commandType) {
        case 'restart':
          node.restartServer()
          break
        case 'deleteNode':
          node.deleteNOdeFromAddressSpace(msg)
          break
        default:
          node.error(new Error('Unknown OPC UA Command'), msg)
      }
    }

    node.restartServer = function () {
      coreServer.internalDebugLog('Restart OPC UA Server')

      if (node.opcuaServer) {
        node.opcuaServer.shutdown(function () {
          node.emit('shutdown')
          node.initNewServer()
        })
      } else {
        node.opcuaServer = null
        node.emit('shutdown')
        node.initNewServer()
      }

      node.send({payload: 'server shutdown'})
      coreServer.core.setNodeStatusTo(node, 'shutdown')

      if (node.opcuaServer) {
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', (done) => {
      node.closeServer(() => {
        coreServer.flex.internalDebugLog('Close Server Node')
        done()
      })
    })

    node.closeServer = function (done) {
      coreServer.destructAddressSpace()
      node.opcuaServer.shutdown(node.delayToClose, done)
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
