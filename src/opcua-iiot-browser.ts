/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'
import * as nodered from "node-red";
import {Todo, TodoVoidFunction} from "./types/placeholders";
import {Node, NodeMessageInFlow} from "@node-red/registry";

import coreBrowser, {BrowserInputPayloadLike} from "./core/opcua-iiot-core-browser";
import {
    checkConnectorState,
    checkSessionNotValid, deregisterToConnector,
    FAKTOR_SEC_TO_MSEC,
    OBJECTS_ROOT, registerToConnector, resetIiotNode,
    setNodeStatusTo
} from "./core/opcua-iiot-core";
import {NodeMessage, NodeStatus} from "node-red";
import {NodeId} from "node-opcua";
import {AddressSpaceItem} from "./types/core";
import {isUndefined} from "underscore";

interface OPCUAIIoTBrowserNodeDef extends nodered.NodeDef {
    nodeId: Todo
    name: string
    justValue: Todo
    sendNodesToRead: Todo
    sendNodesToBrowser: Todo
    sendNodesToListener: Todo
    singleBrowseResult: Todo
    showStatusActivities: boolean
    showErrors: boolean
    recursiveBrowse: boolean
    recursiveDepth: number
    delayPerMessage: number
    connector: string
}

interface OPCUAIIoTBrowser extends nodered.Node {
    nodeId: Todo
    name: string
    justValue: Todo
    sendNodesToRead: Todo
    sendNodesToBrowser: Todo
    sendNodesToListener: Todo
    singleBrowseResult: Todo
    showStatusActivities: boolean
    showErrors: boolean
    recursiveBrowse: boolean
    recursiveDepth: number
    delayPerMessage: number
    connector: Node
}

/**
 * Browser Node-RED node.
 *
 * @param RED
 */
