/**
 The BSD 3-Clause License

 Copyright 2016, 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-opcua-iiot
 **/
'use strict'

module.exports = function (RED) {
  let cron = require('cron')

  function OPCUAIIoTInject (config) {
    RED.nodes.createNode(this, config)

    this.topic = config.topic
    this.datatype = config.datatype
    this.payload = config.payload
    this.payloadType = config.payloadType
    this.repeat = config.repeat
    this.crontab = config.crontab
    this.once = config.once
    this.name = config.name

    let node = this
    node.interval_id = null
    node.cronjob = null

    if (node.repeat && !isNaN(node.repeat) && node.repeat > 0) {
      node.repeat = node.repeat * 1000
      if (RED.settings.verbose) { node.log(RED._('opcuaiiotinject.repeat', this)) }
      node.interval_id = setInterval(function () {
        node.emit('input', {})
      }, node.repeat)
    } else if (node.crontab) {
      if (RED.settings.verbose) { node.log(RED._('opcuaiiotinject.crontab', this)) }
      node.cronjob = new cron.CronJob(node.crontab,
        function () {
          node.emit('input', {})
        },
        null, true)
    }

    if (node.once) {
      setTimeout(function () { node.emit('input', {}) }, 100)
    }

    node.on('input', function (msg) {
      try {
        msg.topic = node.topic
        msg.datatype = node.datatype
        msg.nodetype = 'inject'

        if ((node.payloadType === null && node.payload === '') || node.payloadType === 'date') {
          msg.payload = Date.now()
        } else if (node.payloadType === null) {
          msg.payload = node.payload
        } else if (node.payloadType === 'none') {
          msg.payload = ''
        } else {
          msg.payload = RED.util.evaluateNodeProperty(node.payload, node.payloadType, this, msg)
        }
        node.send(msg)
        msg = null
      } catch (err) {
        node.error(err, msg)
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Inject', OPCUAIIoTInject)

  OPCUAIIoTInject.prototype.close = function () {
    if (this.interval_id !== null) {
      clearInterval(this.interval_id)
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.stopped')) }
    } else if (this.cronjob !== null) {
      this.cronjob.stop()
      if (RED.settings.verbose) { this.log(RED._('opcuaiiotinject.stopped')) }
      delete this.cronjob
    }
  }

  RED.httpAdmin.post('/opcuaiiotinject/:id', RED.auth.needsPermission('opcuaiiotinject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)
    if (node !== null) {
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
