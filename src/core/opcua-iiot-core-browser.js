/**
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
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
var de = de || {biancoroyal: {opcua: {iiot: {core: {browser: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.core = de.biancoroyal.opcua.iiot.core.browser.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define

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

module.exports = de.biancoroyal.opcua.iiot.core.browser