module.exports = function (RED: nodered.NodeAPI) {
    // SOURCE-MAP-REQUIRED

    function OPCUAIIoTBrowser(this: OPCUAIIoTBrowser, config: OPCUAIIoTBrowserNodeDef) {
        RED.nodes.createNode(this, config)

        this.nodeId = config.nodeId
        this.name = config.name
        this.justValue = config.justValue
        this.sendNodesToRead = config.sendNodesToRead
        this.sendNodesToBrowser = config.sendNodesToBrowser
        this.sendNodesToListener = config.sendNodesToListener
        this.singleBrowseResult = config.singleBrowseResult
        this.showStatusActivities = config.showStatusActivities
        this.showErrors = config.showErrors
        this.recursiveBrowse = config.recursiveBrowse
        this.recursiveDepth = config.recursiveDepth || 1
        this.delayPerMessage = config.delayPerMessage || 0.2

        this.connector = RED.nodes.getNode(config.connector)

        let nodeConfig: Todo = {
            ...this,
            ...coreBrowser.initBrowserNode()
        }
        nodeConfig.iiot.delayMessageTimer = []

        const extractDataFromBrowserResults = (browserResultToFilter: Todo, lists: Todo) => {
            lists.addressItemList = []

            browserResultToFilter.forEach(function (result: Todo) {
                result.references.forEach(function (reference: Todo) {
                    coreBrowser.detailDebugLog('Add Reference To List :' + reference)
                    lists.browserResults.push(coreBrowser.transformToEntry(reference))

                    if (reference.nodeId) {
                        lists.nodesToRead.push(reference.nodeId.toString())

                        lists.addressItemList.push({
                            nodeId: reference.nodeId.toString(),
                            browseName: reference.browseName.toString(),
                            displayName: reference.displayName.toString(),
                            nodeClass: reference.nodeClass.toString(),
                            datatypeName: reference.typeDefinition.toString()
                        })
                    }
                })
            })

            lists.addressSpaceItemList = lists.addressSpaceItemList.concat(lists.addressItemList)
        }

        const browse = function (rootNodeId: NodeId, msg: NodeMessageInFlow, depth: number, lists: Todo, callback: TodoVoidFunction) {
            if (checkSessionNotValid(nodeConfig.iiot.opcuaSession, 'Browse')) {
                return
            }

            coreBrowser.internalDebugLog('Browse Topic To Call Browse ' + rootNodeId)
            let rootNode = 'list'

            coreBrowser.browse(nodeConfig.iiot.opcuaSession, rootNodeId)
                .then(function (browserResults: Todo) {
                    if (browserResults.length) {
                        coreBrowser.detailDebugLog('Browser Result To String: ' + browserResults.toString())
                        extractDataFromBrowserResults(browserResults, lists)
                        if (nodeConfig.recursiveBrowse) {
                            if (depth > 0) {
                                let newDepth = depth - 1

                                let subLists = createListsObject()
                                if (!nodeConfig.singleBrowseResult) {
                                    callback(rootNode, depth, msg, lists)
                                } else {
                                    subLists = lists
                                }

                                browseNodeList(lists.addressItemList, msg, newDepth, subLists, callback)
                            } else {
                                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse At ' + rootNodeId)
                                callback(rootNodeId, depth, msg, lists)
                            }
                        } else {
                            callback(rootNodeId, depth, msg, lists)
                        }
                    } else {
                        coreBrowser.internalDebugLog('No Browse Results On ' + rootNodeId)
                    }
                }).catch(function (err: Error) {
                coreBrowser.browseErrorHandling(nodeConfig, err, msg, lists, callError, statusHandler)
            })
        }

        const callError = (err: Error, msg: NodeMessageInFlow): void => {
            this.error(err, msg)
        }

        interface Lists {
            browserResults: Todo[]
            nodesToRead: Todo[]
            addressSpaceItemList: Todo[]
            addressItemList: Todo[]
            nodesToBrowse: Todo[],
        }

        const createListsObject = (): Lists => {
            return {
                nodesToBrowse: [],
                nodesToRead: [],
                addressItemList: [],
                addressSpaceItemList: [],
                browserResults: []
            }
        }

        const browseNodeList = function (addressSpaceItems: AddressSpaceItem[], msg: NodeMessageInFlow, depth: number, lists: Lists, callback: TodoVoidFunction) {
            if (checkSessionNotValid(nodeConfig.connector.iiot.opcuaSession, 'BrowseList')) {
                return
            }

            coreBrowser.internalDebugLog('Browse For NodeId List')
            let rootNode = 'list'

            if (nodeConfig.connector.iiot.opcuaSession) {
                coreBrowser.browseAddressSpaceItems(nodeConfig.connector.iiot.opcuaSession, addressSpaceItems)
                    .then((browserResults: Todo) => {
                        coreBrowser.detailDebugLog('List Browser Result To String: ' + browserResults.toString())
                        extractDataFromBrowserResults(browserResults, lists)
                        if (nodeConfig.recursiveBrowse) {
                            if (depth > 0) {
                                let newDepth = depth - 1

                                let subLists = createListsObject()
                                if (!nodeConfig.singleBrowseResult) {
                                    callback(rootNode, depth, msg, lists)
                                } else {
                                    subLists = lists
                                }
                                browseNodeList(lists.addressItemList, msg, newDepth, subLists, callback)
                            } else {
                                coreBrowser.internalDebugLog('Minimum Depth Reached On Browse List')
                                callback(rootNode, depth, msg, lists)
                            }
                        } else {
                            callback(rootNode, depth, msg, lists)
                        }
                    }).catch(function (err: Error) {
                    coreBrowser.browseErrorHandling(nodeConfig, err, msg, lists, callError, statusHandler)
                })
            }
        }

        const sendMessage = (rootNodeId: NodeId, depth: number, originMessage: NodeMessageInFlow, lists: Todo) => {

            if (!lists) {
                coreBrowser.internalDebugLog('Lists Not Valid!')
                if (nodeConfig.showErrors) {
                    this.error(new Error('Lists Not Valid On Browse Send Message'), originMessage)
                }
            }

            let listenerParameters = getListenParameters(originMessage)

            const payload = {
                ...(originMessage.payload as BrowserInputPayloadLike),
                nodetype: 'browse',
                justValue: nodeConfig.justValue,
                rootNodeId,
                browserResults: lists.browserResults,
                recursiveBrowse: nodeConfig.recursiveBrowse,
                recursiveDepth: depth,
                recursiveDepthMax: nodeConfig.recursiveDepth,
                listenerParameters,
                ...enhanceMessage(lists),
                ...setMessageLists(lists)
            }

            const newMessaage = {
                ...originMessage,
                payload
            }

            nodeConfig.iiot.messageList.push(newMessaage)

            if (nodeConfig.showStatusActivities && nodeConfig.oldStatusParameter.text !== 'active') {
                nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'active', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
            }

            nodeConfig.iiot.delayMessageTimer.push(setTimeout(() => {
                this.send(nodeConfig.iiot.messageList.shift())
            }, nodeConfig.delayPerMessage * FAKTOR_SEC_TO_MSEC))
        }

        const resetAllTimer = function () {
            nodeConfig.iiot.delayMessageTimer.forEach((timerId: Todo) => {
                clearTimeout(timerId)
                timerId = null
            })
        }

        const getListenParameters = function (msg: Todo) {
            if (msg.injectType === 'listen') {
                return msg.payload
            } else {
                return null
            }
        }

        const enhanceMessage = (lists: Lists) => {
            if (nodeConfig.justValue)
                return {
                    browserResults: lists.addressSpaceItemList
                }

            return {
                browseTopic: nodeConfig.browseTopic,
                browserResultsCount: lists.browserResults.length,
                endpoint: nodeConfig.connector?.endpoint,
                session: (nodeConfig.iiot.opcuaSession) ? nodeConfig.iiot.opcuaSession.name : 'none'
            }
        }

        const setMessageLists = function (lists: Lists) {
            return {
                nodesToRead: lists.nodesToRead,
                nodesToReadCount: lists.nodesToRead.length,
                addressItemsToRead: lists.addressSpaceItemList,
                addressItemsToReadCount: lists.addressSpaceItemList.length,
                addressItemsToBrowse: lists.addressSpaceItemList,
                addressItemsToBrowseCount: lists.addressSpaceItemList.length,
            }
        }

        const browseSendResult = function (rootNodeId: NodeId, depth: number, msg: NodeMessageInFlow, lists: Todo) {
            coreBrowser.internalDebugLog(rootNodeId + ' called by depth ' + depth)

            if (nodeConfig.singleBrowseResult) {
                if (depth <= 0) {
                    sendMessage(rootNodeId, depth, msg, lists)
                    reset(lists)
                }
            } else {
                sendMessage(rootNodeId, depth, msg, lists)
                reset(lists)
            }
        }

        const reset = function (lists: Todo) {
            lists = createListsObject()
        }

        const browseWithAddressSpaceItems = function (msg: NodeMessageInFlow, depth: number, lists: Lists) {
            const payload = msg.payload as BrowserInputPayloadLike

            if (payload.addressSpaceItems && payload.addressSpaceItems.length > 0) {
                browseNodeList(payload.addressSpaceItems, msg, depth, lists, browseSendResult)
            } else {
                coreBrowser.detailDebugLog('Fallback NodeId On Browse Without AddressSpace Items')
                nodeConfig.browseTopic = nodeConfig.nodeId || coreBrowser.browseToRoot()
                browse(nodeConfig.browseTopic, msg, depth, lists, browseSendResult)
            }
        }

        const startBrowser = (msg: NodeMessageInFlow) => {
            if (checkSessionNotValid(nodeConfig.connector.iiot.opcuaSession, 'Browser')) {
                this.status({ fill: 'red', shape: 'ring', text: 'invalid connector session' })
                return
            }

            let lists = createListsObject()
            let depth = (nodeConfig.recursiveBrowse) ? nodeConfig.recursiveDepth : 0
            nodeConfig.browseTopic = coreBrowser.extractNodeIdFromTopic(msg.payload as BrowserInputPayloadLike, nodeConfig) // set topic to the node object for HTTP requests at node

            if (nodeConfig.browseTopic && nodeConfig.browseTopic !== '') {
                browse(nodeConfig.browseTopic, msg, depth, lists, browseSendResult)
            } else {
                browseWithAddressSpaceItems(msg, depth, lists)
            }
        }

        this.on('input', (msg: NodeMessageInFlow) => {
            if (!checkConnectorState(nodeConfig, msg, 'Browser', errorHandler, emitHandler, statusHandler)) {
                return
            }

            if (nodeConfig.showStatusActivities) {
                nodeConfig.oldStatusParameter = setNodeStatusTo(nodeConfig, 'browsing', nodeConfig.oldStatusParameter, nodeConfig.showStatusActivities, statusHandler)
            }
            startBrowser(msg)
        })

        const emitHandler = (msg: string) => {
            this.emit(msg)
        }

        const errorHandler = (err: Error, msg: NodeMessage) => {
            this.error(err, msg)
        }

        const statusHandler = (status: string | NodeStatus) => {
            this.status(status)
        }

        const onAlias = (event: string, callback: () => void) => {
            // @ts-ignore
            this.on(event, callback)

        }

        registerToConnector(nodeConfig, statusHandler, onAlias, errorHandler)

        this.on('close', (done: () => void) => {
            deregisterToConnector(nodeConfig, () => {
                resetIiotNode(nodeConfig)
                done()
            })
        })
    }


    RED.nodes.registerType('OPCUA-IIoT-Browser', OPCUAIIoTBrowser)

    RED.httpAdmin.get('/opcuaIIoT/browse/:id/:nodeId', RED.auth.needsPermission('opcuaIIoT.browse'), function (req, res) {
        let node = RED.nodes.getNode(req.params.id)
        let entries: Todo[] = []
        let nodeRootId = decodeURIComponent(req.params.nodeId) || OBJECTS_ROOT
        coreBrowser.detailDebugLog('request for ' + req.params.nodeId)

        if ((node as Todo).iiot.opcuaSession) {
            coreBrowser.browse((node as Todo).bianco.iiot.opcuaSession, nodeRootId).then(function (browserResult: Todo) {
                browserResult.forEach(function (result: Todo) {
                    if (result.references && result.references.length) {
                        result.references.forEach(function (reference: Todo) {
                            entries.push(coreBrowser.transformToEntry(reference))
                        })
                    }
                })
                res.json(entries)
            }).catch(function (err: Error) {
                coreBrowser.internalDebugLog('Browser Error ' + err)
                if ((node as Todo).showErrors) {
                    node.error(err, {payload: 'Browse Internal Error'})
                }

                entries.push({
                    displayName: {text: 'Objects'},
                    nodeId: OBJECTS_ROOT,
                    browseName: 'Objects'
                })
                res.json(entries)
            })
        } else {
            res.json(entries)
        }
    })
}
