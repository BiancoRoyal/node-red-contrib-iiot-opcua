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
import coreServer from "./core/opcua-iiot-core-server";
import {resetIiotNode, setNodeStatusTo} from "./core/opcua-iiot-core";
import {NodeStatus} from "node-red";
import {VM} from "vm2";
import {OPCUAServer} from "node-opcua";
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;

type OPCUAIIoTFlexServer = nodered.Node & {
  on(event: 'shutdown', callback: () => void): void
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
  let scriptObjects = {}

  function OPCUAIIoTFlexServer (this: OPCUAIIoTFlexServer, config: OPCUAIIoTFlexServerDef) {
    RED.nodes.createNode(this, config)
    coreServer.flexInternalDebugLog('Open Server Node')

    let node = coreServer.readConfigOfServerNode(this, config)
    node = coreServer.initServerNode(node)
    node = coreServer.loadNodeSets(node, __dirname)
    node = coreServer.loadCertificates(node)

    const vm = new VM({
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
    const constructAddressSpaceScript = function (server: Todo, constructAddressSpaceScript, eventObjects) {
      internalDebugLog('Init Function Block Flex Server')
    }

    vm.run('node.iiot.constructAddressSpaceScript = ' + config.addressSpaceScript)

    const statusHandler = (status: string | NodeStatus): void => {
      this.status(status)
    }

    const buildServerOptions = async function () {
      let serverOptions: Todo = await coreServer.buildServerOptions(node, 'Flex')
      serverOptions.userManager = {
        isValidUser: function (userName: string, password: string) {
          return coreServer.checkUser(node, userName, password)
        }
      }
      return coreServer.setDiscoveryOptions(node, serverOptions)
    }

    const createServer = async (serverOptions: Todo) => {
      /* istanbul ignore next */
      if (RED.settings.verbose) {
        coreServer.flexDetailDebugLog('serverOptions:' + JSON.stringify(serverOptions))
      }
      node.iiot.opcuaServer = coreServer.createServerObject(node, serverOptions)
      node.oldStatusParameter = setNodeStatusTo(node, 'waiting', node.oldStatusParameter, node.showStatusActivities, statusHandler)
      await node.iiot.opcuaServer.initialize()
      postInitialize()
      coreServer.setOPCUAServerListener(node)
    }

    const initNewServer = () => {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = buildServerOptions()
      serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)
      try {
        createServer(serverOptions)
      } catch (err: any) {
        /* istanbul ignore next */
        this.emit('server_create_error')
        coreServer.flexInternalDebugLog(err.message)
        coreServer.handleServerError(node, err, { payload: 'Flex Server Failure! Please, check the server settings!' })
      }
    }

    const postInitialize = () => {
      node.iiot.eventObjects = {} // event objects should stay in memory
      coreServer.constructAddressSpaceFromScript(node.iiot.opcuaServer, constructAddressSpaceScript, node.iiot.eventObjects)
        .then(() => {
          coreServer.start(node.iiot.opcuaServer, node).then(() => {
            node.oldStatusParameter = setNodeStatusTo(node, 'active', node.oldStatusParameter, node.showStatusActivities, statusHandler)
            this.emit('server_running')
          }).catch((err: Error) =>{
            /* istanbul ignore next */
            this.emit('server_start_error')
            node.oldStatusParameter = setNodeStatusTo(node, 'errors', node.oldStatusParameter, node.showStatusActivities, statusHandler)
            coreServer.handleServerError(node, err, { payload: 'Server Start Failure' })
          })
        }).catch(function (err: Error) {
          /* istanbul ignore next */
          coreServer.handleServerError(node, err, { payload: 'Server Address Space Failure' })
        })
    }

    initNewServer()

    this.on('input', function (msg: Todo) {
      if (!node.iiot.opcuaServer || !node.iiot.initialized) {
        coreServer.handleServerError(node, new Error('Server Not Ready For Inputs'), msg)
        return
      }

      if (msg.injectType === 'CMD') {
        executeOpcuaCommand(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex Inject Type ' + msg.injectType), msg)
      }
    })

    const executeOpcuaCommand = (msg: Todo) => {
      if (msg.commandType === 'restart') {
        restartServer()
        this.send(msg)
      } else {
        coreServer.handleServerError(node, new Error('Unknown Flex OPC UA Command'), msg)
      }
    }

    const restartServer = function () {
      coreServer.flexInternalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node, statusHandler)

      if (node.iiot.opcuaServer) {
        coreServer.flexInternalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.flexInternalDebugLog('Can not restart OPC UA Server')
      }
    }

    this.on('close', function (done: () => void) {
      closeServer(() => {
        coreServer.flexInternalDebugLog('Close Server Node')
        resetIiotNode(node)
        done()
      })
    })

    this.on('shutdown', () => {
      node.iiot.opcuaServer = null
      node.iiot.initNewServer()
    })

    const closeServer = function (done: () => void) {
      if (coreServer.simulatorInterval) {
        clearInterval(coreServer.simulatorInterval)
        coreServer.simulatorInterval = null
      }

      if (node.iiot.opcuaServer) {
        node.iiot.opcuaServer.removeAllListeners()
        node.iiot.opcuaServer.shutdown(node.delayToClose, done)
      } else {
        done()
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Server', OPCUAIIoTFlexServer)
}
