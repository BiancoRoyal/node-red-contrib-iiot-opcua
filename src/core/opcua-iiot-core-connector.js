/**
 The BSD 3-Clause License

 Copyright 2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
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
de.biancoroyal.opcua.iiot.core.connector.Stately = de.biancoroyal.opcua.iiot.core.connector.Stately || require('stately.js') // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.connector.createStatelyMachine = function () {
  return de.biancoroyal.opcua.iiot.core.connector.Stately.machine({
    'INIT': {
      'open': 'OPEN',
      'close': 'CLOSED'
    },
    'OPEN': {
      'close': 'CLOSED'
    },
    'CLOSED': {
      'open': 'OPEN',
      'lock': 'LOCKED'
    },
    'LOCKED': {
      'unlock': 'UNLOCKED'
    },
    'UNLOCKED': {
      'init': 'INIT'
    }
  })
}

de.biancoroyal.opcua.iiot.core.connector.createSession = function (opcuaClient, userIdentity) {
  let coreConnector = this

  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        if (userIdentity && !userIdentity.userName) {
          coreConnector.internalDebugLog('Create New Session Without User Identity None User')
          userIdentity = {}
        } else if (!userIdentity) {
          coreConnector.internalDebugLog('Create New Session Without User Identity')
          userIdentity = {}
        } else {
          coreConnector.internalDebugLog('Create New Session With User Identity For ' + userIdentity.userName)
        }

        opcuaClient.createSession(userIdentity, function (err, session) {
          if (err) {
            reject(err)
          } else {
            resolve({ opcuaClient: opcuaClient, session: session })
          }
        })
      } else {
        coreConnector.internalDebugLog('OPC UA Client Is Not Valid')
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.createSubscription = function (session, options) {
  return new this.core.nodeOPCUA.ClientSubscription(session, options)
}

de.biancoroyal.opcua.iiot.core.connector.setupSecureConnectOptions = function (opcuaClient, options) {
  return new Promise(
    function (resolve, reject) {
      if (opcuaClient) {
        opcuaClient.getEndpointsRequest(function (err, endpoints) {
          if (err) {
            reject(err)
          } else {
            if (endpoints && endpoints.length > 0) {
              de.biancoroyal.opcua.iiot.core.connector.logEndpoints(options, endpoints)
            }

            resolve({opcuaClient: opcuaClient, endpoints: endpoints})
          }
        })
      } else {
        reject(new Error('OPC UA Client Is Not Valid'))
      }
    })
}

de.biancoroyal.opcua.iiot.core.connector.logEndpoints = function (options, endpoints) {
  let coreConnector = this
  let cryptoUtils = require('node-opcua').crypto_utils
  let fs = require('fs')
  let path = require('path')
  let hexDump = require('node-opcua').hexDump

  // let treeify = require('treeify')
  // coreConnector.internalDebugLog(treeify.asTree(endpoints, true))

  if (!endpoints) {
    coreConnector.internalDebugLog('Endpoints Not Valid To Log')
  }

  if (endpoints[0]) {
    coreConnector.internalDebugLog('endpoint: ' + endpoints[0].endpointUrl)
    coreConnector.internalDebugLog('Application URI: ' + (endpoints[0].server) ? endpoints[0].server.applicationUri : 'unknown')
    coreConnector.detailDebugLog('Security Mode: ' + (endpoints[0].securityMode) ? endpoints[0].securityMode.toString() : 'none')
    coreConnector.detailDebugLog('securityPolicyUri: ' + endpoints[0].securityPolicyUri)
  }

  endpoints.forEach(function (endpoint, i) {
    coreConnector.detailDebugLog('endpoint: ' + endpoint.endpointUrl)

    if (endpoint.server) {
      coreConnector.detailDebugLog('Application URI: ' + endpoint.server.applicationUri)
      coreConnector.detailDebugLog('Product URI: ' + endpoint.server.productUri)
      coreConnector.detailDebugLog('Application Name: ' + endpoint.server.applicationName.text)
      coreConnector.detailDebugLog('Type: ' + endpoint.server.applicationType.key)
    }

    coreConnector.detailDebugLog('Security Mode: ' + (endpoint.securityMode) ? endpoint.securityMode.toString() : 'none')
    coreConnector.detailDebugLog('securityPolicyUri: ' + endpoint.securityPolicyUri)

    if (endpoint.server.discoveryUrls) {
      coreConnector.detailDebugLog('discoveryUrls: ' + endpoint.server.discoveryUrls.join(' - '))
    }

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

    if (endpoint.userIdentityTokens) {
      endpoint.userIdentityTokens.forEach(function (token) {
        coreConnector.detailDebugLog('policyId: ' + token.policyId)
        coreConnector.detailDebugLog('tokenType: ' + token.tokenType.toString())
        coreConnector.detailDebugLog('issuedTokenType: ' + token.issuedTokenType)
        coreConnector.detailDebugLog('issuerEndpointUrl: ' + token.issuerEndpointUrl)
        coreConnector.detailDebugLog('securityPolicyUri: ' + token.securityPolicyUri)
      })
    }
  })
}

de.biancoroyal.opcua.iiot.core.connector.disconnect = function (opcuaClient, session) {
  return new Promise(
    function (resolve, reject) {
      if (session && session.sessionId !== 'terminated') {
        session.close(function (err) {
          if (err) {
            reject(err)
          }

          if (opcuaClient) {
            opcuaClient.disconnect(function (err) {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          } else {
            resolve()
          }
        })
      } else if (opcuaClient) {
        opcuaClient.disconnect(function (err) {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
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
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    }
  )
}

de.biancoroyal.opcua.iiot.core.connector.removeFromList = function (array, element) {
  if (array && array.length) {
    const index = array.indexOf(element)

    if (index !== -1) {
      array.splice(index, 1)
    }
  }
}

module.exports = de.biancoroyal.opcua.iiot.core.connector
