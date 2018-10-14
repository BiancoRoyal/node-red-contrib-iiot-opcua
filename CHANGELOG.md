<a name="3.0.0"></a>
# [3.0.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.7.1...v3.0.0) (2018-10-14)

#### BREAKING CHANGES with new node-opcua version 0.4 in output objects and parameters

### Bug Fixes

* **API:** self organised node-opcua ([1cb4760](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/1cb4760))
* **browser:** browse without recursive settings ([5276e76](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/5276e76))
* **browser:** list to read and listen ([98c1700](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/98c1700))
* **browser:** wrong result used ([0db0aac](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/0db0aac))
* **listener:** browser to listener parameters and options ([ee1c7b3](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/ee1c7b3))
* **method:** variable was not declared anymore ([60acae8](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/60acae8))
* code for standard.js ([346dac6](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/346dac6))
* **test:** test did not end while interval was running ([e38e3d1](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/e38e3d1))
* examples namespace since 0.4.4 of node-opcua ([1088074](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/1088074))
* issue  [#54](https://github.com/biancode/node-red-contrib-iiot-opcua/issues/54) - new historyStart and historyEnd option parameter via msg or to set from node options ([abffca0](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/abffca0))
* listener monitored item select from list ([8213bef](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/8213bef))
* **read:** history read ([9c1b2be](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/9c1b2be))
* **test:** failed on Windows 10 and nodejs 9 ([8cef89d](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/8cef89d))
* **test:** with patterns of codacy ([c0b493a](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/c0b493a))
* **tests:** working with the new v0.4.1 of node-opcua ([f8a2bd6](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/f8a2bd6))
* new version node-opcua 0.4.6 to fix grouped monitored items problem ([c922231](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/c922231))
* server delay on shutdown for listener subscriptions ([82ba6f7](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/82ba6f7))
* testing suites ([72adde6](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/72adde6))


### Features

* **browser:** recursive browsing ([de98d78](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/de98d78))
* **browser:** recursive browsing with depth ([5b86688](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/5b86688))
* **crawler:** filter by every key-value pair of the result items ([bd16831](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/bd16831))
* **crawler:** filter by property with a match of string ([e251a45](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/e251a45))
* **listener:** new structure for event fields ([536f314](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/536f314))
* **response:** compressing results ([2cc4504](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/2cc4504))
* **server:** flex server working with new namespace operations ([0664f52](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/0664f52))
* issue [#57](https://github.com/biancode/node-red-contrib-iiot-opcua/issues/57) passing topic for monitored items ([ab8b4ca](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/ab8b4ca))
* new flex-server discovery options ([f5de659](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/f5de659))
* upgrade node-opcua to v0.4.5 ([4d48954](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/4d48954))



<a name="2.7.1"></a>
## [2.7.1](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.6.1...v2.7.1) (2018-05-28)


### Bug Fixes

* **inject:** error on a whole new flow with the address space items list ([cf90fd0](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/cf90fd0))



<a name="2.6.1"></a>
## [2.6.1](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.6.0...v2.6.1) (2018-04-08)


### Bug Fixes

* reconnect handling via FSM states ([9a14424](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/9a14424))



<a name="2.6.0"></a>
# [2.6.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.5.2...v2.6.0) (2018-04-07)



<a name="2.5.2"></a>
## [2.5.2](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.5.1...v2.5.2) (2018-03-31)


### Bug Fixes

* **server:** ASO Demo switch off ([01f7d37](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/01f7d37))



<a name="2.5.1"></a>
## [2.5.1](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.5.0...v2.5.1) (2018-03-29)


### Features

* **connector:** new connection strategy defaults ([afe9837](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/afe9837))



<a name="2.5.0"></a>
# [2.5.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.4.2...v2.5.0) (2018-03-28)


### Bug Fixes

* **node:** issue [#46](https://github.com/biancode/node-red-contrib-iiot-opcua/issues/46) inject type and using payload from events via Node node ([b7c884f](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/b7c884f))
* **nodes:** issues while testing ([7944ea0](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/7944ea0))


### Features

* **connector:** discover for endpoints and endpoint lookup separated ([7a55a54](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/7a55a54))
* **new-browse:** browse to single result from multiple address space itmes ([0dba722](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/0dba722))



<a name="2.4.2"></a>
## [2.4.2](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.4.1...v2.4.2) (2018-03-27)



<a name="2.4.1"></a>
## [2.4.1](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.4.0...v2.4.1) (2018-03-27)


### Bug Fixes

* **connector:** issue [#36](https://github.com/biancode/node-red-contrib-iiot-opcua/issues/36) sessionId not needed and removed ([0a5e1ee](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/0a5e1ee))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.3.3...v2.4.0) (2018-03-26)


### Bug Fixes

* **BadSession:** now reconnecting with a new session ([c7b24aa](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/c7b24aa))
* **connector:** session handling by node-opcua v0.2.2 ([afbaf87](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/afbaf87))
* **connector:** session keepalive, auto select endpoint ([1a1b991](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/1a1b991))


### Features

* **new-lib:** node-opcua v0.2.3 update ([ef046dd](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/ef046dd))
* **new-lib:** node-opcua v0.2.3 update ([ef28e76](https://github.com/biancode/node-red-contrib-iiot-opcua/commit/ef28e76))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.0.12...v2.1.0) (2018-03-05)



<a name="2.0.12"></a>
## [2.0.12](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.0.10...v2.0.12) (2018-03-05)



<a name="2.0.10"></a>
## [2.0.10](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.0.5...v2.0.10) (2018-02-25)



<a name="2.0.5"></a>
## [2.0.5](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.0.4...v2.0.5) (2018-02-20)



<a name="2.0.4"></a>
## [2.0.4](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v2.0.3...v2.0.4) (2018-02-16)



<a name="2.0.3"></a>
## [2.0.3](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v1.3.3...v2.0.3) (2018-02-12)



<a name="1.3.1"></a>
## [1.3.1](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v1.3.0...v1.3.1) (2018-01-07)



<a name="1.1.0"></a>
# [1.1.0](https://github.com/biancode/node-red-contrib-iiot-opcua/compare/v1.0.17...v1.1.0) (2017-12-24)



<a name="1.0.17"></a>
## 1.0.17 (2017-12-03)



