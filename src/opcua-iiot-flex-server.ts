/*
 The BSD 3-Clause License

 Copyright 2022 - DATATRONiQ GmbH (https://datatroniq.com)
 Copyright (c) 2018-2022 Klaus Landsdorf (http://node-red.plus/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

import * as nodered from "node-red";
import {NodeStatus} from "node-red";
import {Todo} from "./types/placeholders";
import coreServer from "./core/opcua-iiot-core-server";
import {resetIiotNode, setNodeStatusTo} from "./core/opcua-iiot-core";
import {VM} from "vm2";
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

  function OPCUAIIoTFlexServer(this: OPCUAIIoTFlexServer, config: OPCUAIIoTFlexServerDef) {
    RED.nodes.createNode(this, config)
    coreServer.flexInternalDebugLog('Open Server Node')

    let node: Todo = this;

    coreServer.readConfigOfServerNode(node, config)
    coreServer.initServerNode(node)
    coreServer.loadNodeSets(node, __dirname)
    // node = coreServer.loadCertificates(node)
    node.context = this.context

    const vm = new VM({
      allowAsync: false,
      sandbox: {
        // allow the node-opcua library to be accessed in user-submitted scripts as 'opcua'
        opcua: require('node-opcua'),
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
          get global() {
            return node.context().global
          },
          get flow() {
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

    // Use the vm2 library to make the submitted script executable:
    // vm.run returns construcAddressSpaceScript as a function
    const constructAddressSpaceScript = vm.run('constructAddressSpaceScript = ' + config.addressSpaceScript)

    const statusHandler = (status: string | NodeStatus): void => {
      this.status(status)
    }

    const initNewServer = () => {
      node = coreServer.initRegisterServerMethod(node)
      let serverOptions = coreServer.buildGeneralServerOptions(node, 'Flex')
      // serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)
      try {
        coreServer.createServer(node, serverOptions, postInitialize, statusHandler, RED.settings.verbose)
      } catch (err: any) {
        /* istanbul ignore next */
        this.emit('server_create_error')
        coreServer.flexInternalDebugLog(err.message)
        handleServerError(err, {payload: 'Flex Server Failure! Please, check the server settings!'})
      }
    }

    const handleServerError = (err: Error, msg: Todo) => {
      coreServer.internalDebugLog(err)
      if (node.showErrors) {
        this.error(err, msg)
      }
    }

    const postInitialize = () => {
      node.iiot.eventObjects = {} // event objects should stay in memory
      coreServer.constructAddressSpaceFromScript(node.iiot.opcuaServer, constructAddressSpaceScript, node.iiot.eventObjects)
        .then(() => {
          coreServer.start(node.iiot.opcuaServer, node).then(() => {
            node.oldStatusParameter = setNodeStatusTo(node, 'active', node.oldStatusParameter, node.showStatusActivities, statusHandler)
            this.emit('server_running')
          }).catch((err: Error) => {
            /* istanbul ignore next */
            this.emit('server_start_error')
            node.oldStatusParameter = setNodeStatusTo(node, 'errors', node.oldStatusParameter, node.showStatusActivities, statusHandler)
            handleServerError(err, {payload: 'Server Start Failure'})
          })
        }).catch(function (err: Error) {
        /* istanbul ignore next */
        handleServerError(err, {payload: 'Server Address Space Failure'})
      })
    }

    initNewServer()

    this.on('input', function (msg: Todo) {
      if (!node.iiot.opcuaServer || !node.iiot.initialized) {
        handleServerError(new Error('Server Not Ready For Inputs'), msg)
        return
      }

      if (msg.injectType === 'CMD') {
        executeOpcuaCommand(msg)
      } else {
        handleServerError(new Error('Unknown Flex Inject Type ' + msg.injectType), msg)
      }
    })

    const executeOpcuaCommand = (msg: Todo) => {
      if (msg.commandType === 'restart') {
        restartServer()
        this.send(msg)
      } else {
        handleServerError(new Error('Unknown Flex OPC UA Command'), msg)
      }
    }

    const sendHandler = (msg: Todo) => {
      this.send(msg)
    }

    const emitHandler = (eventName: string | symbol, ...args: any[]) => {
      this.emit(eventName, ...args)
    }

    const restartServer = function () {
      coreServer.flexInternalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(node, statusHandler, emitHandler, sendHandler)

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
