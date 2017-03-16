/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-opcua-iiot
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {browser: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.browser
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser = de.biancoroyal.opcua.iiot.core.browser || {} // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.browser.connect = function (url) {
  return new Promise(
    function (resolve, reject) {
      let core = require('./opcua-iiot-core')
      let opcuaClient = new core.nodeOPCUA.OPCUAClient()
      opcuaClient.connect(url, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(opcuaClient)
        }
      })
    }
  )
}

de.biancoroyal.opcua.iiot.core.browser.createSession = function (opcuaClient) {
  return new Promise(
    function (resolve, reject) {
      opcuaClient.createSession(function (err, session) {
        if (err) {
          reject(err)
        } else {
          resolve(session)
        }
      })
    }
  )
}

de.biancoroyal.opcua.iiot.core.browser.browse = function (session, topic) {
  return new Promise(
    function (resolve, reject) {
      let core = require('./opcua-iiot-core')
      var browseOptions = [
        {
          nodeId: topic,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 0x3f
        },
        {
          nodeId: topic,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 0x3f
        }
      ]

      session.browse(browseOptions, function (err, browseResult, diagnostics) {
        if (err) {
          reject(err)
        } else {
          resolve(browseResult)
        }
      })
    }
  )
}

de.biancoroyal.opcua.iiot.core.browser.closeSession = function (session) {
  return new Promise(
    function (resolve, reject) {
      session.close(function (err) {
        if (err) {
          reject(err)
        }
        resolve()
      })
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.browser
