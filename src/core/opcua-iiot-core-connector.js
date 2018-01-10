/**
 The BSD 3-Clause License

 Copyright 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
// SOURCE-MAP-REQUIRED

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
de.biancoroyal.opcua.iiot.core.connector.detailDebugLog = de.biancoroyal.opcua.iiot.core.connector.detailDebugLog || require('debug')('opcuaIIoT:connector:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.connector.libDebugLog = de.biancoroyal.opcua.iiot.core.connector.libDebugLog || require('debug')('opcuaIIoT:connector:nodeopcua') // eslint-disable-line no-use-before-define

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

        opcuaClient.on('close', function (err) {
          if (err) {
            coreConnector.internalDebugLog(err.message)
          }
          coreConnector.internalDebugLog('!!!!!!!!!!!!!!!!!!!!!!!!  CONNECTION CLOSED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        })

        opcuaClient.on('backoff', function (number, delay) {
          coreConnector.internalDebugLog('backoff  attempt #'.bgWhite.yellow, number, ' retrying in ', delay / 1000.0, ' seconds')
        })

        opcuaClient.on('connection_reestablished', function () {
          coreConnector.internalDebugLog(' !!!!!!!!!!!!!!!!!!!!!!!!  CONNECTION RE-ESTABLISHED !!!!!!!!!!!!!!!!!!!'.bgWhite.red)
        })

        opcuaClient.on('start_reconnection', function () {
          coreConnector.internalDebugLog(' !!!!!!!!!!!!!!!!!!!!!!!!  Starting Reconnection !!!!!!!!!!!!!!!!!!!'.bgWhite.yellow)
        })

        opcuaClient.on('after_reconnection', function () {
          coreConnector.internalDebugLog(' !!!!!!!!!!!!!!!!!!!!!!!!        Reconnected     !!!!!!!!!!!!!!!!!!!'.bgWhite.green)
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
        let cryptoUtils = require('node-opcua').crypto_utils
        let fs = require('fs')
        let path = require('path')
        let hexDump = require('node-opcua').hexDump
        // let treeify = require('treeify')

        opcuaClient.getEndpointsRequest(function (err, endpoints) {
          if (err) {
            reject(err)
          } else {
            // coreConnector.internalDebugLog(treeify.asTree(endpoints, true))

            coreConnector.internalDebugLog('endpoint: ' + endpoints[0].endpointUrl)
            coreConnector.internalDebugLog('Application URI: ' + endpoints[0].server.applicationUri)
            coreConnector.detailDebugLog('Security Mode: ' + endpoints[0].securityMode.toString())
            coreConnector.detailDebugLog('securityPolicyUri: ' + endpoints[0].securityPolicyUri)

            endpoints.forEach(function (endpoint, i) {
              coreConnector.detailDebugLog('endpoint: ' + endpoint.endpointUrl)
              coreConnector.detailDebugLog('Application URI: ' + endpoint.server.applicationUri)
              coreConnector.detailDebugLog('Product URI: ' + endpoint.server.productUri)
              coreConnector.detailDebugLog('Application Name: ' + endpoint.server.applicationName.text)
              coreConnector.detailDebugLog('Security Mode: ' + endpoint.securityMode.toString())
              coreConnector.detailDebugLog('securityPolicyUri: ' + endpoint.securityPolicyUri)
              coreConnector.detailDebugLog('Type: ' + endpoint.server.applicationType.key)
              coreConnector.detailDebugLog('discoveryUrls: ' + endpoint.server.discoveryUrls.join(' - '))

              if (endpoint.serverCertificate) {
                options.serverCertificate = endpoint.serverCertificate
                coreConnector.detailDebugLog('serverCertificate: ' + hexDump(endpoint.serverCertificate).yellow)
                options.defaultSecureTokenLifetime = 60000 // 1 min.

                let certificateFilename = path.join(coreConnector.core.getNodeOPCUAClientPath(), '/certificates/PKI/server_certificate' + i + '.pem')
                coreConnector.detailDebugLog(certificateFilename)
                fs.writeFile(certificateFilename, cryptoUtils.toPem(endpoint.serverCertificate, 'CERTIFICATE'), (err) => {
                  if (err) throw err
                  coreConnector.detailDebugLog('The certificate file ' + certificateFilename + ' has been saved!')
                })
              } else {
                coreConnector.detailDebugLog('serverCertificate: None'.red)
              }
            })

            endpoints.forEach(function (endpoint, i) {
              coreConnector.detailDebugLog('Identify Token for : Security Mode=' +
                endpoint.securityMode.toString() + ' Policy=' + endpoint.securityPolicyUri)

              endpoint.userIdentityTokens.forEach(function (token) {
                coreConnector.detailDebugLog('policyId: ' + token.policyId)
                coreConnector.detailDebugLog('tokenType: ' + token.tokenType.toString())
                coreConnector.detailDebugLog('issuedTokenType: ' + token.issuedTokenType)
                coreConnector.detailDebugLog('issuerEndpointUrl: ' + token.issuerEndpointUrl)
                coreConnector.detailDebugLog('securityPolicyUri: ' + token.securityPolicyUri)
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
