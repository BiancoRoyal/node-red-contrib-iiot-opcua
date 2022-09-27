## [4.0.12](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.10...v4.0.12) (2022-09-27)


### Bug Fixes

* changed Node-RED PLUS to PLUS for Node-RED ([767d567](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/767d567974e752ac3b5fcae533cf3cda5a8a3601))
* **connector-tests:** connector e2e tests running again ([12cda71](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/12cda71444f0687633385707c99ce3ed9c0dce42))
* **connector:** max subscription deprecated ([d58462b](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/d58462bd89e4891ef32f25004233bccf8cdff74a))
* **core:** missing inject handling and wrong method call ([b8ff7e3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b8ff7e3ed53fce7cdd4880d7108e7519670c9d74))
* **crawler:** tests improved ([0d73663](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0d736637785c986340d6d85eaf69f154b8a4596a))
* **e2e-flows:** new enum value None instead NONE of node-opcua ([4b45547](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/4b455477253789c6162457d7d694835a78e114dd))
* event node changes now the nodetype to "events" ([eb6264d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/eb6264dbccca5b6b16f097059095f8408dbe4d69))
* event shortcut functions deprecated ([04dafc3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/04dafc3ee726a4fd93c1bdeeb83ced527a22db7a))
* **event-listener:** e2e tests improved ([73a6e94](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/73a6e94af2dc659fad3ff7c039dc938d40e6abe1))
* **flex-connector:** new throw error and e2e works again ([efce751](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/efce751dcae371dcc1c6263d98f6bc09db71288c))
* **flex-server:** missing new msg structure handling ([be856dd](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/be856dd83d271085096f66914a8c8df981000085))
* listener now handles nodetype='events' msg and subs events ([c20d6ea](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/c20d6eafa4adc8536ce441e61acc8f37f8c7ba61))
* listener now handles nodetype='events' msg and subs events ([2ef0bfc](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/2ef0bfcf6f4b1f0ff69feb5911e25e1fbcd5959b))
* **listener:** did not stop directly ([cad1543](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/cad1543525748cf9d8e87c1c6ae1d2ab8e94d219))
* **listener:** e2e test improved ([bb3ac03](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/bb3ac036073396c31425786550fcf2f5ed32fda6))
* **response-test:** wrong node id ([6fc8405](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/6fc84053c8460e34ad9f1a10b97dd56766d345eb))
* **server-cmd:** e2e test server cmd works again ([ee47e17](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ee47e178bdaab993b816da0e9c06957e51fb4bbc))
* **test:** cleaned and extracted flows of ASO test and fixed msg testing ([e96998c](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/e96998cf41e765919c9d8d54664a4f69e0a0b24f))
* **test:** more result filter e2e tests pass again ([10d9b0e](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/10d9b0e41b31f961072772ae91c948211f93c9b3))
* **test:** payload type is object rather than Array ([2e59210](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/2e592102b84634e33d07f579a36f0236560bed59))
* **tests:** None instead NONE of node-opcua for all tests ([778ee96](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/778ee9646e5ac0663b0d521eb5e43cc4bcb6613f))
* **tests:** server NONE to None as connector parameter ([d811b04](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/d811b046e15d36a31bde627281561c311858ebed))
* **units:** removed node.receive() from inject tests ([d018120](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/d018120b8310aaa70105f8987a3b4d4749a20da6))


### Features

* added npm run scripts for e2e, unit and core tests on their own ([f282bd4](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/f282bd4264ffc63cd52a9f3d4ba26539229a7d4c))
* **response:** new payload type in json ([de22d9b](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/de22d9b25ee4c7bede50a4077f691097ddcf5f5f))



## [4.0.10](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.9...v4.0.10) (2022-09-20)


### Bug Fixes

* **listener:** deconstruct monitoredItem during sendDataFromMonitoredItem ([081414a](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/081414a3a092a75e888f90b863b3a821984d1e32))



## [4.0.9](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.8...v4.0.9) (2022-07-29)


### Bug Fixes

* **connector:** tests mostly working again  ([81f9917](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/81f991766a625d009298aefe7828fd39f2987130))
* **method-caller:** duplicate in value assign ([7cb32f5](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/7cb32f5193dff5e52734cc16f6a8dd81d63edc0b))
* **test:** connector method caller ([d58cf1d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/d58cf1d853cbc78a30b6fa63f9d87002fe1fcb59))
* **test:** method caller works again but needs more ([52f93d3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/52f93d3fca03550091577ada638c4954d9c403a1))
* **test:** test works again ([16633a2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/16633a2ca61d246ae0f1235e5d83ed2385755c9b))



