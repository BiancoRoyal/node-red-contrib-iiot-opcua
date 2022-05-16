/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {Todo} from "./types/placeholders";

interface OPCUAIIoTFlexServer extends nodered.Node {

}
interface OPCUAIIoTFlexServerDef extends nodered.NodeDef {
  addressSpaceScript: Todo
}
/**
 * Server Node-RED node.
 *
 * @param RED
 */
module.exports = (RED: nodered.NodeAPI) => {
  // SOURCE-MAP-REQUIRED
  let coreServer = require('./core/opcua-iiot-core-server')
  const { VM } = require('vm2')
  let scriptObjects = {}

  function OPCUAIIoTFlexServer (this: OPCUAIIoTFlexServer, config: OPCUAIIoTFlexServerDef) {
    RED.nodes.createNode(this, config)
    coreServer.flex.internalDebugLog('Open Server Node')

    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(node)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)
    coreServer.core.assert(node.bianco.iiot)

    node.bianco.iiot.vm = new VM({
      require: {
        builtin: ['fs', 'Math', 'Date', 'console']
      },
      sandbox: {
        node,
        coreServer,
        scriptObjects,
        RED,
        sandboxNodeContext: {
          set: function () {
            node.context().set.apply(node, arguments)
          },
          get: function () {
            return node.context().get.apply(node, arguments)
          },
          keys: function () {
            return node.context().keys.apply(node, arguments)
          },
          get global () {
            return node.context().global
          },
          get flow () {
            return node.context().flow
          }
        },
        sandboxFlowContext: {
          set: function () {
            node.context().flow.set.apply(node, arguments)
          },
          get: function () {
            return node.context().flow.get.apply(node, arguments)
          },
          keys: function () {
            return node.context().flow.keys.apply(node, arguments)
          }
        },
        sandboxGlobalContext: {
          set: function () {
            node.context().global.set.apply(node, arguments)
          },
          get: function () {
            return node.context().global.get.apply(node, arguments)
          },
          keys: function () {
            return node.context().global.keys.apply(node, arguments)
          }
        },
        sandboxEnv: {
          get: function (envVar: Todo) {
            let flow = node._flow
            return flow.getSetting(envVar)
          }
        }
      }
    })

    /* istanbul ignore next */
    // @ts-ignore
    node.bianco.iiot.constructAddressSpaceScript = function (server: Todo, constructAddressSpaceScript, eventObjects) {
      server.internalDebugLog('Init Function Block Flex Server')
    }

    node.bianco.iiot.vm.run('node.bianco.iiot.constructAddressSpaceScript = ' + config.addressSpaceScript)

    node.bianco.iiot.buildServerOptions = function () {
      let serverOptions = coreServer.buildServerOptions(node, 'Flex')
      serverOptions.userManager = {
        isValidUser: function (userName: string, password: string) {
          return coreServer.checkUser(node, userName, password)
        }
      }
      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    node.bianco.iiot.createServer = function (serverOptions: Todo) {
      /* istanbul ignore next */
      if (RED.settings.verbose) {
        coreServer.flex.detailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
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
      } catch (err: any) {
        /* istanbul ignore next */
        node.emit('server_create_error')
        coreServer.flex.internalDebugLog(err.message)
        coreServer.handleServerError(node, err, { payload: 'Flex Server Failure! Please, check the server settings!' })
      }
    }

    node.bianco.iiot.postInitialize = function () {
      node.bianco.iiot.eventObjects = {} // event objects should stay in memory
      coreServer.constructAddressSpaceFromScript(node.bianco.iiot.opcuaServer, node.bianco.iiot.constructAddressSpaceScript, node.bianco.iiot.eventObjects)
        .then(function () {
          coreServer.start(node.bianco.iiot.opcuaServer, node).then(function () {
            coreServer.core.setNodeStatusTo(node, 'active')
            node.emit('server_running')
          }).catch(function (err: Error) {
            /* istanbul ignore next */
            node.emit('server_start_error')
            coreServer.core.setNodeStatusTo(node, 'errors')
            coreServer.handleServerError(node, err, { payload: 'Server Start Failure' })
          })
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          coreServer.handleServerError(node, err, { payload: 'Server Address Space Failure' })
        })
    }

    node.bianco.iiot.initNewServer()

    node.on('input', function (msg: Todo) {
      if (!node.bianco.iiot.opcuaServer || !node.bianco.iiot.initialized) {
        coreServer.handleServerError(node, new Error('Server Not Ready For Inputs'), msg)
        return
      }

      if (msg.injectType === 'CMD') {
        node.bianco.iiot.executeOpcuaCommand(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex Inject Type ' + msg.injectType), msg)
      }
    })

    node.bianco.iiot.executeOpcuaCommand = function (msg: Todo) {
      if (msg.commandType === 'restart') {
        node.bianco.iiot.restartServer()
        node.send(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex OPC UA Command'), msg)
      }
    }

    node.bianco.iiot.restartServer = function () {
      coreServer.flex.internalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node)

      if (node.bianco.iiot.opcuaServer) {
        coreServer.flex.internalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.flex.internalDebugLog('Can not restart OPC UA Server')
      }
    }

    node.on('close', function (done: () => void) {
      node.bianco.iiot.closeServer(() => {
        coreServer.flex.internalDebugLog('Close Server Node')
        coreServer.core.resetBiancoNode(node)
        done()
      })
    })

    node.on('shutdown', () => {
      node.bianco.iiot.opcuaServer = null
      node.bianco.iiot.initNewServer()
    })

    node.bianco.iiot.closeServer = function (done: () => void) {
      if (coreServer.simulatorInterval) {
        clearInterval(coreServer.simulatorInterval)
        coreServer.simulatorInterval = null
      }

      if (node.bianco.iiot.opcuaServer) {
        node.bianco.iiot.opcuaServer.removeAllListeners()
        node.bianco.iiot.opcuaServer.shutdown(node.delayToClose, done)
      } else {
        done()
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Server', OPCUAIIoTFlexServer)
}
