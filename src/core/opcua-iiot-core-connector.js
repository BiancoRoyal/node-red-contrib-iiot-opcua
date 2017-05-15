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
        let Table = require('easy-table')
        let fs = require('fs')
        let path = require('path')

        opcuaClient.getEndpointsRequest(function (err, endpoints) {
          if (err) {
            reject(err)
          } else {
            let table = new Table()

            endpoints.forEach(function (endpoint, i) {
              table.cell('endpoint', endpoint.endpointUrl + '')
              table.cell('Application URI', endpoint.server.applicationUri)
              table.cell('Product URI', endpoint.server.productUri)
              table.cell('Application Name', endpoint.server.applicationName.text)
              table.cell('Security Mode', endpoint.securityMode.toString())
              table.cell('securityPolicyUri', endpoint.securityPolicyUri)
              table.cell('Type', endpoint.server.applicationType.key)
              table.cell('discoveryUrls', endpoint.server.discoveryUrls.join(' - '))

              options.serverCertificate = endpoint.serverCertificate
              options.defaultSecureTokenLifetime = 40000 // 40 sec.

              let certificateFilename = path.join(__dirname,
                '../../node_modules/node-opcua/certificates/PKI/server_certificate' + i + '.pem')
              fs.writeFile(certificateFilename, cryptoUtils.toPem(endpoint.serverCertificate, 'CERTIFICATE'))
              table.newRow()
            })
            coreConnector.internalDebugLog(table.toString())

            table = new Table()
            endpoints.forEach(function (endpoint, i) {
              coreConnector.internalDebugLog('Identify Token for : Security Mode=' +
                endpoint.securityMode.toString() + ' Policy=' + endpoint.securityPolicyUri)

              endpoint.userIdentityTokens.forEach(function (token) {
                table.cell('policyId', token.policyId)
                table.cell('tokenType', token.tokenType.toString())
                table.cell('issuedTokenType', token.issuedTokenType)
                table.cell('issuerEndpointUrl', token.issuerEndpointUrl)
                table.cell('securityPolicyUri', token.securityPolicyUri)
                table.newRow()
              })
              coreConnector.internalDebugLog(table.toString())

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
