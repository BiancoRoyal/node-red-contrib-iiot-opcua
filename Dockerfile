FROM nodered/node-red:2.2.2-12

USER root

RUN npm install node-red-dashboard \
                node-red-node-pi-gpiod \
                node-red-contrib-gpio  \
                node-red-contrib-ftp \
                node-red-contrib-postgresql \
                node-red-contrib-influxdb \
                node-red-contrib-re-postgres \
                node-red-contrib-protobuf \
                node-red-contrib-mqtt-sparkplug-plus \
                node-red-node-tail \
                node-red-contrib-mssql-plus \
                node-red-node-sqlite \
                node-red-dashboard \
                node-red-contrib-bwar-soap


COPY  opcuaIIoT /opt/node-red-contrib-iiot-opcua/opcuaIIoT
COPY package.json /opt/node-red-contrib-iiot-opcua/
COPY create_certificates.js /opt/node-red-contrib-iiot-opcua/

RUN npm install /opt/node-red-contrib-iiot-opcua


USER node-red