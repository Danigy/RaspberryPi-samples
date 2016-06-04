'use strict';

var readConfig = require('read-config');
var spawn = require("child_process").spawn;

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var config = readConfig('./config.json');
console.log('config=' + JSON.stringify(config));

//var connectionString = 'HostName={host}.azure-devices.net;DeviceId={id};SharedAccessKey={key}';
var connectionString = config.iotHubConnectionString;

console.log(connectionString);
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);

    };
}

var child_process = null;

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
        client.on('message', function (msg) {
            client.complete(msg, printResultFor('completed'));
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
            var cmd = JSON.parse(msg.data);
            console.log('cmd = ' + cmd.name);
            switch (cmd.name) {
                case 'cmd_takepic':
                    child_process = spawn('raspistill',['-o','test.jpg']);
                    console.log('taking picture......');
                    client.complete(msg, printResultFor('completed'));
                    break;
                case 'cmd_streaming':
                    break;
                case 'cmd_shutdown':
                    break;
            }
        });
        // Create a message and send it to the IoT Hub every second
        setInterval(function () {
            //heartbeat
            var data = JSON.stringify({ deviceId: 'mydevice'});
            var message = new Message(data);
            console.log("Sending message: " + message.getData());
            client.sendEvent(message, printResultFor('send'));

        }, 1000);
    }
};
client.open(connectCallback);