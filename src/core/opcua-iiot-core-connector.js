/**
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {connector: {}}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core.connector
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {connector: {}}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.core = de.biancoroyal.opcua.iiot.core.connector.core || require('./opcua-iiot-core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.internalDebugLog = de.biancoroyal.opcua.iiot.core.connector.internalDebugLog || require('debug')('opcuaIIoT:connector') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.connector.connect = function (url, options) {
  let coreConnector = this

  return new Promise(
    function (resolve, reject) {
      let opcuaClient = new coreConnector.core.nodeOPCUA.OPCUAClient(options)
      if (url) {
        opcuaClient.connect(url, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(opcuaClient)
          }
        })

        opcuaClient.on('backoff', function (number, delay) {
          coreConnector.internalDebugLog('backoff  attempt #'.bgWhite.yellow, number, ' retrying in ', delay / 1000.0, ' seconds')
        })

        opcuaClient.on('connection_reestablished', function () {
          coreConnector.internalDebugLog(' !!!!!!!!!!!!!!!!!!!!!!!!  CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        })

        opcuaClient.on('start_reconnection', function () {
          coreConnector.internalDebugLog(' !!!!!!!!!!!!!!!!!!!!!!!!  Starting Reconnection !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        })
      } else {
        reject(new Error('URL Endpoint Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.setupSecureConnectOptions = function (opcuaClient, options) {
  let coreConnector = this

  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        let cryptoUtils = require('node-opcua/lib/misc/crypto_utils')
        let fs = require('fs')
        let path = require('path')
        let hexDump = require('node-opcua/lib/misc/utils').hexDump
        // let treeify = require('treeify')

        opcuaClient.getEndpointsRequest(function (err, endpoints) {
          if (err) {
            reject(err)
          } else {
            // coreConnector.internalDebugLog(treeify.asTree(endpoints, true))

            endpoints.forEach(function (endpoint, i) {
              coreConnector.internalDebugLog('endpoint:' + endpoint.endpointUrl)
              coreConnector.internalDebugLog('Application URI:' + endpoint.server.applicationUri)
              coreConnector.internalDebugLog('Product URI:' + endpoint.server.productUri)
              coreConnector.internalDebugLog('Application Name:' + endpoint.server.applicationName.text)
              coreConnector.internalDebugLog('Security Mode:' + endpoint.securityMode.toString())
              coreConnector.internalDebugLog('securityPolicyUri:' + endpoint.securityPolicyUri)
              coreConnector.internalDebugLog('Type:' + endpoint.server.applicationType.key)
              coreConnector.internalDebugLog('discoveryUrls:' + endpoint.server.discoveryUrls.join(' - '))

              options.serverCertificate = endpoint.serverCertificate
              coreConnector.internalDebugLog('serverCertificate:' + hexDump(endpoint.serverCertificate).yellow)
              options.defaultSecureTokenLifetime = 40000 // 40 sec.

              let certificateFilename = path.join(__dirname,
                '../../node_modules/node-opcua/certificates/PKI/server_certificate' + i + '.pem')
              fs.writeFile(certificateFilename, cryptoUtils.toPem(endpoint.serverCertificate, 'CERTIFICATE'))
            })

            endpoints.forEach(function (endpoint, i) {
              coreConnector.internalDebugLog('Identify Token for : Security Mode=' +
                endpoint.securityMode.toString() + ' Policy=' + endpoint.securityPolicyUri)

              endpoint.userIdentityTokens.forEach(function (token) {
                coreConnector.internalDebugLog('policyId:' + token.policyId)
                coreConnector.internalDebugLog('tokenType:' + token.tokenType.toString())
                coreConnector.internalDebugLog('issuedTokenType:' + token.issuedTokenType)
                coreConnector.internalDebugLog('issuerEndpointUrl:' + token.issuerEndpointUrl)
                coreConnector.internalDebugLog('securityPolicyUri:' + token.securityPolicyUri)
              })

              resolve(opcuaClient)
            })
          }
        })
      } else {
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    })
}

de.biancoroyal.opcua.iiot.core.connector.disconnect = function (opcuaClient) {
  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        opcuaClient.disconnect(function (err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.createSession = function (opcuaClient, userIdentity) {
  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        if (userIdentity && !userIdentity.userName) {
          userIdentity = null
        }
        opcuaClient.createSession(userIdentity, function (err, session) {
          if (err) {
            reject(err)
          } else {
            resolve(session)
          }
        })
      } else {
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.closeSession = function (session) {
  return new Promise(
    function (resolve, reject) {
      if (session && session.sessionId !== 'terminated') {
        session.close(function (err) {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } else {
        reject(new Error('Session Is Not Valid'))
      }
    }
  )
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
