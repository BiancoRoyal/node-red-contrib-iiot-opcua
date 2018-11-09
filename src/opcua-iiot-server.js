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

  function OPCUAIIoTServer (config) {
    RED.nodes.createNode(this, config)
    coreServer.internalDebugLog('Open Server Node')

    this.asoDemo = config.asoDemo // ASO (address space objects) Demo
    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(node)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)
    coreServer.core.assert(node.bianco.iiot)

    node.bianco.iiot.buildServerOptions = function () {
      let serverOptions = coreServer.buildServerOptions(node, 'Fix')
      serverOptions.userManager = {
        isValidUser: function (userName, password) {
          return coreServer.checkUser(node, userName, password)
        }
      }
      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    node.bianco.iiot.createServer = function (serverOptions) {
      if (RED.settings.verbose) {
        coreServer.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
      }
      node.bianco.iiot.opcuaServer = coreServer.createServerObject(node, serverOptions)
      coreServer.core.setNodeStatusTo(node, 'waiting')
      node.bianco.iiot.opcuaServer.initialize(node.bianco.iiot.postInitialize)
      coreServer.setOPCUAServerListener(node)
    }

    node.bianco.iiot.initNewServer = function () {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = node.bianco.iiot.buildServerOptions()
      serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)

      try {
        node.bianco.iiot.createServer(serverOptions)
      } catch (err) {
        node.emit('server_create_error')
        coreServer.handleServerError(node, err, {payload: 'Server Failure! Please, check the server settings!'})
      }
    }

    node.bianco.iiot.postInitialize = function () {
      coreServer.constructAddressSpace(node.bianco.iiot.opcuaServer, node.asoDemo)
        .then(function (err) {
          if (err) {
            coreServer.handleServerError(node, err, {payload: 'Server Address Space Problem'})
          } else {
            coreServer.start(node.bianco.iiot.opcuaServer, node)
              .then(function () {
                coreServer.core.setNodeStatusTo(node, 'active')
                node.emit('server_running')
              }).catch(function (err) {
                if (node.bianco && node.bianco.iiot) {
                  node.bianco.iiot.opcuaServer = null
                }
                node.emit('server_start_error')
                coreServer.core.setNodeStatusTo(node, 'errors')
                coreServer.handleServerError(node, err, {payload: 'Server Start Failure'})
              })
          }
        }).catch(function (err) {
          coreServer.handleServerError(node, err, {payload: 'Server Address Space Failure'})
        })
    }

    node.bianco.iiot.initNewServer()

    node.on('input', function (msg) {
      if (!node.bianco.iiot.opcuaServer || !node.bianco.iiot.initialized) {
        coreServer.handleServerError(node, new Error('Server Not Ready For Inputs'), msg)
        return
      }

      switch (msg.injectType) {
        case 'ASO':
          node.bianco.iiot.changeAddressSpace(msg)
          break
        case 'CMD':
          node.bianco.iiot.executeOpcuaCommand(msg)
          break
        default:
          coreServer.handleServerError(node, new Error('Unknown Inject Type ' + msg.injectType), msg)
      }

      node.send(msg)
    })

    node.bianco.iiot.changeAddressSpace = function (msg) { // TODO: refactor to work with the new OPC UA type list
      if (msg.payload.objecttype && msg.payload.objecttype.indexOf('Variable') > -1) {
        coreServer.addVariableToAddressSpace(node, msg, msg.payload.objecttype)
      } else {
        coreServer.addObjectToAddressSpace(node, msg, msg.payload.objecttype)
      }
    }

    node.bianco.iiot.executeOpcuaCommand = function (msg) {
      switch (msg.commandType) {
        case 'restart':
          node.bianco.iiot.restartServer()
          break
        case 'deleteNode':
          coreServer.deleteNOdeFromAddressSpace(node, msg)
          break
        default:
          coreServer.handleServerError(node, new Error('Unknown OPC UA Command'), msg)
      }
    }

    node.bianco.iiot.restartServer = function () {
      coreServer.internalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node)

      if (node.bianco.iiot.opcuaServer) {
        coreServer.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', (done) => {
      node.bianco.iiot.closeServer(() => {
        coreServer.internalDebugLog('Close Server Node')
        coreServer.core.resetBiancoNode(node)
        done()
      })
    })

    node.bianco.iiot.closeServer = function (done) {
      coreServer.destructAddressSpace(() => {
        node.bianco.iiot.opcuaServer.removeAllListeners()
        node.bianco.iiot.opcuaServer.shutdown(node.delayToClose, done)
      })
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Server', OPCUAIIoTServer)
}
