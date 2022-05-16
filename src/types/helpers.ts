import {Todo} from "./placeholders";
import {AttributeIds, DataType, DataValue, NodeId, NodeIdType, StatusCode} from "node-opcua";
import {NodeMessageInFlow} from "node-red";

export type TimeUnits =
  'ms' |
  's' |
  'm' |
  'h';

export type TimeUnitNames =
  'msec.' |
  'sec.' |
  'min.' |
  'h.' |
  '';

export type WriteMessage = {
  addressSpaceItems: AddressSpaceItem[]
  payload: {
    nodesToWrite: NodeToWrite[],
  }
  valuesToWrite?: Todo[]
}

export type AddressSpaceItem = {
  nodeId: string
  browseName: string
  displayName: string
  nodeClass: string
  datatypeName: string
}

export type BrowseMessage = {
  'topic': string
  'nodeId': string
  'browseName': string
  'nodeClassType': string
  'typeDefinition': string
  'payload': ''
}

export type NodeToWrite = {
  nodeId: NodeId
  attributeId: AttributeIds.Value
  indexRange: null
  value: DataValue
}

export type DataTypeInput = DataType | string;

export type NodeIdentifier = NodeIdentifierNumeric | NodeIdentifierString;

type NodeIdentifierNumeric = {
  identifier: number
  type: NodeIdType.NUMERIC
}

type NodeIdentifierString = {
  identifier: string
  type: Exclude<NodeIdType, NodeIdType.NUMERIC>
}

/**
 * Creates a copy of type <T>, except that all keys are optional.
 */
export type Like<T> = {
  [key in keyof T]?: T[key]
}

/**
 * Get a list of enum keys from an enum
 */
export const getEnumKeys = <O extends object, K extends keyof O>(obj: O): K[] => {
  return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
}

/**
 * Give a type to NodeMessageInFlow to voerwrite the unknown type
 */
export type TypedNodeMessage<T> = NodeMessageInFlow & {
  payload: T
}

/**
 * A type used to represent anything that might have status codes
 */
export type StatusInput = {
  statusCodes?: StatusCode[]
  statusCode?: StatusCode
};