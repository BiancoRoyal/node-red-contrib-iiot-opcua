/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-iiot-opcua
 **/
'use strict'
import * as nodered from "node-red";
import {recursivePrintTypes, Todo, TodoBianco} from "./types/placeholders";
import coreInject from "./core/opcua-iiot-core-inject";
import {resetBiancoNode} from "./core/opcua-iiot-core";
import {CronJob} from 'cron';
import {NodeMessageInFlow} from "node-red";

interface OPCUAIIoTInject extends nodered.Node {
  name: string
  topic: Todo // TODO: string?
  payload: Todo // TODO: config.payload
  payloadType: Todo // TODO: config.payloadType
  repeat: number
  crontab: string // TODO: config.crontab
  once: Todo // TODO: config.once
  startDelay: number // TODO: parseFloat(config.startDelay) || 10
  injectType: Todo // TODO: config.injectType || 'inject'
  addressSpaceItems: Todo // TODO: config.addressSpaceItems || []
  bianco?: TodoBianco
}

interface OPCUAIIoTInjectConfigurationDef extends nodered.NodeDef {
  name: string
  topic: string // TODO: string?
  payload: string // TODO: config.payload
  payloadType: string // TODO: config.payloadType
  repeat: string
  crontab: string // TODO: config.crontab
  once: boolean // TODO: config.once
  startDelay: string
  injectType: Todo // TODO: config.injectType || 'inject'
  addressSpaceItems: Todo // TODO: config.addressSpaceItems || []
}

export interface InjectMessage extends NodeMessageInFlow {
  payload: InjectPayload
}

export interface InjectPayload {
  value: any
  payloadType: string
  nodetype: 'inject'
  injectType: string
  addressSpaceItems: Todo[]
  manualInject: boolean
}

/**
 * Inject Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */

module.exports = function (RED: nodered.NodeAPI) {
  // SOURCE-MAP-REQUIRED

  function OPCUAIIoTInject (this: OPCUAIIoTInject, config: OPCUAIIoTInjectConfigurationDef) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.crontab = config.crontab
    this.once = config.once
    this.startDelay = parseFloat(config.startDelay) || 10
    this.name = config.name
    this.injectType = config.injectType || 'inject'

    this.addressSpaceItems = config.addressSpaceItems || []

    let node: Todo = this

    let intervalId: NodeJS.Timer | null = null
    let onceTimeout: NodeJS.Timeout | null = null
    let cronjob: CronJob | null = null
    const REPEAT_FACTOR = 1000.0
    const ONE_SECOND = 1000
    const INPUT_TIMEOUT_MILLISECONDS = 1000

    const repeaterSetup = function () {
      coreInject.internalDebugLog('Repeat Is ' + node.repeat)
      coreInject.internalDebugLog('Crontab Is ' + node.crontab)

      if (node.repeat !== '') {
        node.repeat = parseFloat(config.repeat) * REPEAT_FACTOR

        if (node.repeat === 0) {
          node.repeat = ONE_SECOND
        }

        coreInject.internalDebugLog('Repeat Interval Start With ' + node.repeat + ' msec.')

        if (intervalId) {
          clearInterval(intervalId)
        }

        intervalId = setInterval(function () {
          node.emit('input', {})
        }, node.repeat)
      } else if (node.crontab !== '') {
        cronjob = new CronJob(node.crontab,
          function () {
            node.emit('input', {})
          },
          null,
          true)
      }
    }

    const resetAllTimer = function () {
      if (onceTimeout) {
        clearTimeout(onceTimeout)
        onceTimeout = null
      }

      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const generateOutputValue = (payloadType: Todo, inputMessage: NodeMessageInFlow) => {
      switch (payloadType) {
        case 'none':
          return ''
        case 'str':
          return node.payload.toString()
        case 'num':
          return Number(node.payload)
        case 'bool':
          return (node.payload === true || node.payload === 'true')
        case 'json':
          return JSON.parse(node.payload)
        case 'date':
          return Date.now()
        default:
          if (node.payloadType === null) {
            if (node.payload === '') {
              return Date.now()
            } else {
              return node.payload
            }
          } else {
            return RED.util.evaluateNodeProperty(node.payload, node.payloadType, this, inputMessage)
          }
      }
    }

    this.on('input', (msg: NodeMessageInFlow) => {
      if (Object.keys(msg).length === 0) return;
      try {
        const topic = node.topic
        const payload: InjectPayload = {
          payloadType: node.payloadType,
          value: generateOutputValue(node.payloadType, msg),
          nodetype: 'inject',
          injectType: node.injectType,
          addressSpaceItems: [...node.addressSpaceItems],
          manualInject: Object.keys(msg).length !== 0
        }
        const outputMessage: NodeMessageInFlow = {
          ...msg,
          topic,
          payload,
        }
        node.send(outputMessage)
      } catch (err) {
        /* istanbul ignore next */
        if (RED.settings.verbose) {
          node.error(err, msg)
        }
      }
    })

    if (onceTimeout) {
      clearTimeout(onceTimeout)
      onceTimeout = null
    }
    let timeout = INPUT_TIMEOUT_MILLISECONDS * node.startDelay

    if (node.once) {
      coreInject.detailDebugLog('injecting once at start delay timeout ' + timeout + ' msec.')
      onceTimeout = setTimeout(function () {
        coreInject.detailDebugLog('injecting once at start')
        node.emit('input', {})
        repeaterSetup()
      }, timeout)
    } else if (node.repeat || node.crontab) {
      coreInject.detailDebugLog('start with delay timeout ' + timeout + ' msec.')
      onceTimeout = setTimeout(function () {
        coreInject.detailDebugLog('had a start delay of ' + timeout + ' msec. to setup inject interval')
        repeaterSetup()
      }, timeout)
    } else {
      repeaterSetup()
    }

    node.close = function () {
      let node = this

      if (cronjob) {
        cronjob.stop()
        delete node['cronjob']
      }
      resetBiancoNode(node)
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  RED.httpAdmin.post('/opcuaIIoT/inject/:id', RED.auth.needsPermission('opcuaIIoT.inject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)

    if (node) {
      try {
        node.receive()
        res.sendStatus(200)
      } catch (err: any) {
        /* istanbul ignore next */
        res.sendStatus(500)
        node.error(RED._('opcuaiiotinject.failed', { error: err.toString() }))
      }
    } else {
      /* istanbul ignore next */
      res.sendStatus(404)
    }
  })
}