## [4.0.7](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.6...v4.0.7) (2022-07-26)



## [4.0.6](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.5...v4.0.6) (2022-07-26)


### Bug Fixes

* codacy markdown ([7867233](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/78672331e0579cac328a6c822f9bfe7199b351aa))
* inject node once did not work ([3441933](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/344193377aae42aab4a300955f8889a85cdffdd1))
* read from inject does not work ([76ce558](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/76ce558488b8b78cacae28b0dab53b6ba450e970))
* test has now good reads ([af60409](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/af6040925c3fe861a8a26ebbfb2eca405c3a8a31))



## [4.0.4](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.3...v4.0.4) (2022-07-22)



## [4.0.3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.2...v4.0.3) (2022-07-22)


### Bug Fixes

* gh action publish ([97a2589](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/97a2589cd0e0513fad8f4ab836243811f44bccf9))



## [4.0.2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.1...v4.0.2) (2022-07-15)



## [4.0.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v4.0.0...v4.0.1) (2022-05-27)


### Bug Fixes

* missing pki pkg to install via Node-RED ([fc852b8](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/fc852b8bf470581655a3ebe6c63d17b7d3248e58))
* node-red install ([8637c00](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/8637c001ee237c96781fc7a085e8e97a57c3f02f))



# [4.0.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.10.2...v4.0.0) (2022-05-27)



## [3.10.2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.10.0...v3.10.2) (2019-03-17)


### Bug Fixes

