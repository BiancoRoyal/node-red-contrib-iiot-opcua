/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {browser: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.browser
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {browser: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.core = de.biancoroyal.opcua.iiot.core.browser.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.internalDebugLog = de.biancoroyal.opcua.iiot.core.browser.internalDebugLog || require('debug')('opcuaIIoT:browser') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.browser.detailDebugLog = de.biancoroyal.opcua.iiot.core.browser.detailDebugLog || require('debug')('opcuaIIoT:browser:details') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.browser.browse = function (session, topic) {
  let coreBrowser = this
  return new Promise(
    function (resolve, reject) {
      if (!session) {
        reject(new Error('Session Not Ready To Browse'))
      }

      let browseOptions = [
        {
          nodeId: topic,
          referenceTypeId: 'Organizes',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 0x3f
        },
        {
          nodeId: topic,
          referenceTypeId: 'Aggregates',
          includeSubtypes: true,
          browseDirection: coreBrowser.core.nodeOPCUA.browse_service.BrowseDirection.Forward,
          resultMask: 0x3f
        }
      ]

      session.browse(browseOptions, function (err, browseResult) {
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
