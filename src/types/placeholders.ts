import * as nodeOPCUA from "node-opcua";
import {BrowseMessage, DataType, DataValue, ItemNodeId, NodeIdentifier, NodeToWrite, VariantType} from "./core";
import {NodeId} from "node-opcua";

export const recursivePrintTypes = (o: Record<string, any>, depth: number = 1): void => {
  if (depth == 1)
    console.log("Types of object: {");
  const indent = "  ".repeat(depth);
  if (o === undefined || o === null){
    console.log(indent + "object is null or undefined");
    return;
  }
  Object.keys(o).forEach((key: string) => {
    if (typeof o[key] === "object") {
      console.log(indent + key + ": {");
      recursivePrintTypes(o[key], depth + 1);
      console.log(indent + "}, ");
    } else {
      console.log(indent + key + ": " + typeof key + " = " + o[key] + ',');
    }
  })
  if (depth == 1)
    console.log("} \nTypes Complete");
}

export type Todo = any;
export type TodoVoidFunction = (...args: any) => void;
export type TodoBianco = Todo;


export type NodeObject = {
  bianco: Bianco
  connector?: NodeConnector
  id: NodeId
  showErrors?: boolean

  emit: (event: string, ...args: any[]) => void
  error: (err: Error, msg: Todo) => void
}

export type NodeConnector = {
  bianco: Bianco
  on: (event: string, callback: TodoVoidFunction) => void
  removeAllListeners: () => void
}

export type ClientNode = {
  bianco: Bianco
} & Todo;

export type Bianco = {
  iiot: IIOT
};

export type IIOT = {
  nodeOPCUAId: NodeId
  stateMachine: StateMachine
  opcuaClient: nodeOPCUA.OPCUAClient
  opcuaSession: nodeOPCUA.ClientSession | null

  buildNewVariant: (datatype: DataType, value: any) => VariantType | null
  buildResultMessage: (result: WriteResult) => ResultMessage
  convertDataValueByDataType: (value: DataValue, dataType: DataType) => string
  dataValueIsString: (value: DataValue | string) => value is string
  deregisterForOPCUA: (node: NodeObject, callback: ()=>void) => void
  extractDataValueString: (message: WriteResultMessage, result: WriteResult) => string
  getBasicDataTypes: () => {name: string, dataType: nodeOPCUA.DataType}[]
  getVariantValue: (datatype: DataType, value: any) => number | Date | boolean | string
  handleWriteError: (err: Error, msg: string) => void
  newOPCUANodeIdFromItemNodeId: (item: ItemNodeId | string) => nodeOPCUA.NodeId
  newOPCUANodeIdFromMsgTopic: (msg: BrowseMessage) => nodeOPCUA.NodeId
  parseForNodeIdentifier: (nodeItem: string) => NodeIdentifier
  parseIdentifierFromMsgTopic: (msg: BrowseMessage) => NodeIdentifier
  parseIdentifierFromItemNodeId: (item: ItemNodeId | string) => NodeIdentifier
  parseNamspaceFromItemNodeId: (item: ItemNodeId | string) => string | null
  parseNamspaceFromMsgTopic: (msg: BrowseMessage | null) => string | null
  pushItemToWriteList: (msg: BrowseMessage, nodesToWrite: NodeToWrite[], item: ItemNodeId | string, value: DataValue) => void
  registerForOPCUA: (node: NodeObject) => void
  setMessageProperties: (message: WriteResultMessage, result: WriteResult, stringValue: string) => ResultMessage
  writeToSession: (session: OPCUASession, originMsg: string) => void
}

export type StateMachine = {
  getMachineState: () => Todo
}

export type OPCUASession = Todo;
export type WriteResult = {msg: WriteResultMessage} & Todo;
export type WriteResultMessage = Todo;
export type ResultMessage = {
  resultsConverted: string
  error: string
} & WriteResultMessage;


export type de = {
  biancoroyal: Biancoroyal
}

export type Biancoroyal = {
  opcua: Opcua
};

export type Opcua = {
  iiot: IIOT
}
