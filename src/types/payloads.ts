import {CrawlerPayload} from "../opcua-iiot-crawler";
import {BrowserPayload} from "../opcua-iiot-browser";
import {ListenPayload} from "../opcua-iiot-listener";
import {ReadPayload} from "../opcua-iiot-read";
import {MethodPayload} from "../opcua-iiot-method-caller";
import {WritePayload} from "../opcua-iiot-write";

export type AnyPayload = CrawlerPayload |
  BrowserPayload |
  ReadPayload |
  WritePayload |
  ListenPayload |
  MethodPayload;
