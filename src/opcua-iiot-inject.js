/**
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-iiot-opcua
 **/
'use strict'

/**
 * Inject Node-RED node for OPC UA IIoT nodes.
 *
 * @param RED
 */

module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreInject = require('./core/opcua-iiot-core-inject')
  let cron = require('cron')

  function OPCUAIIoTInject (config) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.repeat = config.repeat
    this.crontab = config.crontab
    this.once = config.once
    this.startDelay = parseFloat(config.startDelay) || 10
    this.name = config.name
    this.injectType = config.injectType || 'inject'

    this.addressSpaceItems = config.addressSpaceItems || []

    let node = this
    node.bianco = coreInject.core.createBiancoIIoT()
    coreInject.core.assert(node.bianco.iiot)

    node.bianco.iiot.intervalId = null
    node.bianco.iiot.onceTimeout = null
    node.bianco.iiot.cronjob = null
    node.bianco.iiot.REPEAT_FACTOR = 1000.0
    node.bianco.iiot.ONE_SECOND = 1000
    node.bianco.iiot.INPUT_TIMEOUT_MILLISECONDS = 1000

    node.bianco.iiot.repeaterSetup = function () {
      coreInject.internalDebugLog('Repeat Is ' + node.repeat)
      coreInject.internalDebugLog('Crontab Is ' + node.crontab)

      if (node.repeat !== '') {
        node.repeat = parseFloat(config.repeat) * node.bianco.iiot.REPEAT_FACTOR

        if (node.repeat === 0) {
          node.repeat = node.bianco.iiot.ONE_SECOND
        }

        coreInject.internalDebugLog('Repeat Interval Start With ' + node.repeat + ' msec.')

        if (node.bianco.iiot.intervalId) {
          clearInterval(node.bianco.iiot.intervalId)
        }

        node.bianco.iiot.intervalId = setInterval(function () {
          node.emit('input', {})
        }, node.repeat)
      } else if (node.crontab !== '') {
        node.bianco.iiot.cronjob = new cron.CronJob(node.crontab,
          function () {
            node.emit('input', {})
          },
          null,
          true)
      }
    }

    node.bianco.iiot.resetAllTimer = function () {
      if (node.bianco.iiot.onceTimeout) {
        clearTimeout(node.bianco.iiot.onceTimeout)
        node.bianco.iiot.onceTimeout = null
      }

      if (node.bianco.iiot.intervalId) {
        clearInterval(node.bianco.iiot.intervalId)
        node.bianco.iiot.intervalId = null
      }
    }

    node.on('input', function (msg) {
      try {
        msg.topic = node.topic
        msg.nodetype = 'inject'
        msg.injectType = node.injectType
        msg.addressSpaceItems = []
        Object.assign(msg.addressSpaceItems, node.addressSpaceItems)

        switch (node.payloadType) {
          case 'none':
            msg.payload = ''
            break
          case 'str':
            msg.payload = node.payload.toString()
            break
          case 'num':
            msg.payload = Number(node.payload)
            break
          case 'bool':
            msg.payload = (node.payload === true || node.payload === 'true')
            break
          case 'json':
            msg.payload = JSON.parse(node.payload)
            break
          case 'date':
            msg.payload = Date.now()
            break
          default:
            if (node.payloadType === null) {
              if (node.payload === '') {
                msg.payload = Date.now()
              } else {
                msg.payload = node.payload
              }
            } else {
              msg.payload = RED.util.evaluateNodeProperty(node.payload, node.payloadType, this, msg)
            }
        }

        node.send(msg)
      } catch (err) {
        if (RED.settings.verbose) {
          node.error(err, msg)
        }
      }
    })

    if (node.once) {
      if (node.bianco.iiot.onceTimeout) {
        clearTimeout(node.bianco.iiot.onceTimeout)
        node.bianco.iiot.onceTimeout = null
      }

      let timeout = parseInt(node.bianco.iiot.INPUT_TIMEOUT_MILLISECONDS * node.startDelay)
      coreInject.internalDebugLog('injecting once at start delay timeout ' + timeout + ' msec.')
      node.bianco.iiot.onceTimeout = setTimeout(function () {
        coreInject.internalDebugLog('injecting once at start')
        node.emit('input', {})
        node.bianco.iiot.repeaterSetup()
      }, timeout)
    } else {
      node.bianco.iiot.repeaterSetup()
    }
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  OPCUAIIoTInject.prototype.close = function () {
    let node = this

    if (node.bianco.iiot.cronjob) {
      node.bianco.iiot.cronjob.stop()
      delete node['cronjob']
    }

    coreInject.core.resetBiancoNode(node)
  }

  RED.httpAdmin.post('/opcuaIIoT/inject/:id', RED.auth.needsPermission('opcuaIIoT.inject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)

    if (node) {
      try {
        node.receive()
        res.sendStatus(200)
      } catch (err) {
        res.sendStatus(500)
        node.error(RED._('opcuaiiotinject.failed', {error: err.toString()}))
      }
    } else {
      res.sendStatus(404)
    }
  })
}