* comment unused todo ([2c7ad46](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/2c7ad46dadd939e26ac9c6990d25c6254dee9e85))
* issue [#89](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/89) by checking time interval to pass Int32 stream of node-opcua ([d9be2ce](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/d9be2ce82d88fc43364ac1e8699fee74ba13b006))
* remove ISA95 package ([a0c60da](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/a0c60da44230c01d3eb363c19aff8988ed554fed))
* server individual certificates control ([a41f529](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/a41f529f0c9772598b0d457be4c133ecd3f104dc))
* server LDS options and individual server certs ([dc1ea0d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/dc1ea0d0da5ea76e53956d0c539d7bb2e6565f96))



# [3.10.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.9.0...v3.10.0) (2019-03-15)


### Bug Fixes

* issue [#1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/1) ([fe0da33](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/fe0da33f8900b17e800424e6017d7dd1c4cf221c))
* separate servers by port for LDS ([034f563](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/034f5637a78345cffe74e84b820a062426afcd5b))


### Features

* set requestedMaxReferencesPerNode to 100k ([a62f5bb](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/a62f5bb1966ce1b7f26718d9a92eb39865842eb5))



# [3.9.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.8.0...v3.9.0) (2019-03-15)


### Bug Fixes

* travis build jest ([728f1af](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/728f1af32549cdafff39351424a5bdff8db673f9))
* travis for post install ([10dee06](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/10dee060b0abb142ca71f57ac9bf9905d41a0c2e))



# [3.8.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.7.4...v3.8.0) (2018-12-21)


### Features

* use connection lost event of node-opcua ([0dde329](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0dde329ef3b62b28583580bb96bdc8b9a63f8306))



## [3.7.4](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.7.3...v3.7.4) (2018-12-06)


### Bug Fixes

* just value on recursive browse was the wrong list ([b1ecbf3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b1ecbf39e5b353a614df88b97b9b68e3a30b64aa))



## [3.7.3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.7.2...v3.7.3) (2018-12-06)


### Bug Fixes

* handle issue [#76](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/76) different type of boolean results from node-opcua ([87cebed](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/87cebedda87c13ff852a48a825782de71ac35a9c))
* issue [#76](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/76) integration test addressSpaceList ([00e4cea](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/00e4cea3430c38f47c343cdfe4a2660d04ea6599))
* recursive browse on simple structures issue [#77](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/77) ([dcf17c5](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/dcf17c5cf2e695352189079df4291fb3c24b1e52))


### Features

* **ASO:** propertyOf and type definitions with ASO ([ecea056](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ecea056e279d992889b01eaf0cfdd766f34ab662))



## [3.7.2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.7.1...v3.7.2) (2018-11-17)


### Bug Fixes

* **listener:** issue [#71](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/71) context global was broken by collections map require ([cec1606](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/cec16061b98511b27d5c36703af66ed3a74c8ff3))



## [3.7.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.5.0...v3.7.1) (2018-11-14)


### Bug Fixes

* **connector:** namespace could be null on deregister nodes ([86f73d1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/86f73d14a249e808510d95628a0fdfa067826f93))
* **flex-server:** default model has to use node.bianco.iiot.assert  ([6b2ce0a](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/6b2ce0a78d97d140873d9c8c54c672af9adbad66))
* **issue:** issue [#74](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/74) - less memory on restart via CDM ([1e2662a](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/1e2662aa53535c0fd062465e5198e4c01759c8de))
* model is cleaned up in every case ([a96510d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/a96510d4715ef0a8adaa8d6af33a621dcd6b9987))


### Features

* **result-filter:** filter from browser and crawler ([f7662cc](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/f7662cc223d29cb8751af82ba42ad579191b8ee8)), closes [#70](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/70)
* **result-filter:** issue [#73](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/73) ([b6a4653](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b6a4653285015d42f1413fc4132f6e482e2ab7ef))
* show more details on response node ([b97206e](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b97206e3902fdc2f3392dbc0e05fdc841968bf7a))



# [3.5.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.4.3...v3.5.0) (2018-11-09)


### Bug Fixes

* issue [#71](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/71) ([8b8d317](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/8b8d317de259ada806859d2c5be784ca02684aa7))
* issue [#71](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/71) ([0f23eba](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0f23eba079724e0479f763a162c4926ba063da9a))



## [3.4.3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.4.1...v3.4.3) (2018-11-06)


### Bug Fixes

* issue [#70](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/70) ([30f152d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/30f152d8497e12e171daed2e4a2470b69085d113))



## [3.4.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.4.0...v3.4.1) (2018-11-05)


### Bug Fixes

* check user core function ([2908f87](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/2908f877e74790c5d8a930fbf28f54d7ed396c32))
* terminate only started subscription  ([3fd767d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/3fd767d319650e3ada6d4cd495af1fabd7f0ff7f))



# [3.4.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.3.0...v3.4.0) (2018-11-04)


### Bug Fixes

* issue [#69](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/69) ([8477185](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/8477185228ef91013d0e2fc178f9a94ef26ab85c))
* listener should not terminate group items on reconnection ([75b8dfa](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/75b8dfa2ce50a9899328d111d206e930a727c313))


### Features

* check option and hide certificates and private key settings on default ([0f68a40](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0f68a4043b2d35932e088da483471892288794f1))



# [3.3.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.2.0...v3.3.0) (2018-10-25)


### Bug Fixes

* extract nodeId for all types i, s, g, b ([bd16b42](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/bd16b420a62f0474fb397fb4877e9677d47aeb13))
* no error log to nodes ([bf39208](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/bf392087883bdea2b117ca8bd445a329ed71d120))
* remove console log ([a6a0b4b](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/a6a0b4bd174e57f7157119c697377c90e09c2dbe))
* typos ([298ce5a](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/298ce5ade8c2c93c30c1e99696f254474e7045b5))


### Features

* [#65](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/65) max bad session requests before reconnect starts ([77cf255](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/77cf255d4b41cf54882aa36801438880ec21dfff))
* [#68](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/68) connector option to set if the connector has subscriptions or not ([bbba493](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/bbba49399fbfe50e054e8864feb947d0f8491f22))
* [#68](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/68) connector option to set if the connector has subscriptions or not ([38155ca](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/38155cabfaf173d7c6dc258844aa3a88af2b0c9e))



# [3.2.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.1.0...v3.2.0) (2018-10-20)


### Bug Fixes

* msg object missed in convert value ([387aacd](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/387aacd8bfefe52b2b908e1a1eec447d11b96113))
* response multiple results ([50510f5](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/50510f587c8c4a2e027d6399680270d0b7257b9d))
* **test:** failing event subscription ([7591119](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/7591119b923d8201ceba3afd34feff1a6d1040fc))


### Features

* new negate for filtering crawler results [#63](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/63) ([de80c33](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/de80c3326498a20b4a595f250ce3fcfc17f9246a))
* response unset value filter [#61](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/61) ([4260d13](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/4260d138ef762d0b9e8c2f6074002dba065f0927))
* status browsing on show activities  [#62](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/62) ([3a2b6f6](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/3a2b6f64565c8fb126bd6624233f1ea231bdf3a7))



# [3.1.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v3.0.0...v3.1.0) (2018-10-18)


### Bug Fixes

* Byte and other datatypes to write to server [#52](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/52) ([02bfb71](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/02bfb71795f2eb3b68b2b6b1365963a6e6073314))
* flex connector error on deploy to Node-RED ([ed336c3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ed336c3c49363c9cd5eb0a621a0a95983867a0f1))
* server close improved ([5528e23](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/5528e235caec4fa4c3c7522a17ccd8700263fd62))
* test do not need discovery every time ([26f7fe9](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/26f7fe9e6a894ff96dc8744251dbc570f8271513))
* timing in connecting with actual node-opcua server inside node-red ([56ae397](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/56ae397e85b10246a4dda0559f0d0c8ec1db5965))


### Features

* limits tab for flex server and option to set delay on close for the flex server ([b8321a7](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b8321a744f5e03f93ed253cdd4ebb75cadc3e688))
* new flex connector the send connection data to the connector via events [#44](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/44) ([25df528](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/25df528ed682448d3701227ec558e36cd830cce0))
* new option to to get some delay on server close ([0f89d73](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0f89d735262cf67dcaeb8bcec054a01d6b902493))



# [3.0.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.7.1...v3.0.0) (2018-10-14)


### Bug Fixes

* API getEndpoints ([63f5c00](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/63f5c009f8bfb6f7acb1e1e514e21016e3deb664))
* **API:** self organised node-opcua ([1cb4760](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/1cb4760e53d07ddfe827f5f5f1a8136eab272af8))
* **browser:** browse without recursive settings ([5276e76](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/5276e76f808d29bd630b788662063cba87cf8a7d))
* **browser:** list to read and listen ([98c1700](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/98c170061e0850781a6245d89a833dbe334cfe24))
* **browser:** wrong result used ([0db0aac](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0db0aacdaa061e10ad2228c2efdf2776d0e8feaf))
* code for standard.js ([346dac6](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/346dac6bc9b1bb62f6554a6f34c2231418f3479c))
* examples namespace since 0.4.4 of node-opcua ([1088074](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/1088074e8bc87a50387f0eb83d507cbb71a189df))
* issue  [#54](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/54) - new historyStart and historyEnd option parameter via msg or to set from node options ([abffca0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/abffca0db4d384c751bc54080e0b58cd252f21ff))
* listener monitored item select from list ([8213bef](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/8213bef6c5bd9a5fff30170f787c23b373cb3c90))
* **listener:** browser to listener parameters and options ([ee1c7b3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ee1c7b3c987cedb80228b1698fbc51a25fbf411e))
* **method:** variable was not declared anymore ([60acae8](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/60acae8848f3088a51ff609aff1d527af371cc7f))
* new version node-opcua 0.4.6 to fix grouped monitored items problem ([c922231](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/c922231e1dcd534da0daa3459c50f5e52ba15774))
* **read:** history read ([9c1b2be](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/9c1b2be86d89931969e3a33a42731e9952b8f601))
* server delay on shutdown for listener subscriptions ([82ba6f7](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/82ba6f77eaf401b1a30b0aabb3326a4d152a18d1))
* test crawler error travis ([029fa76](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/029fa76db1c1e1a23eb238a447e23fdaa5a4d0e5))
* **test:** failed on Windows 10 and nodejs 9 ([8cef89d](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/8cef89d09b68a7c44a7e8f7d8487130040cd9625))
* testing suites ([72adde6](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/72adde6614421d0be3a2cbd69e9dcc14c7a9d00a))
* **tests:** working with the new v0.4.1 of node-opcua ([f8a2bd6](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/f8a2bd617a348d6eee16a97274172d222a53b679))
* **test:** test did not end while interval was running ([e38e3d1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/e38e3d1ff72340ced37b77280a27beb111dfc84e))
* **test:** with patterns of codacy ([c0b493a](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/c0b493a4851475b34ec1c7f9e2656f9181e88dcd))


### Features

* **browser:** recursive browsing ([de98d78](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/de98d78e000d48d44af8cd4e4b330ab50e3298b6))
* **browser:** recursive browsing with depth ([5b86688](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/5b86688a783f0391a79bae0dc60d4e708b32743f))
* **crawler:** filter by every key-value pair of the result items ([bd16831](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/bd168317089cf09f4c7eb075bf19052560351fa1))
* **crawler:** filter by property with a match of string ([e251a45](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/e251a45ac1db6413bd580a32ba2261bfc1dd3382))
* issue [#57](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/57) passing topic for monitored items ([ab8b4ca](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ab8b4ca4b4e558f0931b136aeffbcf4f7e59dd4c))
* **listener:** new structure for event fields ([536f314](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/536f314f4855c62ac302d7d8930af878c6d512e0))
* new flex-server discovery options ([f5de659](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/f5de65957436471afe0b48ba8f6c368df2ffa682))
* **response:** compressing results ([2cc4504](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/2cc4504fa123d30aeda83fb40c05af2b17fa159c))
* **server:** flex server working with new namespace operations ([0664f52](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0664f52bada090602b98c4d7181307d1fbf74302))
* upgrade node-opcua to v0.4.5 ([4d48954](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/4d489543b4458c1b6f6024cb2997f1a67555ea48))



## [2.7.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.6.1...v2.7.1) (2018-05-28)


### Bug Fixes

* **inject:** error on a whole new flow with the address space items list ([cf90fd0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/cf90fd002a7addccb7f4e0cfa8be25a904c82249))



## [2.6.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.6.0...v2.6.1) (2018-04-08)


### Bug Fixes

* reconnect handling via FSM states ([9a14424](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/9a144247e93337c59c12c33f4e709177100916ed))



# [2.6.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.5.2...v2.6.0) (2018-04-07)



## [2.5.2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.5.1...v2.5.2) (2018-03-31)


### Bug Fixes

* **server:** ASO Demo switch off ([01f7d37](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/01f7d3749631e694a4c2e8c53d01ca63a7fadf6a))



## [2.5.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.5.0...v2.5.1) (2018-03-29)


### Features

* **connector:** new connection strategy defaults ([afe9837](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/afe983768ea7f68c2feb898e057caa819a75a688))



# [2.5.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.4.2...v2.5.0) (2018-03-28)


### Bug Fixes

* **node:** issue [#46](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/46) inject type and using payload from events via Node node ([b7c884f](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/b7c884fe7413b6a08b68860fa4af70c95062ae2b))
* **nodes:** issues while testing ([7944ea0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/7944ea0dece6c894e51dbc1b0d5b52622d229e4f))


### Features

* **connector:** discover for endpoints and endpoint lookup separated ([7a55a54](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/7a55a543ce894095a50b7ad0970e5285bcc1aad6))
* **new-browse:** browse to single result from multiple address space itmes ([0dba722](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0dba722212711046346ee76554b2b8cbbab0b34a))



## [2.4.2](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.4.1...v2.4.2) (2018-03-27)



## [2.4.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.4.0...v2.4.1) (2018-03-27)


### Bug Fixes

* **connector:** issue [#36](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/issues/36) sessionId not needed and removed ([0a5e1ee](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/0a5e1ee1daec43ec2d27341142317a723de49cb9))



# [2.4.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.3.3...v2.4.0) (2018-03-26)


### Bug Fixes

* **BadSession:** now reconnecting with a new session ([c7b24aa](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/c7b24aac973285cc96182e2e80b2ba6498b52834))
* **connector:** session handling by node-opcua v0.2.2 ([afbaf87](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/afbaf87aabd5d34cb7d53c11c681d7bd41ac8807))
* **connector:** session keepalive, auto select endpoint ([1a1b991](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/1a1b9912feb0aae85772a3e568b39c1c5b13220b))


### Features

* **new-lib:** node-opcua v0.2.3 update ([ef046dd](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ef046dd9ddfa36c23cc6801c6999b70a242b99e6))
* **new-lib:** node-opcua v0.2.3 update ([ef28e76](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/commit/ef28e76b3b5e31c33926c8a4ac492f0985ee1230))



# [2.1.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.0.12...v2.1.0) (2018-03-05)



## [2.0.12](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.0.10...v2.0.12) (2018-03-05)



## [2.0.10](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.0.5...v2.0.10) (2018-02-25)



## [2.0.5](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.0.4...v2.0.5) (2018-02-20)



## [2.0.4](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v2.0.3...v2.0.4) (2018-02-16)



## [2.0.3](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v1.3.3...v2.0.3) (2018-02-12)



## [1.3.1](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v1.3.0...v1.3.1) (2018-01-07)



# [1.1.0](https://github.com/BiancoRoyal/node-red-contrib-iiot-opcua/compare/v1.0.17...v1.1.0) (2017-12-24)



## 1.0.17 (2017-12-03)



