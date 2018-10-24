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

    node.buildServerOptions = function () {
      let serverOptions = coreServer.buildServerOptions(node, 'Flex')
      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    node.createServer = function (serverOptions) {
      if (RED.settings.verbose) {
        coreServer.flex.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
      }
      node.opcuaServer = coreServer.createServerObject(node, serverOptions)
      coreServer.core.setNodeStatusTo(node, 'waiting')
      node.opcuaServer.initialize(node.postInitialize)
      coreServer.setOPCUAServerListener(node)
    }

    node.initNewServer = function () {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = node.buildServerOptions()
      serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)

      try {
        node.createServer(serverOptions)
      } catch (err) {
        node.emit('server_create_error')
        coreServer.flex.internalDebugLog(err.message)
        coreServer.handleServerError(node, err, {payload: 'Flex Server Failure! Please, check the server settings!'})
      }
    }

    node.postInitialize = function () {
      node.eventObjects = {} // event objects should stay in memory
      coreServer.constructAddressSpaceFromScript(node.opcuaServer, node.constructAddressSpaceScript, node.eventObjects)
        .then(function () {
          coreServer.start(node.opcuaServer, node).then(function () {
            coreServer.core.setNodeStatusTo(node, 'active')
            node.emit('server_running')
          }).catch(function (err) {
            node.emit('server_start_error')
            coreServer.core.setNodeStatusTo(node, 'errors')
            coreServer.handleServerError(node, err, {payload: 'Server Start Failure'})
          })
        }).catch(function (err) {
          coreServer.handleServerError(node, err, {payload: 'Server Address Space Failure'})
        })
    }

    node.initNewServer()

    node.on('input', function (msg) {
      if (!node.opcuaServer || !node.initialized) {
        coreServer.handleServerError(node, new Error('Server Not Ready For Inputs'), msg)
        return
      }

      if (msg.injectType === 'CMD') {
        node.executeOpcuaCommand(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex Inject Type ' + msg.injectType), msg)
      }
    })

    node.executeOpcuaCommand = function (msg) {
      if (msg.commandType === 'restart') {
        node.restartServer()
        node.send(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex OPC UA Command'), msg)
      }
    }

    node.restartServer = function () {
      coreServer.flex.internalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node)

      if (node.opcuaServer) {
        coreServer.flex.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.flex.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', function (done) {
      node.closeServer(() => {
        coreServer.flex.internalDebugLog('Close Server Node')
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
