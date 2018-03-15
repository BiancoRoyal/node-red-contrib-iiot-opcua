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
  let os = require('os')
  let LocalizedText = require('node-opcua').LocalizedText

  function OPCUAIIoTServer (config) {
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
    // address space objects demo
    this.asoDemo = config.asoDemo
    // discovery
    this.disableDiscovery = !config.serverDiscovery
    // limits
    this.maxNodesPerRead = config.maxNodesPerRead || 1000
    this.maxNodesPerBrowse = config.maxNodesPerBrowse || 2000

    let node = this
    node.initialized = false
    node.opcuaServer = null

    coreServer.core.nodeOPCUA.OPCUAServer.MAX_SUBSCRIPTION = node.maxAllowedSubscriptionNumber
    let geFullyQualifiedDomainName = coreServer.core.nodeOPCUA.get_fully_qualified_domain_name
    let makeApplicationUrn = coreServer.core.nodeOPCUA.makeApplicationUrn

    let standardNodeSetFile = coreServer.core.nodeOPCUA.standard_nodeset_file
    let xmlFiles = [standardNodeSetFile]

    if (node.xmlsets) {
      node.xmlsets.forEach(function (xmlsetFileName, i) {
        coreServer.detailDebugLog('Load XML Set for ' + xmlsetFileName.name)
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
      coreServer.detailDebugLog('append xmlFiles: ' + xmlFiles.toString())
    }

    let nodeOPCUAServerPath = coreServer.core.getNodeOPCUAServerPath()

    coreServer.detailDebugLog('config: ' + node.publicCertificateFile)
    if (node.publicCertificateFile === null || node.publicCertificateFile === '') {
      node.publicCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/server_selfsigned_cert_2048.pem')
      coreServer.detailDebugLog('default key: ' + node.publicCertificateFile)
    }

    coreServer.detailDebugLog('config: ' + node.privateCertificateFile)
    if (node.privateCertificateFile === null || node.privateCertificateFile === '') {
      node.privateCertificateFile = path.join(nodeOPCUAServerPath, '/certificates/PKI/own/private/private_key.pem')
      coreServer.detailDebugLog('default key: ' + node.privateCertificateFile)
    }

    node.setNodeStatusTo = function (statusValue) {
      let statusParameter = coreServer.core.getNodeStatus(statusValue)
      node.status({fill: statusParameter.fill, shape: statusParameter.shape, text: statusParameter.status})
    }

    node.setNodeStatusTo('waiting')
    coreServer.internalDebugLog('node set:' + xmlFiles.toString())

    node.checkUser = function (userName, password) {
      let isValid = false
      coreServer.internalDebugLog('Is Valid Server User?')

      node.users.forEach(function (user, index, array) {
        if (userName === user.name && password === user.password) {
          coreServer.internalDebugLog('Valid Server User Found')
          isValid = true
        }
      })

      return isValid
    }

    node.initNewServer = function () {
      node.initialized = false

      coreServer.name = 'NodeREDIIoTServer'

      let serverOptions = {
        port: node.port,
        nodeset_filename: xmlFiles,
        resourcePath: node.endpoint || 'UA/NodeREDIIoTServer',
        buildInfo: {
          productName: node.name || 'NodeOPCUA IIoT Server',
          buildNumber: '160417',
          buildDate: new Date(2017, 4, 16)
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
          isValidUser: node.checkUser
        },
        isAuditing: node.isAuditing,
        disableDiscovery: node.disableDiscovery
      }

      coreServer.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
      node.opcuaServer = new coreServer.core.nodeOPCUA.OPCUAServer(serverOptions)
      node.opcuaServer.initialize(node.postInitialize)

      node.opcuaServer.on('newChannel', function (channel) {
        coreServer.internalDebugLog('Client connected new channel with address = '.bgYellow, channel.remoteAddress, ' port = ', channel.remotePort)
      })

      node.opcuaServer.on('closeChannel', function (channel) {
        coreServer.internalDebugLog('Client disconnected close channel with address = '.bgCyan, channel.remoteAddress, ' port = ', channel.remotePort)
      })
    }

    node.postInitialize = function () {
      if (node.opcuaServer) {
        coreServer.constructAddressSpace(node.opcuaServer, node.asoDemo).then(function (err) {
          if (err) {
            coreServer.internalDebugLog(err)
            if (node.showErrors) {
              node.error(err, {payload: ''})
            }
          } else {
            coreServer.start(node.opcuaServer, node)
            node.setNodeStatusTo('active')
            node.registerDiscovery()
          }
        }).catch(function (err) {
          coreServer.internalDebugLog(err)
          if (node.showErrors) {
            node.error(err, {payload: ''})
          }
        })
      } else {
        node.initialized = false
        coreServer.internalDebugLog('OPC UA Server Is Not Ready'.red)
        if (node.showErrors) {
          node.error(new Error('OPC UA Server Is Not Ready'), {payload: ''})
        }
      }
    }

    // TODO: check if that is correct for multiple servers with different IP's and endpoints
    node.registerDiscovery = function () {
      let hostname = os.hostname()
      let discoveryEndpointUrl

      if (hostname) {
        discoveryEndpointUrl = 'opc.tcp://' + hostname + ':4840/UADiscovery'
        coreServer.internalDebugLog('Registering Server To ' + discoveryEndpointUrl)

        node.opcuaServer.registerServer(discoveryEndpointUrl, function (err) {
          if (err) {
            coreServer.internalDebugLog('Register Server Discovery Error'.red + err)
          } else {
            coreServer.internalDebugLog('Discovery Setup Discovery Done'.green)
          }
        })
      }

      discoveryEndpointUrl = 'opc.tcp://localhost:4840/UADiscovery'
      coreServer.internalDebugLog('Registering Server To ' + discoveryEndpointUrl)

      node.opcuaServer.registerServer(discoveryEndpointUrl, function (err) {
        if (err) {
          coreServer.internalDebugLog('Register Server Discovery Error'.red + err)
        } else {
          coreServer.internalDebugLog('Discovery Setup Discovery Done'.green)
        }
      })
    }

    node.initNewServer()

    node.on('input', function (msg) {
      if (!node.opcuaServer || !node.initialized) {
        node.error(new Error('Server Not Ready For Inputs'), msg)
        return false
      }

      switch (msg.nodetype) {
        case 'ASO':
          node.changeAddressSpace(msg)
          break

        case 'CMD':
          node.executeOpcuaCommand(msg)
          break
        default:
          node.error(new Error('Unknown Node Type ' + msg.nodetype), msg)
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
        addressSpace.addVariable({
          componentOf: rootFolder,
          nodeId: msg.payload.nodeId,
          browseName: msg.payload.browsename,
          displayName: new LocalizedText({locale: null, text: msg.payload.displayname}),
          dataType: msg.payload.datatype,
          value: {
            get: function () {
              return new coreServer.core.nodeOPCUA.Variant({
                dataType: coreServer.core.nodeOPCUA.DataType[msg.payload.datatype],
                value: variableData
              })
            },
            set: function (variant) {
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
        addressSpace.addObject({
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
              coreServer.internalDebugLog('Delete NodeId ' + msg.payload.nodeId)
              addressSpace.deleteNode(searchedNode)
            } else {
              coreServer.internalDebugLog('Delete NodeId Not Found ' + msg.payload.nodeId)
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
      coreServer.internalDebugLog('Restart OPC UA Server')

      if (node.opcuaServer) {
        node.opcuaServer.shutdown(1, function () {
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
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', function (done) {
      node.closeServer(done)
    })

    node.closeServer = function (done) {
      if (node.opcuaServer) {
        if (coreServer.simulatorInterval) {
          clearInterval(coreServer.simulatorInterval)
        }
        coreServer.simulatorInterval = null
        node.opcuaServer.shutdown(function () {
          node.opcuaServer = null
          if (done) {
            done()
          }
        })
      } else {
        node.opcuaServer = null
        if (done) {
          done()
        }
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
