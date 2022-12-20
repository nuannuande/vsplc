console.log("****************");
const modbus = require('jsmodbus');
const net = require('net');
const socket = new net.Socket();
const client = new modbus.client.TCP(socket, 1);
const options = {
    'host': "127.0.0.1",
    'port': 502
};



function init() {
    socket.connect(options);
    socket.on('error', err => {
        console.log(err);
    });
}

function logic() {
    client.readCoils(0, 13).then(function (resp) {
        // resp will look like { response : [TCP|RTU]Response, request: [TCP|RTU]Request }
        // the data will be located in resp.response.body.coils: <Array>, resp.response.body.payload: <Buffer>
        console.log(resp);

    }, console.error);

}
init();

setInterval(() => {
    logic();
}, 1000);