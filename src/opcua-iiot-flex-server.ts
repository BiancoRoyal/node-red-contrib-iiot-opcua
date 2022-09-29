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
import {TodoTypeAny} from "./types/placeholders";
import coreServer from "./core/opcua-iiot-core-server";
import {resetIiotNode, setNodeStatusTo} from "./core/opcua-iiot-core";
import {VM} from "vm2";
import {logger} from "./core/opcua-iiot-core-connector";
import internalDebugLog = logger.internalDebugLog;

type OPCUAIIoTFlexServer = nodered.Node & {
  on(event: 'shutdown', callback: () => void): void
}

interface OPCUAIIoTFlexServerDef extends nodered.NodeDef {
  addressSpaceScript: TodoTypeAny
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

    let self: TodoTypeAny = this;

    coreServer.readConfigOfServerNode(self, config)
    coreServer.initServerNode(self)
    coreServer.loadNodeSets(self, __dirname)
    // node = coreServer.loadCertificates(node)
    self.context = this.context

    const vm = new VM({
      allowAsync: false,
      sandbox: {
        // allow the node-opcua library to be accessed in user-submitted scripts as 'opcua'
        opcua: require('node-opcua'),
        node: self,
        coreServer,
        scriptObjects,
        RED,
        sandboxNodeContext: {
          set: function () {
            self.context().set.apply(self, arguments)
          },
          get: function () {
            return self.context().get.apply(self, arguments)
          },
          keys: function () {
            return self.context().keys.apply(self, arguments)
          },
          get global() {
            return self.context().global
          },
          get flow() {
            return self.context().flow
          }
        },
        sandboxFlowContext: {
          set: function () {
            self.context().flow.set.apply(self, arguments)
          },
          get: function () {
            return self.context().flow.get.apply(self, arguments)
          },
          keys: function () {
            return self.context().flow.keys.apply(self, arguments)
          }
        },
        sandboxGlobalContext: {
          set: function () {
            self.context().global.set.apply(self, arguments)
          },
          get: function () {
            return self.context().global.get.apply(self, arguments)
          },
          keys: function () {
            return self.context().global.keys.apply(self, arguments)
          }
        },
        sandboxEnv: {
          get: function (envVar: TodoTypeAny) {
            let flow = self._flow
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
      self = coreServer.initRegisterServerMethod(self)
      let serverOptions = coreServer.buildGeneralServerOptions(self, 'Flex')
      // serverOptions = coreServer.setDiscoveryOptions(node, serverOptions)
      try {
        coreServer.createServer(self, serverOptions, postInitialize, statusHandler, RED.settings.verbose)
      } catch (err: any) {
        /* istanbul ignore next */
        this.emit('server_create_error')
        coreServer.flexInternalDebugLog(err.message)
        handleServerError(err, {payload: 'Flex Server Failure! Please, check the server settings!'})
      }
    }

    const handleServerError = (err: Error, msg: TodoTypeAny) => {
      coreServer.internalDebugLog(err)
      if (self.showErrors) {
        this.error(err, msg)
      }
    }

    const postInitialize = () => {
      self.iiot.eventObjects = {} // event objects should stay in memory
      coreServer.constructAddressSpaceFromScript(self.iiot.opcuaServer, constructAddressSpaceScript, self.iiot.eventObjects)
        .then(() => {
          coreServer.start(self.iiot.opcuaServer, self).then(() => {
            self.oldStatusParameter = setNodeStatusTo(self, 'active', self.oldStatusParameter, self.showStatusActivities, statusHandler)
            this.emit('server_running')
          }).catch((err: Error) => {
            /* istanbul ignore next */
            this.emit('server_start_error')
            self.oldStatusParameter = setNodeStatusTo(self, 'errors', self.oldStatusParameter, self.showStatusActivities, statusHandler)
            handleServerError(err, {payload: 'Server Start Failure'})
          })
        }).catch(function (err: Error) {
        /* istanbul ignore next */
        handleServerError(err, {payload: 'Server Address Space Failure'})
      })
    }

    initNewServer()

    this.on('input', function (msg: TodoTypeAny) {
      if (!self.iiot.opcuaServer || !self.iiot.initialized) {
        handleServerError(new Error('Server Not Ready For Inputs'), msg)
        return
      }

      if (msg.payload.injectType === 'CMD') {
        executeOpcuaCommand(msg)
      } else {
        handleServerError(new Error('Unknown Flex Inject Type ' + msg.payload.injectType), msg)
      }
    })

    const executeOpcuaCommand = (msg: TodoTypeAny) => {
      if (msg.payload.commandType === 'restart') {
        restartServer()
        this.send(msg)
      } else {
        handleServerError(new Error('Unknown Flex OPC UA Command'), msg)
      }
    }

    const sendHandler = (msg: TodoTypeAny) => {
      this.send(msg)
    }

    const emitHandler = (eventName: string | symbol, ...args: any[]) => {
      this.emit(eventName, ...args)
    }

    const restartServer = function () {
      coreServer.flexInternalDebugLog('Restart OPC UA Server')
      coreServer.restartServer(self, statusHandler, emitHandler, sendHandler)

      if (self.iiot.opcuaServer) {
        coreServer.flexInternalDebugLog('OPC UA Server restarted')
      } else {
        coreServer.flexInternalDebugLog('Can not restart OPC UA Server')
      }
    }

    this.on('close', function (done: () => void) {
      self.removeAllListeners()

      closeServer(() => {
        coreServer.flexInternalDebugLog('Close Server Node')
        resetIiotNode(self)
        done()
      })
    })

    this.on('shutdown', () => {
      self.iiot.opcuaServer = null
      initNewServer()
    })

    const closeServer = function (done: () => void) {
      if (coreServer.simulatorInterval) {
        clearInterval(coreServer.simulatorInterval)
        coreServer.simulatorInterval = null
      }

      if (self.iiot.opcuaServer) {
        self.iiot.opcuaServer.removeAllListeners()
        self.iiot.opcuaServer.shutdown(self.delayToClose, done)
      } else {
        done()
      }
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Flex-Server', OPCUAIIoTFlexServer)
}
